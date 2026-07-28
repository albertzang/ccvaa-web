import { eq } from "drizzle-orm";

import { getMembersDb } from "@/db/client";
import { members } from "@/db/schema";
import {
  sendEmailVerifyOtp,
  verifyDeliveredOtp,
} from "@/lib/members/confirm";
import { requireDatabaseUrl } from "@/lib/members/env";
import { MembersDbError, withMembersDbError } from "@/lib/members/errors";
import {
  getCurrentMembership,
  sessionPlanFromMembership,
} from "@/lib/members/memberships";
import {
  getMemberProfileForSession,
  toPublicMemberProfile,
} from "@/lib/members/profile";
import {
  createMemberSessionToken,
  requireMemberSessionSecret,
  toPublicMemberSession,
  type MemberSessionPayload,
} from "@/lib/members/session";
import {
  verifyEmailConfirmInputSchema,
  verifyEmailStartInputSchema,
  type VerifyEmailConfirmInput,
  type VerifyEmailStartInput,
} from "@/lib/members/zod/verify-email";
import type { MembershipPlan } from "@/lib/members/zod/membership";

/**
 * Starts email verification for the membership portal gate.
 * Does not upsert yet — member row is created on confirm.
 */
export async function startEmailVerification(
  input: VerifyEmailStartInput | unknown,
): Promise<{ email: string; message: string; expiresAt: string }> {
  requireDatabaseUrl();
  requireMemberSessionSecret();

  const parsed = verifyEmailStartInputSchema.parse(input);
  const email = parsed.email.trim().toLowerCase();

  const delivered = await sendEmailVerifyOtp(email);
  return {
    email: delivered.email,
    message:
      "We emailed a 6-digit code. Enter it below to verify your email.",
    expiresAt: delivered.expiresAt.toISOString(),
  };
}

/**
 * Verifies OTP, upserts `members` (UUID PK; email unique), and mints a verified
 * session bound to Member ID. New rows default newsletter **off**.
 */
export async function confirmEmailVerification(
  input: VerifyEmailConfirmInput | unknown,
): Promise<{
  token: string;
  expiresAt: Date;
  session: ReturnType<typeof toPublicMemberSession>;
  profile: ReturnType<typeof toPublicMemberProfile>;
  payload: MemberSessionPayload;
  message: string;
}> {
  requireDatabaseUrl();
  requireMemberSessionSecret();

  const parsed = verifyEmailConfirmInputSchema.parse(input);
  const email = parsed.email.trim().toLowerCase();

  await verifyDeliveredOtp({
    email,
    code: parsed.code,
  });

  const member = await upsertVerifiedMember({ email });

  const { token, expiresAt, payload } = createMemberSessionToken({
    memberId: member.id,
    email: member.email,
    plan: member.plan,
  });

  const profile = await getMemberProfileForSession(payload);

  return {
    token,
    expiresAt,
    payload,
    session: toPublicMemberSession(payload),
    profile: toPublicMemberProfile(profile, payload.exp),
    message: "Email verified. You can manage newsletter and membership below.",
  };
}

async function upsertVerifiedMember(input: { email: string }): Promise<{
  id: string;
  email: string;
  plan: MembershipPlan;
}> {
  return withMembersDbError(async () => {
    const db = getMembersDb();
    const existing = await db
      .select({
        id: members.id,
        email: members.email,
      })
      .from(members)
      .where(eq(members.email, input.email))
      .limit(1);

    const row = existing[0];
    const now = new Date();

    if (row) {
      await db
        .update(members)
        .set({ updatedAt: now })
        .where(eq(members.id, row.id));
      const current = await getCurrentMembership(row.id);
      return {
        id: row.id,
        email: row.email,
        plan: sessionPlanFromMembership(current),
      };
    }

    const inserted = await db
      .insert(members)
      .values({
        email: input.email,
        newsletterStatus: "off",
      })
      .returning({
        id: members.id,
        email: members.email,
      });

    const created = inserted[0];
    if (!created) {
      throw new MembersDbError("Failed to create member after email verify.");
    }
    return {
      id: created.id,
      email: created.email,
      plan: "none",
    };
  }, "Failed to upsert member after email verification.");
}
