# QA report

**Pass:** 1 (pre-merge)  
**Backlog work ID:** `members-0004`  
**Environment(s) + exact URLs:** Preview https://ccvaa-web-git-feat-members-azang-projects.vercel.app (Deployment Protection bypass via `.env.local`; both `x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie=true`; bypass value omitted). API checks used header `x-vercel-protection-bypass`. Mailosaur OTP via `MAILOSAUR_*` (values omitted). Stripe Test mode card `4242…` (full PAN omitted).  
**Branch / PR / commit:** `feat/members` · PR https://github.com/albertzang/ccvaa-web/pull/8 · `9ba157a` (tip at retest start; Price ID env fix was Preview redeploy)  
**Date:** 2026-07-15  
**Result:** pass

**Save as:** `docs/reports/QA-pass1.md`

**Retest:** overwrite this same path. Do not create `-prior` / `-v2` / `-attemptN` files.

## Scope tested

**Retest** after CEO fixed Preview Stripe Price IDs (`price_…` not `prod_…`) and redeployed Preview. Live Join path for **members-0004**:

1. Health `stripe: "configured"`
2. `#membership` Join UI + `GET /api/members/join/plans` (pre-cap Founding + Annual; Lifetime fee rule via config)
3. Join start → Mailosaur `email_verify` OTP → verify → Stripe Checkout Session URL
4. Invalid OTP fail path
5. Stripe Checkout payment (test card) → return `/?joined=1#membership`
6. Webhook activation evidenced by `POST /api/members/login/start` → 200 for the Join email

Epic merge gate → **continue epic** (do **not** merge).

## Checklist results

| Area | Result | Notes |
|------|--------|-------|
| Preview bypass | pass | No Vercel wall with both bypass params |
| Health `stripe: configured` | pass | `db.ok`; Resend/Mailosaur/session configured |
| Plans UI / API | pass | Pre-cap: Founding + Annual available; `99 of 100 Founding seats remaining`; Lifetime not offered (expected) |
| Lifetime fee > Founding | pass | Config validates (health `configured`); Lifetime not in pre-cap offers |
| Join UI (`#membership`) | pass | Join panel present with Founding + Annual |
| Invalid OTP | pass | `POST /api/members/join/verify` with `000000` → clear error (4xx / `ok: false`) |
| Join start + Mailosaur OTP | pass | Annual start succeeded; OTP via Mailosaur API |
| Verify → Checkout URL | pass | Prior hold cleared — Checkout Session URL returned (`checkout.stripe.com`) |
| Stripe Checkout (4242…) | pass | Card accordion expanded; test card paid; left Checkout |
| Success return `/?joined=1#membership` | pass | Redirect to Preview with `joined=1` and `#membership` |
| Webhook activates membership | pass | `login/start` for Join email → HTTP 200 (active member eligible); roster API not used (admin session 405/401 on this path) |
| Lint / typecheck | pass | `tsc --noEmit` clean; `eslint src/app/**/*.{ts,tsx}` clean |

## Bugs found

List new defects for PM triage (do **not** invent work IDs). Include severity + short repro.  
PM promotes each to a backlog `bug` (**Source:** `qa`).

- (none)

Prior blocker (Product IDs in `STRIPE_PRICE_*`) is **resolved** on Preview after CEO env fix + redeploy.

## Suggestions (non-blocking)

- Admin roster evidence path returned 405/401 during this pass; activation was confirmed via `login/start` instead. Optional: document preferred post-Join evidence for QA (login vs roster) when admin mail session is unavailable in headless automation.
- Map Stripe `StripeInvalidRequestError` to a clearer fail-closed code if env misconfiguration recurs (still useful ops signal).

## FEATURES.md drift

None observed — Join → Checkout → `/?joined=1#membership` + webhook activation matches FEATURES Join / Stripe (`members-0004`) description.

## Sign-off

**Pass 1:** **continue epic** — full Join → Mailosaur OTP → Stripe Checkout → success return → webhook activation verified on Preview. Epic stays open; do **not** merge to `main`.
