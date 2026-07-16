import { and, eq, isNull, sql } from "drizzle-orm";

import { getMembersDb } from "@/db/client";
import { members, unsubTokens } from "@/db/schema";
import {
  sendNewsletterConfirmOtp,
  verifyNewsletterConfirmOtp,
} from "@/lib/members/confirm";
import { generateUnsubToken } from "@/lib/members/crypto";
import {
  MembersDbError,
  withMembersDbError,
} from "@/lib/members/errors";
import { syncNewsletterToEsp } from "@/lib/members/esp";
import {
  isResendConfigured,
  MembersEmailError,
} from "@/lib/members/resend";
import {
  newsletterConfirmInputSchema,
  newsletterLookupInputSchema,
  newsletterSubscribeInputSchema,
  newsletterUnsubscribeInputSchema,
  type NewsletterPreference,
  type NewsletterSubscribeInput,
} from "@/lib/members/zod/newsletter";
import { unsubTokenRedeemInputSchema } from "@/lib/members/zod/unsub-token";

export type NewsletterSubscribeResult = {
  email: string;
  status: "pending";
  message: string;
};

export type NewsletterConfirmResult = {
  email: string;
  status: "on";
  message: string;
};

export type NewsletterUnsubscribeResult = {
  email: string;
  status: "off";
  message: string;
  membershipUnchanged: true;
};

export type UnsubTokenRedeemResult = {
  email: string;
  status: "off";
  alreadyUnsubscribed: boolean;
  membershipUnchanged: true;
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

async function upsertMemberForNewsletter(
  email: string,
  name: string,
): Promise<string> {
  return withMembersDbError(async () => {
    const db = getMembersDb();
    const existing = await findMemberByEmail(email);

    if (existing) {
      await db
        .update(members)
        .set({
          name,
          newsletterStatus: "pending",
          newsletterConfirmedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(members.id, existing.id));
      return existing.id;
    }

    const inserted = await db
      .insert(members)
      .values({
        email,
        name,
        newsletterStatus: "pending",
      })
      .returning({ id: members.id });

    const row = inserted[0];
    if (!row) {
      throw new MembersDbError("Failed to create member record for newsletter.");
    }
    return row.id;
  }, "Failed to update newsletter subscription.");
}

async function ensureUnsubToken(memberId: string): Promise<string> {
  return withMembersDbError(async () => {
    const db = getMembersDb();
    const existing = await db
      .select({ token: unsubTokens.token })
      .from(unsubTokens)
      .where(
        and(eq(unsubTokens.memberId, memberId), isNull(unsubTokens.usedAt)),
      )
      .limit(1);

    if (existing[0]) {
      return existing[0].token;
    }

    const token = generateUnsubToken();
    await db.insert(unsubTokens).values({ memberId, token });
    return token;
  }, "Failed to create newsletter unsubscribe token.");
}

function toNewsletterPreference(
  row: Pick<
    typeof members.$inferSelect,
    "newsletterStatus" | "newsletterConfirmedAt"
  >,
): NewsletterPreference {
  return {
    status: row.newsletterStatus,
    confirmedAt: row.newsletterConfirmedAt,
  };
}

/** Counts confirmed newsletter subscribers (`status = on`). Pending does not count. */
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

/** Starts double opt-in: upserts member as pending and sends confirm OTP via Resend. */
export async function subscribeToNewsletter(
  input: NewsletterSubscribeInput,
): Promise<NewsletterSubscribeResult> {
  const parsed = newsletterSubscribeInputSchema.parse(input);
  const email = parsed.email.trim().toLowerCase();

  // Fail closed before DB writes when Resend is missing (clear 503 via http mapper).
  if (!isResendConfigured()) {
    throw new MembersEmailError(
      "MEMBERS_EMAIL_UNAVAILABLE",
      "RESEND_API_KEY / RESEND_FROM_EMAIL are not configured. Newsletter subscribe is unavailable.",
    );
  }

  const member = await findMemberByEmail(email);
  if (member?.newsletterStatus === "on") {
    throw new MembersNewsletterError(
      "MEMBERS_NEWSLETTER_ALREADY_SUBSCRIBED",
      "This email is already subscribed to our newsletter. Use manage preference to update your settings.",
    );
  }

  await upsertMemberForNewsletter(email, parsed.name);
  await sendNewsletterConfirmOtp(email);

  return {
    email,
    status: "pending",
    message:
      "Check your email for a 6-digit confirmation code. You are not subscribed until you confirm.",
  };
}

/** Confirms double opt-in OTP and activates newsletter preference. */
export async function confirmNewsletterSubscription(
  input: unknown,
): Promise<NewsletterConfirmResult> {
  const parsed = newsletterConfirmInputSchema.parse(input);
  const email = parsed.email.trim().toLowerCase();

  await verifyNewsletterConfirmOtp({ email, code: parsed.code });

  const member = await findMemberByEmail(email);
  if (!member) {
    throw new MembersDbError("Member record not found after OTP verification.");
  }

  const now = new Date();
  await withMembersDbError(async () => {
    const db = getMembersDb();
    await db
      .update(members)
      .set({
        newsletterStatus: "on",
        newsletterConfirmedAt: now,
        updatedAt: now,
      })
      .where(eq(members.id, member.id));
  }, "Failed to confirm newsletter subscription.");

  await ensureUnsubToken(member.id);
  await syncNewsletterToEsp({ email, status: "on" });

  return {
    email,
    status: "on",
    message:
      "You are subscribed to the CCVAA newsletter. This is separate from paid membership.",
  };
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
      preference: { status: "off", confirmedAt: null },
    };
  }

  return {
    email,
    preference: toNewsletterPreference(member),
  };
}

