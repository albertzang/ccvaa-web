# Handoff: Developer / PM → QA

**Date:** 2026-07-14  
**Pass:** `1`  
**Backlog work ID:** `members-0004`  
**Ship path that led here:** `feature-branch`  
**Epic branch:** `feat/members`  
**Merge gate:** `epic`  
**Filled by:** Developer  

**Save as:** `docs/handoffs/HANDOFF-QA-pass1.md`

**Branch name:** `feat/members`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/8  
**Commit:** `b6a3322`  
**Preview URL:** https://ccvaa-web-git-feat-members-azang-projects.vercel.app  
**Preview protection:** QA reads `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local` (do **not** paste the secret here). See `docs/protocols/PREVIEW_PROTECTION.md`.  
**Production URL:** https://ccvaa-web.vercel.app/ (Pass **2** only — not for this pass)

**Post-merge cleanup (Pass 2 only):** n/a until **merge milestone**

**Out of scope for QA:** https://ccvaa.ca/ — CEO manual only.

## What changed

Logged-out `#membership` Join UI + Stripe Checkout (test mode): name, email, optional newsletter opt-in → email verify OTP → Checkout → webhook activates membership; return `/?joined=1#membership`. Pre-cap: Founding + Annual; post-cap: Lifetime + Annual. Race-safe Founding seat claim; Lifetime fee must be > Founding (env validation). Hero **Join** + nav Membership anchor. APIs: `GET /api/members/join/plans`, `POST /api/members/join/start`, `POST /api/members/join/verify`, `POST /api/members/webhooks/stripe` (idempotent). Migration `0001_stripe_webhooks`.

## Focus checklist

- [ ] Homepage order: Hero → `#membership` → About → Contact
- [ ] Hero **Join** and nav **Membership** scroll to `#membership`
- [ ] Without Stripe/`DATABASE_URL`: Join plans fail closed (clear unavailable message / 503 APIs)
- [ ] With secrets: plans load; Founding+Annual pre-cap (or Lifetime+Annual if cap full)
- [ ] Join start → 6-digit email verify → redirects to Stripe Checkout
- [ ] After test payment: return to `/?joined=1#membership`; webhook sets membership active (check DB or roster later)
- [ ] Annual: `membership_anniversary` / `next_renewal_at` set from Stripe subscription
- [ ] Optional newsletter checkbox stored; after pay → newsletter pending + confirm email path (best-effort)
- [ ] Webhook endpoint reachable (Stripe test CLI or Dashboard) at `/api/members/webhooks/stripe`; duplicate events no-op
- [ ] `npm run lint` + `npm run typecheck` clean (CI on PR)
- [ ] **Do not merge** (epic merge gate)

## Known risks / flaky areas

- Live Join requires Preview env: `DATABASE_URL`, `RESEND_*`, full Stripe test set (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, three Price IDs, `MEMBERSHIP_FOUNDING_CAP`, three fee cent vars with Lifetime > Founding).
- Webhook must target this Preview URL (or `stripe listen --forward-to`). Without webhook secret/events, Checkout succeeds but membership does not activate.
- Run `npm run db:migrate` on Preview Neon to apply `stripe_webhook_events` before webhook QA.
- Founding seat race: if two checkouts finish past cap, loser is refunded / not activated.
- Member login / profile (`members-0005`/`0006`) not in this ticket — Join success copy notes that.

## Preview env notes (Pass 1)

CEO/PM set in Vercel **Preview** (and `.env.local` for Dev):

| Var | Purpose |
|-----|---------|
| `DATABASE_URL` | Neon (migrate required for webhook table) |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Email verify OTP |
| `STRIPE_SECRET_KEY` | Test secret |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for Preview webhook |
| `STRIPE_PRICE_FOUNDING` / `LIFETIME` / `ANNUAL` | Price IDs |
| `MEMBERSHIP_FOUNDING_CAP` | Integer seat cap |
| `MEMBERSHIP_FOUNDING_FEE_CENTS` / `LIFETIME` / `ANNUAL` | Display + Lifetime > Founding check |
| Mailosaur (optional) | Capture `email_verify` OTP — `docs/members/mailosaur-qa.md` |

Deployment Protection bypass — `VERCEL_AUTOMATION_BYPASS_SECRET` in `.env.local`.

## Production / baseline / Pass 2 auth notes

- Admin auth = Hover mailbox login in Mail iframe — see `docs/protocols/QA_AUTH.md`
- QA reads `ADMIN_EMAIL` / `ADMIN_PASS` from `.env.local` — **do not** paste into handoffs or reports

## Report back with

`docs/reports/QA-pass1.md` — Pass 1 result for **continue epic** (do **not** merge to `main`).
