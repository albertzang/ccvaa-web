import { eq, sql } from "drizzle-orm";

import { getMembersDb } from "@/db/client";
import { members } from "@/db/schema";
import { generateUnsubToken } from "@/lib/members/crypto";
import {
  MembersDbError,
  withMembersDbError,
} from "@/lib/members/errors";
import { syncNewsletterToEsp } from "@/lib/members/esp";
import {
  getCurrentMembership,
  sessionPlanFromMembership,
} from "@/lib/members/memberships";
import type { MemberSessionPayload } from "@/lib/members/session";
import type { MembershipPlan } from "@/lib/members/zod/membership";
import {
  newsletterLookupInputSchema,
  newsletterSessionPreferenceSchema,
  newsletterUnsubscribeInputSchema,
  type NewsletterPreference,
} from "@/lib/members/zod/newsletter";
import { unsubTokenRedeemInputSchema } from "@/lib/members/zod/unsub-token";

export type NewsletterUnsubscribeOutcome =
  | "unsubscribed"
  | "already_off"
  | "unknown";

export type NewsletterUnsubscribeResult = {
  email: string;
  status: "off";
  outcome: NewsletterUnsubscribeOutcome;
  message: string;
  membershipUnchanged: true;
};

export type UnsubTokenRedeemResult = {
  email: string;
  status: "off";
  alreadyUnsubscribed: boolean;
  membershipUnchanged: true;
  memberId: string;
  plan: MembershipPlan;
};

export type NewsletterSessionPreferenceResult = {
  email: string;
  status: "on" | "off";
  preference: NewsletterPreference;
  membershipUnchanged: true;
  message: string;
};

async function findMemberByEmail(email: string) {
  return withMembersDbError(async () => {
    const db = getMembersDb();
    const rows = await db
      .select()
      .from(members)
      .where(eq(members.email, email))
      .limit(1);
    return rows[0] ?? null;
  }, "Failed to look up newsletter preference.");
}

/** Ensures a lifelong unsub token on the member row; returns the token. */
async function ensureUnsubToken(memberId: string): Promise<string> {
  return withMembersDbError(async () => {
    const db = getMembersDb();
    const existing = await db
      .select({ unsubToken: members.unsubToken })
      .from(members)
      .where(eq(members.id, memberId))
      .limit(1);

    const current = existing[0]?.unsubToken;
    if (current) {
      return current;
    }

    const token = generateUnsubToken();
    await db
      .update(members)
      .set({ unsubToken: token, updatedAt: new Date() })
      .where(eq(members.id, memberId));
    return token;
  }, "Failed to create newsletter unsubscribe token.");
}

function toNewsletterPreference(
  status: "off" | "on",
): NewsletterPreference {
  return { status };
}

/** Counts confirmed newsletter subscribers (`status = on`). */
export async function countNewsletterSubscribers(): Promise<number> {
  return withMembersDbError(async () => {
    const db = getMembersDb();
    const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(members)
      .where(eq(members.newsletterStatus, "on"));
    return rows[0]?.count ?? 0;
  }, "Failed to count newsletter subscribers.");
}

/** Returns newsletter preference for an email (manage flow). */
export async function lookupNewsletterPreference(
  input: unknown,
): Promise<{ email: string; preference: NewsletterPreference }> {
  const parsed = newsletterLookupInputSchema.parse(input);
  const email = parsed.email.trim().toLowerCase();

  const member = await findMemberByEmail(email);
  if (!member) {
    return {
      email,
      preference: { status: "off" },
    };
  }

  return {
    email,
    preference: toNewsletterPreference(member.newsletterStatus),
  };
}

/**
 * Unsubscribes from the newsletter via email (legacy path).
 * Never changes membership plan or status.
 */
export async function unsubscribeFromNewsletter(
  input: unknown,
): Promise<NewsletterUnsubscribeResult> {
  const parsed = newsletterUnsubscribeInputSchema.parse(input);
  const email = parsed.email.trim().toLowerCase();

  const member = await findMemberByEmail(email);
  if (!member) {
    return {
      email,
      status: "off",
      outcome: "unknown",
      message:
        "We could not find a newsletter subscription for that email.",
      membershipUnchanged: true,
    };
  }

  if (member.newsletterStatus === "off") {
    return {
      email,
      status: "off",
      outcome: "already_off",
      message:
        "You are already unsubscribed from the newsletter.",
      membershipUnchanged: true,
    };
  }

  const now = new Date();
  await withMembersDbError(async () => {
    const db = getMembersDb();
    await db
      .update(members)
      .set({
        newsletterStatus: "off",
        updatedAt: now,
      })
      .where(eq(members.id, member.id));
  }, "Failed to unsubscribe from newsletter.");

  await syncNewsletterToEsp({ email, status: "off" });

  return {
    email,
    status: "off",
    outcome: "unsubscribed",
    message:
      "You have been unsubscribed from the newsletter.",
    membershipUnchanged: true,
  };
}

