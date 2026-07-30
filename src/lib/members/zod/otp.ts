import { z } from "zod";

export const otpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "OTP must be a 6-digit code");

export const otpChallengeCreateSchema = z.object({
  email: z.string().trim().email().max(320),
  codeHash: z.string().min(32).max(256),
  expiresAt: z.coerce.date(),
});

export type OtpChallengeCreate = z.infer<typeof otpChallengeCreateSchema>;

export const otpVerifyInputSchema = z.object({
  email: z.string().trim().email().max(320),
  code: otpCodeSchema,
});

export type OtpVerifyInput = z.infer<typeof otpVerifyInputSchema>;
