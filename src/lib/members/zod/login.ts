import { z } from "zod";

import { otpCodeSchema } from "@/lib/members/zod/otp";

export const loginStartInputSchema = z.object({
  email: z.string().trim().email().max(320),
});

export type LoginStartInput = z.infer<typeof loginStartInputSchema>;

export const loginVerifyInputSchema = z.object({
  email: z.string().trim().email().max(320),
  code: otpCodeSchema,
});

export type LoginVerifyInput = z.infer<typeof loginVerifyInputSchema>;
