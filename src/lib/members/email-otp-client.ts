import { z } from "zod";

import { otpCodeSchema } from "@/lib/members/zod/otp";

/** Client gate / email-change validation (friendlier messages than API zod). */
export const gateEmailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email.")
  .email("Enter a valid email address.")
  .max(320);

export type OtpInvalidField = "email" | "code";

type ApiError = { ok: false; code: string; message: string };

export async function postMembersJson<T>(
  url: string,
  body: unknown,
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as T | ApiError;
  if (!response.ok || (data as ApiError).ok === false) {
    const err = data as ApiError;
    throw new Error(err.message ?? "Request failed.");
  }
  return data as T;
}

export function getSendCodeInvalidField(email: string): OtpInvalidField | null {
  return gateEmailSchema.safeParse(email).success ? null : "email";
}

export function getVerifyCodeInvalidField(
  email: string,
  code: string,
): OtpInvalidField | null {
  if (!gateEmailSchema.safeParse(email).success) {
    return "email";
  }
  if (!otpCodeSchema.safeParse(code).success) {
    return "code";
  }
  return null;
}

export function otpSendErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Could not send code.";
}

export function otpVerifyErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Could not verify code.";
}

/** Logged-out hero gate — establish verified session. */
export async function startGateEmailOtp(email: string) {
  return postMembersJson<{ message: string }>("/api/members/verify/start", {
    email,
  });
}

export async function verifyGateEmailOtp(email: string, code: string) {
  return postMembersJson<{ message: string }>("/api/members/verify/verify", {
    email,
    code,
  });
}

/** Logged-in email change — same OTP UX, different endpoints. */
export async function startEmailChangeOtp(newEmail: string) {
  return postMembersJson<{ message: string }>(
    "/api/members/profile/email/start",
    { newEmail },
  );
}

export async function verifyEmailChangeOtp<TProfile>(
  newEmail: string,
  code: string,
) {
  return postMembersJson<{ profile: TProfile; message: string }>(
    "/api/members/profile/email/verify",
    { newEmail, code },
  );
}
