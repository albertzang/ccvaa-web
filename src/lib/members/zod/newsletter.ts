import { z } from "zod";

import { personNameSchema } from "@/lib/members/zod/person-name";

export const newsletterStatusSchema = z.enum(["off", "pending", "on"]);

export type NewsletterStatus = z.infer<typeof newsletterStatusSchema>;

export const newsletterPreferenceSchema = z.object({
  status: newsletterStatusSchema,
  confirmedAt: z.coerce.date().nullable(),
});

export type NewsletterPreference = z.infer<typeof newsletterPreferenceSchema>;

export const newsletterSubscribeInputSchema = z.object({
  email: z.string().trim().email().max(320),
  name: personNameSchema,
});

export type NewsletterSubscribeInput = z.infer<
  typeof newsletterSubscribeInputSchema
>;

export const newsletterConfirmInputSchema = z.object({
  email: z.string().trim().email().max(320),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Confirmation code must be 6 digits"),
});

export type NewsletterConfirmInput = z.infer<
  typeof newsletterConfirmInputSchema
>;

export const newsletterLookupInputSchema = z.object({
  email: z.string().trim().email().max(320),
});

export type NewsletterLookupInput = z.infer<
  typeof newsletterLookupInputSchema
>;

export const newsletterUnsubscribeInputSchema = z.object({
  email: z.string().trim().email().max(320),
});

export type NewsletterUnsubscribeInput = z.infer<
  typeof newsletterUnsubscribeInputSchema
>;

/** Session-authenticated newsletter preference toggle (no OTP). */
export const newsletterSessionPreferenceSchema = z.object({
  status: z.enum(["on", "off"]),
});

export type NewsletterSessionPreferenceInput = z.infer<
  typeof newsletterSessionPreferenceSchema
>;
