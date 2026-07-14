# Members database schema (members-0001)

Neon + Drizzle schema for the Members platform. Newsletter and membership are **orthogonal** columns on the same person record — not one tier ladder.

## Tables

| Table | Purpose |
|-------|---------|
| `members` | Person identity; newsletter + membership axes |
| `otp_challenges` | DB-backed OTP for login / email verify / newsletter confirm |
| `unsub_tokens` | Tokenized newsletter unsubscribe (`/?unsub=<token>#contact`) |

## Annual renewal fields

For **`membership_plan = annual`** only (populated from Stripe in later tickets):

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

See `.env.example` — `DATABASE_URL` (Neon). Preview/Production use Vercel env vars.
