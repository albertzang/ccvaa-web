import { eq } from "drizzle-orm";

import { getMembersDb } from "@/db/client";
import { members } from "@/db/schema";
import {
  sendEmailVerifyOtp,
  verifyDeliveredOtp,
} from "@/lib/members/confirm";
import { requireDatabaseUrl } from "@/lib/members/env";
import { MembersDbError } from "@/lib/members/errors";
import {
  canJoinMembership,
  getCurrentMembership,
  perksActive,
  sessionPlanFromMembership,
} from "@/lib/members/memberships";
import {
  createMemberSessionToken,
  toPublicMemberSession,
  type MemberSessionPayload,
} from "@/lib/members/session";
import { getStripeClient } from "@/lib/members/stripe";
import type { MembershipPlan } from "@/lib/members/zod/membership";
import type { NewsletterStatus } from "@/lib/members/zod/newsletter";
import {
  profileEmailChangeStartSchema,
  profileEmailChangeVerifySchema,
} from "@/lib/members/zod/profile";

export type MemberProfile = {
  memberId: string;
  email: string;
  plan: MembershipPlan;
  membershipStatus: "none" | "active" | "past_due" | "cancelled";
  newsletterStatus: NewsletterStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  perksActive: boolean;
  canJoin: boolean;
};

export class MembersProfileError extends Error {
  readonly code:
    | "MEMBERS_PROFILE_UNAVAILABLE"
    | "MEMBERS_PROFILE_NOT_FOUND"
    | "MEMBERS_PROFILE_EMAIL_TAKEN"
    | "MEMBERS_PROFILE_SAME_EMAIL"
    | "MEMBERS_PROFILE_STRIPE_EMAIL_SYNC_FAILED";

  constructor(
    code: MembersProfileError["code"],
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message);
    this.name = "MembersProfileError";
    this.code = code;
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export function isMembersProfileError(
  error: unknown,
): error is MembersProfileError {
  return (
    error instanceof MembersProfileError ||
    (typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as { name: unknown }).name === "MembersProfileError" &&
      "code" in error &&
      typeof (error as { code: unknown }).code === "string")
  );
}

