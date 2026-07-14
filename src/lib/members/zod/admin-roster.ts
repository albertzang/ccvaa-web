import { z } from "zod";

import {
  assertAnnualRenewalConsistency,
  membershipPlanSchema,
  membershipStatusSchema,
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
  "pending",
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

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD for anniversary date.");

const isoDateTimeSchema = z
  .string()
  .datetime({ message: "Use an ISO 8601 datetime for next renewal." });

export const adminRosterUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(200).nullable().optional(),
    newsletterStatus: newsletterStatusSchema.optional(),
    membershipPlan: membershipPlanSchema.optional(),
    membershipStatus: membershipStatusSchema.optional(),
    membershipAnniversary: isoDateSchema.nullable().optional(),
    nextRenewalAt: isoDateTimeSchema.nullable().optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.newsletterStatus !== undefined ||
      value.membershipPlan !== undefined ||
      value.membershipStatus !== undefined ||
      value.membershipAnniversary !== undefined ||
      value.nextRenewalAt !== undefined,
    { message: "At least one field must be provided." },
  )
  .superRefine((value, ctx) => {
    const plan = value.membershipPlan;
    if (plan === undefined) {
      return;
    }
    try {
      assertAnnualRenewalConsistency(plan, {
        membershipAnniversary:
          value.membershipAnniversary === undefined
            ? null
            : value.membershipAnniversary
              ? new Date(value.membershipAnniversary)
              : null,
        nextRenewalAt:
          value.nextRenewalAt === undefined
            ? null
            : value.nextRenewalAt
              ? new Date(value.nextRenewalAt)
              : null,
      });
    } catch (error) {
      ctx.addIssue({
        code: "custom",
        message:
          error instanceof Error
            ? error.message
            : "Invalid annual renewal fields.",
      });
    }
  });

export type AdminRosterUpdateInput = z.infer<typeof adminRosterUpdateSchema>;

export const adminRosterMemberSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  newsletterStatus: newsletterStatusSchema,
  newsletterConfirmedAt: z.string().datetime().nullable(),
  membershipPlan: membershipPlanSchema,
  membershipStatus: membershipStatusSchema,
  membershipAnniversary: isoDateSchema.nullable(),
  nextRenewalAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AdminRosterMember = z.infer<typeof adminRosterMemberSchema>;
