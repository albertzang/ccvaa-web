import { z } from "zod";

import { otpCodeSchema } from "@/lib/members/zod/otp";

export const verifyEmailStartInputSchema = z.object({
  email: z.string().trim().email().max(320),
});

export type VerifyEmailStartInput = z.infer<typeof verifyEmailStartInputSchema>;

/** Email + OTP only — identity is email (members-0025). */
export const verifyEmailConfirmInputSchema = z.object({
  email: z.string().trim().email().max(320),
  code: otpCodeSchema,
});

export type VerifyEmailConfirmInput = z.infer<
  typeof verifyEmailConfirmInputSchema
>;
