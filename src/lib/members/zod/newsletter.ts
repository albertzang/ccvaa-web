import { z } from "zod";

export const newsletterStatusSchema = z.enum(["off", "on"]);

export type NewsletterStatus = z.infer<typeof newsletterStatusSchema>;

export const newsletterPreferenceSchema = z.object({
  status: newsletterStatusSchema,
});

export type NewsletterPreference = z.infer<typeof newsletterPreferenceSchema>;

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