/**
 * Unsubscribes from the newsletter via Contact manage UI.
 * Never changes membership plan or status.
 */
export async function unsubscribeFromNewsletter(
  input: unknown,
): Promise<NewsletterUnsubscribeResult> {
  const parsed = newsletterUnsubscribeInputSchema.parse(input);
  const email = parsed.email.trim().toLowerCase();

  const member = await findMemberByEmail(email);
  if (!member || member.newsletterStatus === "off") {
    return {
      email,
      status: "off",
      message: "You are not subscribed to the newsletter.",
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
    message:
      "You have been unsubscribed from the newsletter. Your paid membership, if any, is unchanged.",
    membershipUnchanged: true,
  };
}

/**
 * Redeems a tokenized unsubscribe link (`/?unsub=<token>#contact`).
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
        tokenId: unsubTokens.id,
        usedAt: unsubTokens.usedAt,
        memberId: unsubTokens.memberId,
        email: members.email,
        newsletterStatus: members.newsletterStatus,
        membershipPlan: members.membershipPlan,
        membershipStatus: members.membershipStatus,
      })
      .from(unsubTokens)
      .innerJoin(members, eq(unsubTokens.memberId, members.id))
      .where(eq(unsubTokens.token, parsed.token))
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

  if (!row.usedAt) {
    await withMembersDbError(async () => {
      const db = getMembersDb();
      await db
        .update(unsubTokens)
        .set({ usedAt: now })
        .where(eq(unsubTokens.id, row.tokenId));
    }, "Failed to mark unsubscribe token used.");
  }

  return {
    email: row.email,
    status: "off",
    alreadyUnsubscribed: alreadyOff,
    membershipUnchanged: true,
  };
}

/**
 * Activates newsletter after an already-verified email (e.g. Join OTP).
 * Does not send a second confirm mail — Contact-only subscribe stays double opt-in.
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
        newsletterConfirmedAt: now,
        updatedAt: now,
      })
      .where(eq(members.id, member.id));
  }, "Failed to activate newsletter after verified Join.");

  await ensureUnsubToken(member.id);
  await syncNewsletterToEsp({ email: normalized, status: "on" });
}

export class MembersNewsletterError extends Error {
  readonly code:
    | "MEMBERS_UNSUB_INVALID"
    | "MEMBERS_NEWSLETTER_ALREADY_SUBSCRIBED";

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