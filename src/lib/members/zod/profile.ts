import { z } from "zod";

import { otpCodeSchema } from "@/lib/members/zod/otp";

export const profileNameUpdateSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(200),
});

export type ProfileNameUpdateInput = z.infer<typeof profileNameUpdateSchema>;

export const profileEmailChangeStartSchema = z.object({
  newEmail: z.string().trim().email().max(320),
});

export type ProfileEmailChangeStartInput = z.infer<
  typeof profileEmailChangeStartSchema
>;

export const profileEmailChangeVerifySchema = z.object({
  newEmail: z.string().trim().email().max(320),
  code: otpCodeSchema,
});

export type ProfileEmailChangeVerifyInput = z.infer<
  typeof profileEmailChangeVerifySchema
>;
