import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";

import { getMembersDb } from "@/db/client";
import { otpChallenges } from "@/db/schema";
import { generateOtpCode, hashOtpCode } from "@/lib/members/crypto";
import {
  MembersDbError,
  withMembersDbError,
} from "@/lib/members/errors";
import {
  OTP_MAX_CHALLENGES_PER_WINDOW,
  OTP_MAX_VERIFY_ATTEMPTS,
  OTP_RATE_LIMIT_WINDOW_MS,
  OTP_TTL_MS,
} from "@/lib/members/otp-config";
import {
  otpChallengeCreateSchema,
  otpVerifyInputSchema,
  type OtpVerifyInput,
} from "@/lib/members/zod/otp";

export class MembersOtpError extends Error {
  readonly code:
    | "MEMBERS_OTP_INVALID"
    | "MEMBERS_OTP_EXPIRED"
    | "MEMBERS_OTP_EXHAUSTED"
    | "MEMBERS_OTP_NOT_FOUND";

  constructor(
    code: MembersOtpError["code"],
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message);
    this.name = "MembersOtpError";
    this.code = code;
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export class MembersRateLimitError extends Error {
  readonly code = "MEMBERS_RATE_LIMITED" as const;

  constructor(message: string) {
    super(message);
    this.name = "MembersRateLimitError";
  }
}

export type CreateOtpChallengeResult = {
  challengeId: string;
  /** Plain OTP — only for immediate email delivery; never log or persist. */
  code: string;
  expiresAt: Date;
};

export type VerifyOtpChallengeResult = {
  challengeId: string;
  email: string;
};

async function countRecentChallenges(email: string): Promise<number> {
  return withMembersDbError(async () => {
    const db = getMembersDb();
    const windowStart = new Date(Date.now() - OTP_RATE_LIMIT_WINDOW_MS);

    const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(otpChallenges)
      .where(
        and(
          eq(otpChallenges.email, email),
          gt(otpChallenges.createdAt, windowStart),
        ),
      );

    return rows[0]?.count ?? 0;
  }, "Failed to check OTP rate limit.");
}

/**
 * Creates a DB-backed OTP challenge with expiry. Enforces per-email rate limits.
 * Returns the plain code for the caller to send via Resend (do not log).
 */
export async function createOtpChallenge(input: {
  email: string;
}): Promise<CreateOtpChallengeResult> {
  const email = input.email.trim().toLowerCase();

  const recentCount = await countRecentChallenges(email);
  if (recentCount >= OTP_MAX_CHALLENGES_PER_WINDOW) {
    throw new MembersRateLimitError(
      `Too many OTP requests for ${email}. Try again later.`,
    );
  }

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  const parsed = otpChallengeCreateSchema.parse({
    email,
    codeHash: hashOtpCode(code),
    expiresAt,
  });

  return withMembersDbError(async () => {
    const db = getMembersDb();
    const inserted = await db
      .insert(otpChallenges)
      .values({
        email: parsed.email,
        codeHash: parsed.codeHash,
        expiresAt: parsed.expiresAt,
      })
      .returning({
        id: otpChallenges.id,
        expiresAt: otpChallenges.expiresAt,
      });

    const row = inserted[0];
    if (!row) {
      throw new MembersDbError("Failed to create OTP challenge.");
    }

    return {
      challengeId: row.id,
      code,
      expiresAt: row.expiresAt,
    };
  }, "Failed to create OTP challenge.");
}

/**
 * Verifies a submitted OTP against the latest active challenge for the email.
 * Increments attempt count on failure; marks challenge consumed on success.
 */
export async function verifyOtpChallenge(
  input: OtpVerifyInput,
): Promise<VerifyOtpChallengeResult> {
  const parsed = otpVerifyInputSchema.parse(input);
  const email = parsed.email.trim().toLowerCase();
  const now = new Date();

  const challenge = await withMembersDbError(async () => {
    const db = getMembersDb();
    const rows = await db
      .select()
      .from(otpChallenges)
      .where(
        and(
          eq(otpChallenges.email, email),
          isNull(otpChallenges.consumedAt),
          gt(otpChallenges.expiresAt, now),
        ),
      )
      .orderBy(desc(otpChallenges.createdAt))
      .limit(1);
    return rows[0] ?? null;
  }, "Failed to look up OTP challenge.");

  if (!challenge) {
    throw new MembersOtpError(
      "MEMBERS_OTP_NOT_FOUND",
      "No active OTP challenge found. Request a new code.",
    );
  }

  if (challenge.attemptCount >= OTP_MAX_VERIFY_ATTEMPTS) {
    throw new MembersOtpError(
      "MEMBERS_OTP_EXHAUSTED",
      "Too many incorrect attempts. Request a new code.",
    );
  }

  const codeHash = hashOtpCode(parsed.code);
  if (codeHash !== challenge.codeHash) {
    await withMembersDbError(async () => {
      const db = getMembersDb();
      await db
        .update(otpChallenges)
        .set({ attemptCount: challenge.attemptCount + 1 })
        .where(eq(otpChallenges.id, challenge.id));
    }, "Failed to record OTP attempt.");

    throw new MembersOtpError(
      "MEMBERS_OTP_INVALID",
      "Invalid OTP code.",
    );
  }

  await withMembersDbError(async () => {
    const db = getMembersDb();
    await db
      .update(otpChallenges)
      .set({ consumedAt: now })
      .where(eq(otpChallenges.id, challenge.id));
  }, "Failed to consume OTP challenge.");

  return {
    challengeId: challenge.id,
    email,
  };
}
