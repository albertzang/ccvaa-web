import { z } from "zod";

import { otpCodeSchema } from "@/lib/members/zod/otp";
import { personNameSchema } from "@/lib/members/zod/person-name";

export const verifyEmailStartInputSchema = z.object({
  email: z.string().trim().email().max(320),
});

export type VerifyEmailStartInput = z.infer<typeof verifyEmailStartInputSchema>;

/** Name is client-held until verify succeeds; required on verify only. */
export const verifyEmailConfirmInputSchema = z.object({
  email: z.string().trim().email().max(320),
  code: otpCodeSchema,
  name: personNameSchema,
});

export type VerifyEmailConfirmInput = z.infer<
  typeof verifyEmailConfirmInputSchema
>;
