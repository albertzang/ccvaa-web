import { z } from "zod";

export const newsletterStatusSchema = z.enum(["off", "pending", "on"]);

export type NewsletterStatus = z.infer<typeof newsletterStatusSchema>;

export const newsletterPreferenceSchema = z.object({
  status: newsletterStatusSchema,
  confirmedAt: z.coerce.date().nullable(),
});

export type NewsletterPreference = z.infer<typeof newsletterPreferenceSchema>;

export const newsletterSubscribeInputSchema = z.object({
  email: z.string().trim().email().max(320),
  name: z.string().trim().min(1).max(200).optional(),
});

export type NewsletterSubscribeInput = z.infer<
  typeof newsletterSubscribeInputSchema
>;

export const newsletterConfirmInputSchema = z.object({
  email: z.string().trim().email().max(320),
  token: z.string().trim().min(16).max(128),
});

export type NewsletterConfirmInput = z.infer<
  typeof newsletterConfirmInputSchema
>;
