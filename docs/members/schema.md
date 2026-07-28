# Members database schema (members-0001 / members-0024)

Neon + Drizzle schema for the Members platform. Newsletter and paid membership are **orthogonal** — identity/newsletter on `members`; paid periods on `memberships`.

## Identity model

| Field | Role |
|-------|------|
| `members.id` (UUID) | Primary key |
| `email` | **Login identity** — unique; OTP verify / session; the only public identity (no name column — `members-0025`) |
| `stripe_customer_id` | **Billing identity** — Stripe Customer ID; Join Checkout reuses it when set; Customer portal when set (`members-0024` / `members-0026`) |
| `unsub_token` | Lifelong newsletter unsubscribe token (`/?unsub=<token>#membership`) |

When a paid member changes login email (profile OTP verify), Neon updates only after `stripe.customers.update` succeeds for the bound Customer (fail closed). Email is not the Stripe billing key.

## Tables

| Table | Purpose |
|-------|---------|
| `members` | Email identity; newsletter on/off; Stripe Customer; unsub token |
| `memberships` | Paid plan history; current = `active` or `past_due` (≤1 per member) |
| `otp_challenges` | DB-backed OTP for gate / Join / profile email-change (no purpose column) |
| `stripe_webhook_events` | Idempotent Stripe webhook processing (`event.id` PK) |

**Removed (`members-0024`):** `unsub_tokens` table; membership columns / `newsletter_confirmed_at` / newsletter `pending` on `members`; `otp_challenges.purpose`.

## `memberships` (current vs history)

UI and perks use the **current** row only (`status` ∈ `active` \| `past_due`). History rows stay as `cancelled`.

| Column | Notes |
|--------|--------|
| `plan` | `founding` \| `lifetime` \| `annual` |
| `status` | `active` \| `past_due` \| `cancelled` |
| `stripe_subscription_id` | Annual only |
| `current_period_end` | Annual; null for Founding/Lifetime |
| `cancel_at_period_end` | Webhook mirror (Annual won’t-renew copy) |

**Product rules:** `active` → perks on; `past_due` → perks off, no Join, fix via Stripe Customer portal; no current row → Join.

Seed Annual member:

- Email: `annual@ccvaa-seed.test`
- `current_period_end`: `2026-03-15T00:00:00.000Z`
- `stripe_customer_id`: `cus_seed_annual_test`

## Scripts

```bash
# Requires DATABASE_URL in .env.local
npm run db:migrate
npm run db:seed   # non-Production only
```

## Env

See `.env.example` — `DATABASE_URL` (Neon), `RESEND_API_KEY` + `RESEND_FROM_EMAIL` (transactional OTP), `MEMBER_SESSION_SECRET` (member session cookie), Stripe Join (`STRIPE_*`, founding cap + fee cents), optional Mailosaur for Preview QA (`docs/members/mailosaur-qa.md`).

## Stripe Join + Customer portal

- Checkout webhook: `POST /api/members/webhooks/stripe`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Dedupe: insert into `stripe_webhook_events` on `event.id` before side effects
- Activates / updates `memberships`; Founding seat claim is race-safe (cap check in SQL)
- Member resolution: `stripe_customer_id` first when Checkout `customer` is present; metadata / `customer_email` fallback
- Checkout create: pass Stripe `customer` when the Neon row already has `stripe_customer_id`; otherwise `customer_email`
- Portal session: `POST /api/members/billing/portal` → Stripe `billingPortal.sessions.create` → return `/#membership`
- **CEO Stripe Dashboard (test now; live at go-live):** enable Customer portal; allow payment method update + invoice history; for Annual allow cancel/renew at period end; subscribe webhook endpoint to subscription updated/deleted

## OTP challenges

| Constant | Value |
|----------|-------|
| TTL | 15 minutes |
| Rate limit | 3 challenges / email / hour |
| Max verify attempts | 5 per challenge |

Helpers live in `src/lib/members/otp-challenges.ts` and `src/lib/members/confirm.ts`. Live OTP paths: membership gate, Join verify, profile email-change. Login start/verify and newsletter subscribe/confirm OTP routes are removed.

## Member session

| Item | Value |
|------|-------|
| Cookie | `ccvaa_member_session` (httpOnly, `SameSite=Lax`, `Secure` on Preview/Production) |
| Signing | HMAC-SHA256 via `MEMBER_SESSION_SECRET` |
| TTL | 7 days (`MEMBER_SESSION_TTL_MS`) |
| Admin | **Never** grants `/admin` — Hover mailbox session only |

APIs: gate `POST /api/members/verify/{start,verify}`, `POST /api/members/login/logout`, `GET /api/members/login/session`. Fail closed without `DATABASE_URL`, `RESEND_*`, or `MEMBER_SESSION_SECRET`.
