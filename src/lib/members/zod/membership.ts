import { z } from "zod";

/** Session / UI plan including `none` when there is no current membership row. */
export const membershipPlanSchema = z.enum([
  "none",
  "founding",
  "lifetime",
  "annual",
]);

export type MembershipPlan = z.infer<typeof membershipPlanSchema>;

/** Plans stored on `memberships.plan` (no `none`). */
export const paidMembershipPlanSchema = z.enum([
  "founding",
  "lifetime",
  "annual",
]);

export type PaidMembershipPlan = z.infer<typeof paidMembershipPlanSchema>;

export const membershipStatusSchema = z.enum([
  "active",
  "past_due",
  "cancelled",
]);

export type MembershipStatus = z.infer<typeof membershipStatusSchema>;

export const membershipRecordSchema = z.object({
  plan: paidMembershipPlanSchema,
  status: membershipStatusSchema,
  stripeSubscriptionId: z.string().nullable(),
  currentPeriodEnd: z.coerce.date().nullable(),
  cancelAtPeriodEnd: z.boolean(),
});

export type MembershipRecord = z.infer<typeof membershipRecordSchema>;

export const joinPlanIdSchema = z.enum(["founding", "lifetime", "annual"]);

export type JoinPlanId = z.infer<typeof joinPlanIdSchema>;

export const joinMembershipInputSchema = z.object({
  email: z.string().trim().email().max(320),
  plan: joinPlanIdSchema,
  newsletterOptIn: z.boolean().optional().default(false),
});

export type JoinMembershipInput = z.infer<typeof joinMembershipInputSchema>;

/** Join verify — same identity fields plus email OTP code. */
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
