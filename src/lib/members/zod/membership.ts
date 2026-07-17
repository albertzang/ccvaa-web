import { z } from "zod";

import { personNameSchema } from "@/lib/members/zod/person-name";

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

export const joinPlanIdSchema = z.enum(["founding", "lifetime", "annual"]);

export type JoinPlanId = z.infer<typeof joinPlanIdSchema>;

export const joinMembershipInputSchema = z.object({
  email: z.string().trim().email().max(320),
  name: personNameSchema,
  plan: joinPlanIdSchema,
  newsletterOptIn: z.boolean().optional().default(false),
});

export type JoinMembershipInput = z.infer<typeof joinMembershipInputSchema>;

/** Join verify — same identity fields plus email_verify OTP code. */
export const joinMembershipVerifyInputSchema = joinMembershipInputSchema.extend(
  {
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "OTP must be a 6-digit code"),
  },
);

export type JoinMembershipVerifyInput = z.infer<
  typeof joinMembershipVerifyInputSchema
>;

/** Session-authenticated Join checkout (plan only; identity from session). */
export const joinCheckoutFromSessionSchema = z.object({
  plan: joinPlanIdSchema,
});

export type JoinCheckoutFromSessionInput = z.infer<
  typeof joinCheckoutFromSessionSchema
>;

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
