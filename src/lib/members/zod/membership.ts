import { z } from "zod";

export const membershipPlanSchema = z.enum([
  "none",
  "founding",
  "lifetime",
  "annual",
]);

export type MembershipPlan = z.infer<typeof membershipPlanSchema>;

export const membershipStatusSchema = z.enum([
  "none",
  "active",
  "cancelled",
  "past_due",
]);

export type MembershipStatus = z.infer<typeof membershipStatusSchema>;

/**
 * Annual renewal fields — populated from Stripe for `annual` plan only.
 * Founding and Lifetime must keep both null.
 */
export const annualRenewalFieldsSchema = z.object({
  membershipAnniversary: z.coerce.date().nullable(),
  nextRenewalAt: z.coerce.date().nullable(),
});

export type AnnualRenewalFields = z.infer<typeof annualRenewalFieldsSchema>;

export const membershipRecordSchema = z.object({
  plan: membershipPlanSchema,
  status: membershipStatusSchema,
  membershipAnniversary: z.coerce.date().nullable(),
  nextRenewalAt: z.coerce.date().nullable(),
  stripeCustomerId: z.string().nullable(),
});

export type MembershipRecord = z.infer<typeof membershipRecordSchema>;

export const joinMembershipInputSchema = z.object({
  email: z.string().trim().email().max(320),
  name: z.string().trim().min(1).max(200),
  plan: z.enum(["founding", "lifetime", "annual"]),
  newsletterOptIn: z.boolean().optional(),
});

export type JoinMembershipInput = z.infer<typeof joinMembershipInputSchema>;

/** Validates that non-annual plans do not carry renewal dates. */
export function assertAnnualRenewalConsistency(
  plan: MembershipPlan,
  fields: AnnualRenewalFields,
): void {
  if (plan === "annual") {
    return;
  }
  if (fields.membershipAnniversary !== null || fields.nextRenewalAt !== null) {
    throw new Error(
      `membershipAnniversary and nextRenewalAt must be null for plan "${plan}"`,
    );
  }
}
