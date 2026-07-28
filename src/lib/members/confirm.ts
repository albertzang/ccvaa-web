import {
  createOtpChallenge,
  verifyOtpChallenge,
  type VerifyOtpChallengeResult,
} from "@/lib/members/otp-challenges";
import { sendOtpEmail } from "@/lib/members/resend";
import {
  otpVerifyInputSchema,
  type OtpVerifyInput,
} from "@/lib/members/zod/otp";
import { requireDatabaseUrl } from "@/lib/members/env";

export type DeliverOtpResult = {
  email: string;
  expiresAt: Date;
  messageId: string;
};

/**
 * Creates an OTP challenge, sends it via Resend, and returns delivery metadata (not the code).
 * Fails closed when DATABASE_URL or Resend env is missing.
 */
export async function deliverOtp(input: {
  email: string;
}): Promise<DeliverOtpResult> {
  requireDatabaseUrl();

  const email = input.email.trim().toLowerCase();
  const { code, expiresAt } = await createOtpChallenge({ email });

  const { id: messageId } = await sendOtpEmail({
    to: email,
    code,
    expiresAt,
  });

  return {
    email,
    expiresAt,
    messageId,
  };
}

/** Email verification for gate, Join, or profile email change. */
export async function sendEmailVerifyOtp(
  email: string,
): Promise<DeliverOtpResult> {
  return deliverOtp({ email });
}

/**
 * Verifies a submitted OTP for the email. Shared by gate, Join, and profile email change.
 */
export async function verifyDeliveredOtp(
  input: OtpVerifyInput,
): Promise<VerifyOtpChallengeResult> {
  requireDatabaseUrl();
  otpVerifyInputSchema.parse(input);
  return verifyOtpChallenge(input);
}
