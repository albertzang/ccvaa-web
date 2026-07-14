CREATE TYPE "public"."membership_plan" AS ENUM('none', 'founding', 'lifetime', 'annual');--> statement-breakpoint
CREATE TYPE "public"."membership_status" AS ENUM('none', 'active', 'cancelled', 'past_due');--> statement-breakpoint
CREATE TYPE "public"."newsletter_status" AS ENUM('off', 'pending', 'on');--> statement-breakpoint
CREATE TYPE "public"."otp_purpose" AS ENUM('login', 'email_verify', 'newsletter_confirm');--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"newsletter_status" "newsletter_status" DEFAULT 'off' NOT NULL,
	"newsletter_confirmed_at" timestamp with time zone,
	"membership_plan" "membership_plan" DEFAULT 'none' NOT NULL,
	"membership_status" "membership_status" DEFAULT 'none' NOT NULL,
	"membership_anniversary" date,
	"next_renewal_at" timestamp with time zone,
	"stripe_customer_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "members_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "otp_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"purpose" "otp_purpose" NOT NULL,
	"code_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unsub_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"member_id" uuid NOT NULL,
	"used_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unsub_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "unsub_tokens" ADD CONSTRAINT "unsub_tokens_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "members_newsletter_status_idx" ON "members" USING btree ("newsletter_status");--> statement-breakpoint
CREATE INDEX "members_membership_plan_idx" ON "members" USING btree ("membership_plan");--> statement-breakpoint
CREATE INDEX "members_membership_status_idx" ON "members" USING btree ("membership_status");--> statement-breakpoint
CREATE INDEX "otp_challenges_email_purpose_idx" ON "otp_challenges" USING btree ("email","purpose");--> statement-breakpoint
CREATE INDEX "otp_challenges_expires_at_idx" ON "otp_challenges" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "unsub_tokens_member_id_idx" ON "unsub_tokens" USING btree ("member_id");
