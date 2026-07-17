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
  createMemberSessionToken,
  toPublicMemberSession,
  type MemberSessionPayload,
} from "@/lib/members/session";
import type { MembershipPlan } from "@/lib/members/zod/membership";
import type { NewsletterStatus } from "@/lib/members/zod/newsletter";
import {
  profileEmailChangeStartSchema,
  profileEmailChangeVerifySchema,
  profileNameUpdateSchema,
} from "@/lib/members/zod/profile";

export type MemberProfile = {
  memberId: string;
  email: string;
  name: string | null;
  plan: MembershipPlan;
  newsletterStatus: NewsletterStatus;
  membershipAnniversary: string | null;
  nextRenewalAt: string | null;
};

export class MembersProfileError extends Error {
  readonly code:
    | "MEMBERS_PROFILE_UNAVAILABLE"
    | "MEMBERS_PROFILE_NOT_FOUND"
    | "MEMBERS_PROFILE_EMAIL_TAKEN"
    | "MEMBERS_PROFILE_SAME_EMAIL";

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

function formatAnniversary(value: string | Date | null): string | null {
  if (value === null) {
    return null;
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return value;
}

function formatRenewal(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function rowToProfile(row: {
  id: string;
  email: string;
  name: string | null;
  membershipPlan: MembershipPlan;
  newsletterStatus: NewsletterStatus;
  membershipAnniversary: string | Date | null;
  nextRenewalAt: Date | null;
}): MemberProfile {
  const plan = row.membershipPlan;
  const isAnnual = plan === "annual";

  return {
    memberId: row.id,
    email: row.email,
    name: row.name,
    plan,
    newsletterStatus: row.newsletterStatus,
    membershipAnniversary: isAnnual
      ? formatAnniversary(row.membershipAnniversary)
      : null,
    nextRenewalAt: isAnnual ? formatRenewal(row.nextRenewalAt) : null,
  };
}

async function loadMemberById(memberId: string) {
  const db = getMembersDb();
  try {
    const rows = await db
      .select({
        id: members.id,
        email: members.email,
        name: members.name,
        membershipPlan: members.membershipPlan,
        newsletterStatus: members.newsletterStatus,
        membershipAnniversary: members.membershipAnniversary,
        nextRenewalAt: members.nextRenewalAt,
      })
      .from(members)
      .where(eq(members.id, memberId))
      .limit(1);

    return rows[0] ?? null;
  } catch (error) {
    throw new MembersDbError("Failed to load member profile.", { cause: error });
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
  return rowToProfile(row);
}

export function toPublicMemberProfile(
  profile: MemberProfile,
  sessionExp: number,
) {
  return {
    authenticated: true as const,
    memberId: profile.memberId,
    email: profile.email,
    name: profile.name,
    plan: profile.plan,
    newsletterStatus: profile.newsletterStatus,
    membershipAnniversary: profile.membershipAnniversary,
    nextRenewalAt: profile.nextRenewalAt,
    expiresAt: new Date(sessionExp).toISOString(),
    grantsAdmin: false as const,
  };
}

async function refreshSessionAfterProfileUpdate(profile: MemberProfile) {
  const { token, expiresAt, payload } = createMemberSessionToken({
    memberId: profile.memberId,
    email: profile.email,
    name: profile.name,
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

/** Updates display name for the signed-in member. */
export async function updateMemberProfileName(
  session: MemberSessionPayload,
  input: unknown,
) {
  requireDatabaseUrl();
  const parsed = profileNameUpdateSchema.parse(input);
  const row = await loadMemberById(session.memberId);
  if (!row) {
    throw new MembersProfileError(
      "MEMBERS_PROFILE_NOT_FOUND",
      "No member record found for this session.",
    );
  }

  const db = getMembersDb();
  try {
    await db
      .update(members)
      .set({ name: parsed.name, updatedAt: new Date() })
      .where(eq(members.id, session.memberId));
  } catch (error) {
    throw new MembersDbError("Failed to update member name.", { cause: error });
  }

  const profile = rowToProfile({ ...row, name: parsed.name });
  return refreshSessionAfterProfileUpdate(profile);
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

/** Sends email_verify OTP to the new address before changing identity email. */
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
    purpose: "email_verify",
    code: parsed.code,
  });

  await assertEmailAvailable(newEmail, session.memberId);

  const db = getMembersDb();
  try {
    await db
      .update(members)
      .set({ email: newEmail, updatedAt: new Date() })
      .where(eq(members.id, session.memberId));
  } catch (error) {
    throw new MembersDbError("Failed to update member email.", { cause: error });
  }

  const profile = rowToProfile({ ...row, email: newEmail });
  return refreshSessionAfterProfileUpdate(profile);
}
