# QA report

**Pass:** 1 (pre-merge)  
**Backlog work ID:** `members-0004`  
**Environment(s) + exact URLs:** Preview https://ccvaa-web-git-feat-members-azang-projects.vercel.app (Deployment Protection bypass used via `.env.local`; bypass query omitted from URL)  
**Branch / PR / commit:** `feat/members` · PR https://github.com/albertzang/ccvaa-web/pull/8 · tested against Preview deploy on epic branch (local tip `6f63524`; Join work `b6a3322`)  
**Merge gate:** `epic`  
**Date:** 2026-07-14  
**Result:** pass

**Save as:** `docs/reports/QA-pass1.md`

**Retest:** overwrite this same path. Do not create `-prior` / `-v2` / `-attemptN` files.

## Scope tested

Logged-out `#membership` Join UI on Members epic Preview: homepage section order, hero **Join** + nav **Membership** anchors, plan-unavailable / fail-closed Join without Stripe keys, health (db/stripe/email), Join + webhook API fail-closed, optional `/` + `/admin` smoke, local lint/typecheck, PR CI. Live Checkout / email OTP blocked by missing Preview secrets — documented as blocked, not hold.

## Checklist results

| Area | Result | Notes |
|------|--------|-------|
| Public homepage | pass | **200**; section ids in DOM order: `hero` → `membership` → `about` → `contact` |
| Board / Purposes | pass | Still rendered on Preview homepage (smoke) |
| Contact | pass | `#contact` present after About (smoke) |
| Admin layout (smoke) | pass | `GET /admin` → **200** |
| Admin mail / auth / scaffolds | n/a | Optional; not required for this ticket |
| Hero **Join** → `#membership` | pass | `<a href="#membership">Join</a>` present |
| Nav **Membership** → `#membership` | pass | `<a href="#membership">Membership</a>` present |
| `#membership` Join UI structure | pass | Title/description for paid membership; Join form shell; clear Stripe unavailable message + **Retry loading plans** when plans fail |
| Plan rules display (Founding+Annual / Lifetime+Annual) | blocked | Plans API **503** without Stripe — UI correctly shows unavailable instead of plan cards; live pre/post-cap offering not exerciseable |
| Join start → OTP → Checkout | blocked | Needs Preview Stripe + Resend (+ Price IDs / webhook secret); see Secrets still blocking |
| Post-pay return / webhook activate | blocked | Same; webhook path reachable for signature fail-closed only |
| `GET /api/members/health` | pass | **200** `ok:true`; `db.ok:true`; `stripe:"missing"`; `email.resend:"missing"`; `email.mailosaur:"missing"` |
| `GET /api/members/join/plans` | pass | **503** `MEMBERS_ENV_MISSING` — “STRIPE_SECRET_KEY is not configured. Stripe Join is unavailable.” |
| `POST /api/members/join/start` | pass | With `plan` → **503** same fail-closed (without Stripe); clear message |
| `POST /api/members/join/verify` | pass | **503** fail-closed without Stripe |
| `POST /api/members/webhooks/stripe` | pass | Endpoint reachable; no signature → **400** `MEMBERS_STRIPE_SIGNATURE_MISSING` (expected without webhook secret/body) |
| Homepage SSR unavailable copy | pass | Membership HTML includes “STRIPE_SECRET_KEY is not configured. Stripe Join is unavailable.” |
| `npm run lint` + `typecheck` | pass | Both exit **0** locally |
| PR CI / Preview deploy | pass | PR #8: Vercel **pass**, Vercel Preview Comments **pass**, `build` **pass** |
| Do not merge (`epic`) | pass | Sign-off is **continue epic** only |

## Bugs found

- (none)

Known backlog IDs already under test: `members-0004` in [`docs/product/backlogs/members-BACKLOG.md`](../product/backlogs/members-BACKLOG.md).

## Secrets still blocking live Join

Preview still needs for Checkout / OTP / activation (structural Pass 1 OK without them):

| Var | Status on Preview (via health / API) |
|-----|--------------------------------------|
| `DATABASE_URL` | set (`db.ok:true`) |
| `STRIPE_SECRET_KEY` | missing |
| `STRIPE_WEBHOOK_SECRET` | missing (inferred; start/plans fail on secret key first) |
| `STRIPE_PRICE_FOUNDING` / `LIFETIME` / `ANNUAL` | not verified live (blocked by secret key) |
| `MEMBERSHIP_FOUNDING_CAP` + fee cent vars | not verified live |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | missing (`email.resend:"missing"`) |
| Mailosaur (optional) | missing |

Also: run `npm run db:migrate` on Preview Neon for `stripe_webhook_events` before webhook QA; point Stripe test webhook (or CLI) at Preview `/api/members/webhooks/stripe`.

## Suggestions (non-blocking)

- CEO: set Preview Stripe test set + Resend so a later Pass can exercise plans → OTP → Checkout → return `/?joined=1#membership` and webhook activation.
- Optional: Mailosaur for `email_verify` OTP capture (`docs/members/mailosaur-qa.md`).

## Sign-off

**Pass 1:** **continue epic** — structural Join UI, anchors, health, and fail-closed Join/webhook APIs for `members-0004` pass on Preview. Live Checkout, OTP, plan seat rules, and membership activation blocked by missing Preview Stripe / Resend (expected; not a hold). Do **not** merge to `main` (epic merge gate).
