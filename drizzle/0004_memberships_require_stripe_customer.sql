-- members-0024 Iteration 3: memberships ⇒ members.stripe_customer_id is cus_*
-- Do not edit 0003 (already applied on Production).

-- 1) One durable Stripe Customer ID per member when set (newsletter-only stays null).
CREATE UNIQUE INDEX "members_stripe_customer_id_uidx" ON "members" ("stripe_customer_id") WHERE "stripe_customer_id" IS NOT NULL;--> statement-breakpoint

-- 2) Reject memberships writes when the member has no durable Customer (cus_*).
--    Guest IDs (gcus_*) and null fail the LIKE 'cus_%' check.
CREATE OR REPLACE FUNCTION memberships_require_stripe_customer()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  customer_id text;
BEGIN
  SELECT stripe_customer_id INTO customer_id
  FROM members
  WHERE id = NEW.member_id;

  IF customer_id IS NULL OR customer_id NOT LIKE 'cus_%' THEN
    RAISE EXCEPTION
      'memberships require members.stripe_customer_id to be a Stripe Customer (cus_*)'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;--> statement-breakpoint

DROP TRIGGER IF EXISTS memberships_require_stripe_customer_trg ON memberships;--> statement-breakpoint

CREATE TRIGGER memberships_require_stripe_customer_trg
  BEFORE INSERT OR UPDATE ON memberships
  FOR EACH ROW
  EXECUTE FUNCTION memberships_require_stripe_customer();
