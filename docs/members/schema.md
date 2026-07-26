# Members database schema (members-0001)

Neon + Drizzle schema for the Members platform. Newsletter and membership are **orthogonal** columns on the same person record — not one tier ladder.

## Identity model

| Field | Role |
|-------|------|
| `members.id` (UUID) | Primary key |
| `email` | **Login identity** — unique; OTP verify / session; the only public identity (no name column — `members-0025`) |
| `stripe_customer_id` | **Billing identity** — Stripe Customer ID; Join Checkout reuses it when set; webhook/activation resolve by customer id first, email as fallback (`members-0026`) |

When a paid member changes login email (profile OTP verify), Neon updates only after `stripe.customers.update` succeeds for the bound Customer (fail closed). Email is not the Stripe billing key.

## Tables

| Table | Purpose |
|-------|---------|
| `members` | Email identity; newsletter + membership axes |
| `otp_challenges` | DB-backed OTP for login / email verify / newsletter confirm |
| `unsub_tokens` | Tokenized newsletter unsubscribe (`/?unsub=<token>#membership`) |
| `stripe_webhook_events` | Idempotent Stripe webhook processing (`event.id` PK) |

## Annual renewal fields

For **`membership_plan = annual`** only (populated from Stripe Checkout / subscription on Join — `members-0004`):

| Column | Type | Meaning |
|--------|------|---------|
| `membership_anniversary` | `date` | Calendar anniversary anchor (month/day from Stripe subscription) |
| `next_renewal_at` | `timestamptz` | Next Stripe renewal instant |

For **`founding`**, **`lifetime`**, and **`none`**: both columns must stay **`NULL`**.

Seed data includes one Annual member with a **known anniversary**:

- Email: `annual@ccvaa-seed.test`
- `membership_anniversary`: `2025-03-15`
- `next_renewal_at`: `2026-03-15T00:00:00.000Z`

## Scripts

```bash
# Requires DATABASE_URL in .env.local
npm run db:migrate
npm run db:seed   # non-Production only
```

## Env

See `.env.example` — `DATABASE_URL` (Neon), `RESEND_API_KEY` + `RESEND_FROM_EMAIL` (transactional OTP), `MEMBER_SESSION_SECRET` (member login cookie), Stripe Join (`STRIPE_*`, founding cap + fee cents), optional Mailosaur for Preview QA (`docs/members/mailosaur-qa.md`).

## Stripe Join webhook

- Endpoint: `POST /api/members/webhooks/stripe`
- Dedupe: insert into `stripe_webhook_events` on `event.id` before side effects
- Activates membership on `checkout.session.completed`; Founding seat claim is race-safe (cap check in SQL)
- Member resolution: `stripe_customer_id` first when Checkout `customer` is present; metadata / `customer_email` fallback
- Checkout create: pass Stripe `customer` when the Neon row already has `stripe_customer_id`; otherwise `customer_email`

## OTP challenges

| Constant | Value |
|----------|-------|
| TTL | 15 minutes |
| Rate limit | 3 challenges / email + purpose / hour |
| Max verify attempts | 5 per challenge |

Helpers live in `src/lib/members/otp-challenges.ts` and `src/lib/members/confirm.ts`.

## Member login session (members-0005)

| Item | Value |
|------|-------|
| Cookie | `ccvaa_member_session` (httpOnly, `SameSite=Lax`, `Secure` on Preview/Production) |
| Signing | HMAC-SHA256 via `MEMBER_SESSION_SECRET` |
| TTL | 7 days (`MEMBER_SESSION_TTL_MS`) |
| Admin | **Never** grants `/admin` — Hover mailbox session only |

APIs: `POST /api/members/login/{start,verify,logout}`, `GET /api/members/login/session`. Fail closed without `DATABASE_URL`, `RESEND_*`, or `MEMBER_SESSION_SECRET`.