/**
 * Session-authenticated newsletter on/off. No OTP while the verified session is active.
 * Never changes membership.
 */
export async function updateNewsletterPreferenceForSession(
  session: MemberSessionPayload,
  input: unknown,
): Promise<NewsletterSessionPreferenceResult> {
  const parsed = newsletterSessionPreferenceSchema.parse(input);
  const now = new Date();

  const member = await withMembersDbError(async () => {
    const db = getMembersDb();
    const rows = await db
      .select()
      .from(members)
      .where(eq(members.id, session.memberId))
      .limit(1);
    return rows[0] ?? null;
  }, "Failed to load newsletter preference for session.");

  if (!member) {
    throw new MembersDbError("Member record not found for session.");
  }

  if (parsed.status === "on") {
    await withMembersDbError(async () => {
      const db = getMembersDb();
      await db
        .update(members)
        .set({
          newsletterStatus: "on",
          updatedAt: now,
        })
        .where(eq(members.id, member.id));
    }, "Failed to enable newsletter preference.");

    await ensureUnsubToken(member.id);
    await syncNewsletterToEsp({ email: member.email, status: "on" });

    return {
      email: member.email,
      status: "on",
      preference: { status: "on" },
      membershipUnchanged: true,
      message:
        "You are subscribed to the CCVAA newsletter.",
    };
  }

  await withMembersDbError(async () => {
    const db = getMembersDb();
    await db
      .update(members)
      .set({
        newsletterStatus: "off",
        updatedAt: now,
      })
      .where(eq(members.id, member.id));
  }, "Failed to disable newsletter preference.");

  await syncNewsletterToEsp({ email: member.email, status: "off" });

  return {
    email: member.email,
    status: "off",
    preference: { status: "off" },
    membershipUnchanged: true,
    message:
      "You are unsubscribed from the CCVAA newsletter.",
  };
}

/**
 * Redeems a lifelong unsubscribe token (`/?unsub=<token>#membership`).
 * Idempotent — safe to reload. Never changes membership.
 */
export async function redeemUnsubToken(
  input: unknown,
): Promise<UnsubTokenRedeemResult> {
  const parsed = unsubTokenRedeemInputSchema.parse(input);

  const row = await withMembersDbError(async () => {
    const db = getMembersDb();
    const tokenRows = await db
      .select({
        memberId: members.id,
        email: members.email,
        newsletterStatus: members.newsletterStatus,
      })
      .from(members)
      .where(eq(members.unsubToken, parsed.token))
      .limit(1);
    return tokenRows[0] ?? null;
  }, "Failed to redeem newsletter unsubscribe token.");

  if (!row) {
    throw new MembersNewsletterError(
      "MEMBERS_UNSUB_INVALID",
      "This unsubscribe link is invalid or has expired.",
    );
  }

  const alreadyOff = row.newsletterStatus === "off";
  const now = new Date();

  if (!alreadyOff) {
    await withMembersDbError(async () => {
      const db = getMembersDb();
      await db
        .update(members)
        .set({ newsletterStatus: "off", updatedAt: now })
        .where(eq(members.id, row.memberId));
    }, "Failed to unsubscribe via token.");
    await syncNewsletterToEsp({ email: row.email, status: "off" });
  }

  const current = await getCurrentMembership(row.memberId);

  return {
    email: row.email,
    status: "off",
    alreadyUnsubscribed: alreadyOff,
    membershipUnchanged: true,
    memberId: row.memberId,
    plan: sessionPlanFromMembership(current),
  };
}

/**
 * Activates newsletter after an already-verified email (e.g. Join metadata).
 * Does not send a confirm mail.
 */
export async function activateNewsletterFromVerifiedEmail(
  email: string,
): Promise<void> {
  const normalized = email.trim().toLowerCase();
  const member = await findMemberByEmail(normalized);
  if (!member || member.newsletterStatus === "on") {
    return;
  }

  const now = new Date();
  await withMembersDbError(async () => {
    const db = getMembersDb();
    await db
      .update(members)
      .set({
        newsletterStatus: "on",
        updatedAt: now,
      })
      .where(eq(members.id, member.id));
  }, "Failed to activate newsletter after verified Join.");

  await ensureUnsubToken(member.id);
  await syncNewsletterToEsp({ email: normalized, status: "on" });
}

export class MembersNewsletterError extends Error {
  readonly code: "MEMBERS_UNSUB_INVALID";

  constructor(code: MembersNewsletterError["code"], message: string) {
    super(message);
    this.name = "MembersNewsletterError";
    this.code = code;
  }
}

export function isMembersNewsletterError(
  error: unknown,
): error is MembersNewsletterError {
  return error instanceof MembersNewsletterError;
}
