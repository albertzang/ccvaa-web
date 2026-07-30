-- members-0024: memberships history + Stripe portal + newsletter/OTP prune
-- Pre-production: hard-delete OK — no backfill required.

-- 1) Create memberships with fresh plan/status enums (drop `none` from usage).
CREATE TYPE "public"."membership_plan_v2" AS ENUM('founding', 'lifetime', 'annual');--> statement-breakpoint
CREATE TYPE "public"."membership_status_v2" AS ENUM('active', 'past_due', 'cancelled');--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"plan" "membership_plan_v2" NOT NULL,
	"status" "membership_status_v2" NOT NULL,
	"stripe_subscription_id" text,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "memberships_member_id_idx" ON "memberships" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "memberships_status_idx" ON "memberships" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "memberships_stripe_subscription_id_uidx" ON "memberships" USING btree ("stripe_subscription_id");--> statement-breakpoint
CREATE UNIQUE INDEX "memberships_one_current_per_member" ON "memberships" ("member_id") WHERE "status" IN ('active', 'past_due');--> statement-breakpoint

-- 2) Prune membership columns from members; add lifelong unsub_token.
ALTER TABLE "members" DROP COLUMN IF EXISTS "membership_plan";--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN IF EXISTS "membership_status";--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN IF EXISTS "membership_anniversary";--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN IF EXISTS "next_renewal_at";--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN IF EXISTS "newsletter_confirmed_at";--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "unsub_token" text;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "members_unsub_token_unique" ON "members" ("unsub_token");--> statement-breakpoint
DROP INDEX IF EXISTS "members_membership_plan_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "members_membership_status_idx";--> statement-breakpoint

-- 3) Newsletter enum: off | on only (collapse pending → off).
UPDATE "members" SET "newsletter_status" = 'off' WHERE "newsletter_status" = 'pending';--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "newsletter_status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "newsletter_status" TYPE text USING "newsletter_status"::text;--> statement-breakpoint
DROP TYPE "public"."newsletter_status";--> statement-breakpoint
CREATE TYPE "public"."newsletter_status" AS ENUM('off', 'on');--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "newsletter_status" TYPE "public"."newsletter_status" USING "newsletter_status"::"public"."newsletter_status";--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "newsletter_status" SET DEFAULT 'off'::"public"."newsletter_status";--> statement-breakpoint

-- 4) Drop unsub_tokens table (token lives on members).
DROP TABLE IF EXISTS "unsub_tokens";--> statement-breakpoint

-- 5) Drop OTP purpose.
DROP INDEX IF EXISTS "otp_challenges_email_purpose_idx";--> statement-breakpoint
ALTER TABLE "otp_challenges" DROP COLUMN IF EXISTS "purpose";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."otp_purpose";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "otp_challenges_email_idx" ON "otp_challenges" USING btree ("email");--> statement-breakpoint

-- 6) Replace legacy membership enums with v2 names used by Drizzle.
DROP TYPE IF EXISTS "public"."membership_plan";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."membership_status";--> statement-breakpoint
ALTER TYPE "public"."membership_plan_v2" RENAME TO "membership_plan";--> statement-breakpoint
ALTER TYPE "public"."membership_status_v2" RENAME TO "membership_status";
