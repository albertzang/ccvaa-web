import { z } from "zod";

export const unsubTokenValueSchema = z
  .string()
  .trim()
  .min(16)
  .max(128)
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Unsubscribe token must be URL-safe alphanumeric",
  );

export const unsubTokenCreateSchema = z.object({
  memberId: z.string().uuid(),
  token: unsubTokenValueSchema,
  expiresAt: z.coerce.date().nullable().optional(),
});

export type UnsubTokenCreate = z.infer<typeof unsubTokenCreateSchema>;

export const unsubTokenRedeemInputSchema = z.object({
  token: unsubTokenValueSchema,
});

export type UnsubTokenRedeemInput = z.infer<typeof unsubTokenRedeemInputSchema>;
