import {
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/** Newsletter axis — orthogonal to paid membership (see members backlog). */
export const newsletterStatusEnum = pgEnum("newsletter_status", [
  "off",
  "pending",
  "on",
]);

/** Paid membership plan; `none` = no active paid plan. */
export const membershipPlanEnum = pgEnum("membership_plan", [
  "none",
  "founding",
  "lifetime",
  "annual",
]);

export const membershipStatusEnum = pgEnum("membership_status", [
  "none",
  "active",
  "cancelled",
  "past_due",
]);

export const otpPurposeEnum = pgEnum("otp_purpose", [
  "login",
  "email_verify",
  "newsletter_confirm",
]);

/**
 * Person record — newsletter and membership are separate columns (not one tier ladder).
 *
 * Annual plans: `membershipAnniversary` (calendar anchor from Stripe) and `nextRenewalAt`
 * are set from Stripe subscription data. Founding and Lifetime keep both null.
 */
export const members = pgTable(
  "members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    name: text("name"),
    newsletterStatus: newsletterStatusEnum("newsletter_status")
      .notNull()
      .default("off"),
    newsletterConfirmedAt: timestamp("newsletter_confirmed_at", {
      withTimezone: true,
    }),
    membershipPlan: membershipPlanEnum("membership_plan")
      .notNull()
      .default("none"),
    membershipStatus: membershipStatusEnum("membership_status")
      .notNull()
      .default("none"),
    /** Annual only: anniversary date (month/day anchor). Null for Founding/Lifetime/none. */
    membershipAnniversary: date("membership_anniversary"),
    /** Annual only: next Stripe renewal instant. Null for Founding/Lifetime/none. */
    nextRenewalAt: timestamp("next_renewal_at", { withTimezone: true }),
    stripeCustomerId: text("stripe_customer_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("members_newsletter_status_idx").on(table.newsletterStatus),
    index("members_membership_plan_idx").on(table.membershipPlan),
    index("members_membership_status_idx").on(table.membershipStatus),
  ],
);

/** DB-backed OTP challenges for member login and email verification (members-0005+). */
export const otpChallenges = pgTable(
  "otp_challenges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    purpose: otpPurposeEnum("purpose").notNull(),
    codeHash: text("code_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    attemptCount: integer("attempt_count").notNull().default(0),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("otp_challenges_email_purpose_idx").on(table.email, table.purpose),
    index("otp_challenges_expires_at_idx").on(table.expiresAt),
  ],
);

/** Tokenized newsletter unsubscribe links (`/?unsub=<token>#contact`). */
export const unsubTokens = pgTable(
  "unsub_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    token: text("token").notNull().unique(),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    usedAt: timestamp("used_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("unsub_tokens_member_id_idx").on(table.memberId)],
);

export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
export type OtpChallenge = typeof otpChallenges.$inferSelect;
export type NewOtpChallenge = typeof otpChallenges.$inferInsert;
export type UnsubToken = typeof unsubTokens.$inferSelect;
export type NewUnsubToken = typeof unsubTokens.$inferInsert;
