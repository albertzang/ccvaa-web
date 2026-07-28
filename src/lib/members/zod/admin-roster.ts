import { z } from "zod";

import {
  membershipPlanSchema,
  membershipStatusSchema,
  paidMembershipPlanSchema,
} from "@/lib/members/zod/membership";
import { newsletterStatusSchema } from "@/lib/members/zod/newsletter";

export const adminRosterPlanFilterSchema = z.enum([
  "all",
  "none",
  "founding",
  "lifetime",
  "annual",
]);

export type AdminRosterPlanFilter = z.infer<typeof adminRosterPlanFilterSchema>;

export const adminRosterNewsletterFilterSchema = z.enum([
  "all",
  "on",
  "off",
]);

export type AdminRosterNewsletterFilter = z.infer<
  typeof adminRosterNewsletterFilterSchema
>;

export const adminRosterListQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  plan: adminRosterPlanFilterSchema.optional().default("all"),
  newsletter: adminRosterNewsletterFilterSchema.optional().default("all"),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type AdminRosterListQuery = z.infer<typeof adminRosterListQuerySchema>;

const isoDateTimeSchema = z
  .string()
  .datetime({ message: "Use an ISO 8601 datetime for period end." });

export const adminRosterUpdateSchema = z
  .object({
    newsletterStatus: newsletterStatusSchema.optional(),
    membershipPlan: z
      .enum(["none", "founding", "lifetime", "annual"])
      .optional(),
    membershipStatus: z
      .enum(["none", "active", "past_due", "cancelled"])
      .optional(),
    currentPeriodEnd: isoDateTimeSchema.nullable().optional(),
    cancelAtPeriodEnd: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.newsletterStatus !== undefined ||
      value.membershipPlan !== undefined ||
      value.membershipStatus !== undefined ||
      value.currentPeriodEnd !== undefined ||
      value.cancelAtPeriodEnd !== undefined,
    { message: "At least one field must be provided." },
  )
  .superRefine((value, ctx) => {
    if (value.membershipPlan === "none" && value.membershipStatus === "active") {
      ctx.addIssue({
        code: "custom",
        message: "Cannot set status active with plan none.",
      });
    }
    if (
      value.membershipPlan &&
      value.membershipPlan !== "none" &&
      value.membershipPlan !== "annual" &&
      value.currentPeriodEnd
    ) {
      ctx.addIssue({
        code: "custom",
        message: "currentPeriodEnd is only valid for Annual plans.",
      });
    }
  });

export type AdminRosterUpdateInput = z.infer<typeof adminRosterUpdateSchema>;

export const adminRosterMemberSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  newsletterStatus: newsletterStatusSchema,
  membershipPlan: membershipPlanSchema,
  membershipStatus: z.enum(["none", "active", "past_due", "cancelled"]),
  currentPeriodEnd: z.string().datetime().nullable(),
  cancelAtPeriodEnd: z.boolean(),
  stripeCustomerId: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AdminRosterMember = z.infer<typeof adminRosterMemberSchema>;

export { paidMembershipPlanSchema, membershipStatusSchema };
