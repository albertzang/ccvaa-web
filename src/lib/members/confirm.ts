import {
  createOtpChallenge,
  verifyOtpChallenge,
  type VerifyOtpChallengeResult,
} from "@/lib/members/otp-challenges";
import { sendOtpEmail } from "@/lib/members/resend";
import {
  otpVerifyInputSchema,
  type OtpPurpose,
  type OtpVerifyInput,
} from "@/lib/members/zod/otp";
import { requireDatabaseUrl } from "@/lib/members/env";

export type DeliverOtpResult = {
  email: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  messageId: string;
};

/**
 * Creates an OTP challenge, sends it via Resend, and returns delivery metadata (not the code).
 * Fails closed when DATABASE_URL or Resend env is missing.
 */
export async function deliverOtp(input: {
  email: string;
  purpose: OtpPurpose;
}): Promise<DeliverOtpResult> {
  requireDatabaseUrl();

  const email = input.email.trim().toLowerCase();
  const { code, expiresAt } = await createOtpChallenge({
    email,
    purpose: input.purpose,
  });

  const { id: messageId } = await sendOtpEmail({
    to: email,
    purpose: input.purpose,
    code,
    expiresAt,
  });

  return {
    email,
    purpose: input.purpose,
    expiresAt,
    messageId,
  };
}

/** Newsletter double opt-in — sends a 6-digit confirm code via Resend. */
export async function sendNewsletterConfirmOtp(
  email: string,
): Promise<DeliverOtpResult> {
  return deliverOtp({ email, purpose: "newsletter_confirm" });
}

/** Member login OTP — used by members-0005+. */
export async function sendLoginOtp(email: string): Promise<DeliverOtpResult> {
  return deliverOtp({ email, purpose: "login" });
}

/** Email re-verification during join or profile update — used by members-0004/0006+. */
export async function sendEmailVerifyOtp(
  email: string,
): Promise<DeliverOtpResult> {
  return deliverOtp({ email, purpose: "email_verify" });
}

/**
 * Verifies a submitted OTP for any purpose. Shared by login, email verify, and newsletter confirm.
 */
export async function verifyDeliveredOtp(
  input: OtpVerifyInput,
): Promise<VerifyOtpChallengeResult> {
  requireDatabaseUrl();
  otpVerifyInputSchema.parse(input);
  return verifyOtpChallenge(input);
}

/** Verifies newsletter confirm OTP after double opt-in send. */
export async function verifyNewsletterConfirmOtp(
  input: Pick<OtpVerifyInput, "email" | "code">,
): Promise<VerifyOtpChallengeResult> {
  return verifyDeliveredOtp({
    email: input.email,
    purpose: "newsletter_confirm",
    code: input.code,
  });
}
