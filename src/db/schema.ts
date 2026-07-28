import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/** Newsletter axis — orthogonal to paid membership (off | on only). */
export const newsletterStatusEnum = pgEnum("newsletter_status", ["off", "on"]);

/** Paid plan on a memberships row (no `none` — absence = no current row). */
export const membershipPlanEnum = pgEnum("membership_plan", [
  "founding",
  "lifetime",
  "annual",
]);

export const membershipStatusEnum = pgEnum("membership_status", [
  "active",
  "past_due",
  "cancelled",
]);

/**
 * Member record — email is login identity; `stripeCustomerId` is billing.
 * Paid periods live on `memberships`; newsletter + unsub token live here.
 */
export const members = pgTable(
  "members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    newsletterStatus: newsletterStatusEnum("newsletter_status")
      .notNull()
      .default("off"),
    /** Lifelong newsletter unsubscribe token (`/?unsub=<token>#membership`). */
    unsubToken: text("unsub_token").unique(),
    stripeCustomerId: text("stripe_customer_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("members_newsletter_status_idx").on(table.newsletterStatus)],
);

/**
 * Paid membership periods — history allowed; ≤1 `active`/`past_due` per member.
 * Stripe Customer portal is the SoT for Annual cancel/renew; Neon mirrors webhooks.
 */
export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    plan: membershipPlanEnum("plan").notNull(),
    status: membershipStatusEnum("status").notNull(),
    /** Annual Stripe subscription id; null for Founding/Lifetime one-time. */
    stripeSubscriptionId: text("stripe_subscription_id"),
    /** Annual period end from Stripe; null for Founding/Lifetime. */
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    /** Webhook mirror of Stripe `cancel_at_period_end` (Annual). */
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("memberships_member_id_idx").on(table.memberId),
    index("memberships_status_idx").on(table.status),
    uniqueIndex("memberships_stripe_subscription_id_uidx").on(
      table.stripeSubscriptionId,
    ),
  ],
);

/** DB-backed OTP challenges for gate + profile email-change (no purpose column). */
export const otpChallenges = pgTable(
  "otp_challenges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    codeHash: text("code_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    attemptCount: integer("attempt_count").notNull().default(0),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("otp_challenges_email_idx").on(table.email),
    index("otp_challenges_expires_at_idx").on(table.expiresAt),
  ],
);

/**
 * Stripe webhook idempotency — `event.id` primary key so retries are no-ops.
 * Insert-first (ON CONFLICT DO NOTHING); only the winner processes side effects.
 */
export const stripeWebhookEvents = pgTable("stripe_webhook_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
export type Membership = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;
export type OtpChallenge = typeof otpChallenges.$inferSelect;
export type NewOtpChallenge = typeof otpChallenges.$inferInsert;
export type StripeWebhookEvent = typeof stripeWebhookEvents.$inferSelect;
export type NewStripeWebhookEvent = typeof stripeWebhookEvents.$inferInsert;
