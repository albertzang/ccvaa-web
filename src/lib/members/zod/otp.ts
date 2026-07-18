import { z } from "zod";

export const otpPurposeSchema = z.enum([
  "login",
  "email_verify",
  "newsletter_confirm",
]);

export type OtpPurpose = z.infer<typeof otpPurposeSchema>;

export const otpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "OTP must be a 6-digit code");

export const otpChallengeCreateSchema = z.object({
  email: z.string().trim().email().max(320),
  purpose: otpPurposeSchema,
  codeHash: z.string().min(32).max(256),
  expiresAt: z.coerce.date(),
});

export type OtpChallengeCreate = z.infer<typeof otpChallengeCreateSchema>;

export const otpVerifyInputSchema = z.object({
  email: z.string().trim().email().max(320),
  purpose: otpPurposeSchema,
  code: otpCodeSchema,
});

export type OtpVerifyInput = z.infer<typeof otpVerifyInputSchema>;
