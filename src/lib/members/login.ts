import { and, eq, ne } from "drizzle-orm";

import { getMembersDb } from "@/db/client";
import { members } from "@/db/schema";
import { sendLoginOtp, verifyLoginOtp } from "@/lib/members/confirm";
import { requireDatabaseUrl } from "@/lib/members/env";
import { MembersDbError } from "@/lib/members/errors";
import {
  createMemberSessionToken,
  requireMemberSessionSecret,
  toPublicMemberSession,
  type MemberSessionPayload,
} from "@/lib/members/session";
import {
  loginStartInputSchema,
  loginVerifyInputSchema,
  type LoginStartInput,
  type LoginVerifyInput,
} from "@/lib/members/zod/login";
import type { MembershipPlan } from "@/lib/members/zod/membership";

export class MembersLoginError extends Error {
  readonly code:
    | "MEMBERS_LOGIN_NOT_ELIGIBLE"
    | "MEMBERS_LOGIN_UNAVAILABLE";

  constructor(
    code: MembersLoginError["code"],
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message);
    this.name = "MembersLoginError";
    this.code = code;
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export function isMembersLoginError(
  error: unknown,
): error is MembersLoginError {
  return (
    error instanceof MembersLoginError ||
    (typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as { name: unknown }).name === "MembersLoginError" &&
      "code" in error &&
      ((error as { code: unknown }).code === "MEMBERS_LOGIN_NOT_ELIGIBLE" ||
        (error as { code: unknown }).code === "MEMBERS_LOGIN_UNAVAILABLE"))
  );
}

type ActiveMemberRow = {
  id: string;
  email: string;
  name: string | null;
  membershipPlan: MembershipPlan;
};

async function findActivePaidMember(
  email: string,
): Promise<ActiveMemberRow | null> {
  const db = getMembersDb();
  try {
    const rows = await db
      .select({
        id: members.id,
        email: members.email,
        name: members.name,
        membershipPlan: members.membershipPlan,
      })
      .from(members)
      .where(
        and(
          eq(members.email, email),
          eq(members.membershipStatus, "active"),
          ne(members.membershipPlan, "none"),
        ),
      )
      .limit(1);

    const row = rows[0];
    if (!row || row.membershipPlan === "none") {
      return null;
    }
    return row;
  } catch (error) {
    throw new MembersDbError("Failed to look up member for login.", {
      cause: error,
    });
  }
}

/**
 * Starts member login: requires an active paid member, then sends a login OTP.
 * Fails closed without DATABASE_URL / RESEND / MEMBER_SESSION_SECRET.
 */
export async function startMemberLogin(
  input: LoginStartInput | unknown,
): Promise<{ email: string; message: string; expiresAt: string }> {
  requireDatabaseUrl();
  requireMemberSessionSecret();

  const parsed = loginStartInputSchema.parse(input);
  const email = parsed.email.trim().toLowerCase();

  const member = await findActivePaidMember(email);
  if (!member) {
    throw new MembersLoginError(
      "MEMBERS_LOGIN_NOT_ELIGIBLE",
      "No active membership found for this email. Join CCVAA first, or use the email on your membership.",
    );
  }

  const delivered = await sendLoginOtp(email);
  return {
    email: delivered.email,
    message:
      "We emailed a 6-digit login code. Enter it below to open your membership.",
    expiresAt: delivered.expiresAt.toISOString(),
  };
}

/**
 * Verifies login OTP and returns a signed session payload + token to set as cookie.
 * Does not grant `/admin`.
 */
export async function verifyMemberLogin(
  input: LoginVerifyInput | unknown,
): Promise<{
  token: string;
  expiresAt: Date;
  session: ReturnType<typeof toPublicMemberSession>;
  payload: MemberSessionPayload;
}> {
  requireDatabaseUrl();
  requireMemberSessionSecret();

  const parsed = loginVerifyInputSchema.parse(input);
  const email = parsed.email.trim().toLowerCase();

  await verifyLoginOtp({
    email,
    code: parsed.code,
  });

  const member = await findActivePaidMember(email);
  if (!member) {
    throw new MembersLoginError(
      "MEMBERS_LOGIN_NOT_ELIGIBLE",
      "No active membership found for this email.",
    );
  }

  const { token, expiresAt, payload } = createMemberSessionToken({
    memberId: member.id,
    email: member.email,
    name: member.name,
    plan: member.membershipPlan as Exclude<MembershipPlan, "none">,
  });

  return {
    token,
    expiresAt,
    payload,
    session: toPublicMemberSession(payload),
  };
}