function formatPeriodEnd(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

async function loadMemberById(memberId: string) {
  const db = getMembersDb();
  try {
    const rows = await db
      .select({
        id: members.id,
        email: members.email,
        newsletterStatus: members.newsletterStatus,
        stripeCustomerId: members.stripeCustomerId,
      })
      .from(members)
      .where(eq(members.id, memberId))
      .limit(1);

    return rows[0] ?? null;
  } catch (error) {
    throw new MembersDbError("Failed to load member profile.", { cause: error });
  }
}

async function buildProfile(row: {
  id: string;
  email: string;
  newsletterStatus: NewsletterStatus;
  stripeCustomerId: string | null;
}): Promise<MemberProfile> {
  const current = await getCurrentMembership(row.id);
  const plan = sessionPlanFromMembership(current);

  return {
    memberId: row.id,
    email: row.email,
    plan,
    membershipStatus: current?.status ?? "none",
    newsletterStatus: row.newsletterStatus,
    currentPeriodEnd:
      plan === "annual" ? formatPeriodEnd(current?.currentPeriodEnd ?? null) : null,
    cancelAtPeriodEnd: current?.cancelAtPeriodEnd ?? false,
    stripeCustomerId: row.stripeCustomerId,
    perksActive: perksActive(current),
    canJoin: canJoinMembership(current),
  };
}

/**
 * When the member has a Stripe Customer ID, billing email must track login email.
 * Fail closed: do not change Neon email if Stripe update fails or Stripe is unavailable.
 */
async function syncStripeCustomerEmail(
  stripeCustomerId: string,
  newEmail: string,
): Promise<void> {
  try {
    const stripe = getStripeClient();
    await stripe.customers.update(stripeCustomerId, { email: newEmail });
  } catch (error) {
    if (isMembersProfileError(error)) {
      throw error;
    }
    throw new MembersProfileError(
      "MEMBERS_PROFILE_STRIPE_EMAIL_SYNC_FAILED",
      "Could not update your billing email with Stripe. Your login email was not changed. Try again later.",
      { cause: error },
    );
  }
}

/** Loads the current member profile from DB. Fails closed without DATABASE_URL. */
export async function getMemberProfileForSession(
  session: MemberSessionPayload,
): Promise<MemberProfile> {
  requireDatabaseUrl();
  const row = await loadMemberById(session.memberId);
  if (!row) {
    throw new MembersProfileError(
      "MEMBERS_PROFILE_NOT_FOUND",
      "No member record found for this session.",
    );
  }
  return buildProfile(row);
}

export function toPublicMemberProfile(
  profile: MemberProfile,
  sessionExp: number,
) {
  return {
    authenticated: true as const,
    memberId: profile.memberId,
    email: profile.email,
    plan: profile.plan,
    membershipStatus: profile.membershipStatus,
    newsletterStatus: profile.newsletterStatus,
    currentPeriodEnd: profile.currentPeriodEnd,
    cancelAtPeriodEnd: profile.cancelAtPeriodEnd,
    stripeCustomerId: profile.stripeCustomerId,
    perksActive: profile.perksActive,
    canJoin: profile.canJoin,
    expiresAt: new Date(sessionExp).toISOString(),
    grantsAdmin: false as const,
  };
}

async function refreshSessionAfterProfileUpdate(profile: MemberProfile) {
  const { token, expiresAt, payload } = createMemberSessionToken({
    memberId: profile.memberId,
    email: profile.email,
    plan: profile.plan,
  });
  return {
    token,
    expiresAt,
    profile,
    session: toPublicMemberProfile(profile, payload.exp),
    publicSession: toPublicMemberSession(payload),
  };
}

async function assertEmailAvailable(email: string, memberId: string) {
  const db = getMembersDb();
  try {
    const rows = await db
      .select({ id: members.id })
      .from(members)
      .where(eq(members.email, email))
      .limit(1);
    const existing = rows[0];
    if (existing && existing.id !== memberId) {
      throw new MembersProfileError(
        "MEMBERS_PROFILE_EMAIL_TAKEN",
        "That email is already associated with another account.",
      );
    }
  } catch (error) {
    if (isMembersProfileError(error)) {
      throw error;
    }
    throw new MembersDbError("Failed to check email availability.", {
      cause: error,
    });
  }
}

/** Sends email OTP to the new address before changing identity email. */
export async function startMemberProfileEmailChange(
  session: MemberSessionPayload,
  input: unknown,
) {
  requireDatabaseUrl();
  const parsed = profileEmailChangeStartSchema.parse(input);
  const newEmail = parsed.newEmail.trim().toLowerCase();

  if (newEmail === session.email) {
    throw new MembersProfileError(
      "MEMBERS_PROFILE_SAME_EMAIL",
      "That is already the email on your membership.",
    );
  }

  const row = await loadMemberById(session.memberId);
  if (!row) {
    throw new MembersProfileError(
      "MEMBERS_PROFILE_NOT_FOUND",
      "No member record found for this session.",
    );
  }

  await assertEmailAvailable(newEmail, session.memberId);

  const delivered = await sendEmailVerifyOtp(newEmail);
  return {
    newEmail: delivered.email,
    message:
      "We emailed a 6-digit code to your new address. Enter it below to confirm the change.",
    expiresAt: delivered.expiresAt.toISOString(),
  };
}

/** Verifies OTP on the new email and updates the member identity email. */
export async function verifyMemberProfileEmailChange(
  session: MemberSessionPayload,
  input: unknown,
) {
  requireDatabaseUrl();
  const parsed = profileEmailChangeVerifySchema.parse(input);
  const newEmail = parsed.newEmail.trim().toLowerCase();

  if (newEmail === session.email) {
    throw new MembersProfileError(
      "MEMBERS_PROFILE_SAME_EMAIL",
      "That is already the email on your membership.",
    );
  }

  const row = await loadMemberById(session.memberId);
  if (!row) {
    throw new MembersProfileError(
      "MEMBERS_PROFILE_NOT_FOUND",
      "No member record found for this session.",
    );
  }

  await verifyDeliveredOtp({
    email: newEmail,
    code: parsed.code,
  });

  await assertEmailAvailable(newEmail, session.memberId);

  if (row.stripeCustomerId) {
    await syncStripeCustomerEmail(row.stripeCustomerId, newEmail);
  }

  const db = getMembersDb();
  try {
    await db
      .update(members)
      .set({ email: newEmail, updatedAt: new Date() })
      .where(eq(members.id, session.memberId));
  } catch (error) {
    throw new MembersDbError("Failed to update member email.", { cause: error });
  }

  const profile = await buildProfile({ ...row, email: newEmail });
  return refreshSessionAfterProfileUpdate(profile);
}
