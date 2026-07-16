# QA report

**Pass:** 1 (pre-merge)  
**Backlog work ID:** `members-0004`  
**Environment(s) + exact URLs:** Preview https://ccvaa-web-git-feat-members-azang-projects.vercel.app (Deployment Protection bypass via `.env.local`; both `x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie=true`; bypass value omitted). API checks used header `x-vercel-protection-bypass`. Mailosaur OTP via `MAILOSAUR_*` (values omitted).  
**Branch / PR / commit:** `feat/members` · PR https://github.com/albertzang/ccvaa-web/pull/8 · `7c7ee44`  
**Date:** 2026-07-15  
**Result:** fail

**Save as:** `docs/reports/QA-pass1.md`

**Retest:** overwrite this same path. Do not create `-prior` / `-v2` / `-attemptN` files.

## Scope tested

Live Join path for **members-0004** (Stripe Join Checkout) on Preview:

1. Health `stripe: "configured"`
2. `#membership` Join UI + `GET /api/members/join/plans` (pre-cap Founding + Annual; seat note; Lifetime fee rule via config)
3. Join start → Mailosaur `email_verify` OTP → verify → Stripe Checkout Session
4. Invalid OTP fail path
5. Checkout payment + webhook activation (**blocked** — never reached Checkout URL)

Epic merge gate → **hold** (do **not** merge).

## Checklist results

| Area | Result | Notes |
|------|--------|-------|
| Preview bypass | pass | No Vercel wall with both bypass params |
| Health `stripe: configured` | pass | `db.ok`; Resend/Mailosaur/session configured |
| Plans UI / API | pass | Pre-cap: Founding + Annual available; `99 of 100 Founding seats remaining`; Lifetime not offered (expected) |
| Lifetime fee > Founding | pass | Config validates (health would not report `configured` otherwise); Lifetime not in pre-cap offers |
| Join UI (`#membership`) | pass | Join title, name/email fields, Founding + Annual, checkout CTA |
| Invalid OTP | pass | `POST /api/members/join/verify` with `000000` → clear error (4xx / `ok: false`) |
| Join start + Mailosaur OTP | pass | Annual and Founding starts succeeded; OTP retrieved via Mailosaur API |
| Verify → Checkout URL | **fail** | `POST /api/members/join/verify` → HTTP 500 `MEMBERS_INTERNAL_ERROR` |
| Stripe Checkout (4242…) | blocked | No Checkout URL returned |
| Success return `/?joined=1#membership` | blocked | Not reached |
| Webhook activates membership | blocked | Not reached |
| Lint | pass-with-issues | `eslint` clean for app; unused helpers only in local QA script (not shipped) |

## Bugs found

List new defects for PM triage (do **not** invent work IDs). Include severity + short repro.  
PM promotes each to a backlog `bug` (**Source:** `qa`).

- **blocker — Preview Stripe Price IDs are Product IDs (`prod_…`), not Price IDs (`price_…`)**  
  - **URL:** https://ccvaa-web-git-feat-members-azang-projects.vercel.app  
  - **Repro:**  
    1. `POST /api/members/join/start` with Mailosaur email + plan `annual` or `founding` → 200, OTP delivered.  
    2. `POST /api/members/join/verify` with valid 6-digit OTP → **500** `MEMBERS_INTERNAL_ERROR`.  
  - **Evidence (Vercel runtime logs, Preview `feat/members`):** Stripe `StripeInvalidRequestError` / `resource_missing`:  
    - Annual: `No such price: 'prod_UtTjwJ4gVdh7mm'` (`line_items[0][price]`)  
    - Founding: `No such price: 'prod_UtU4qRJEPLQbRI'`  
  - **Expected:** `STRIPE_PRICE_ANNUAL` / `STRIPE_PRICE_FOUNDING` / `STRIPE_PRICE_LIFETIME` are Stripe **Price** IDs (`price_…`) matching test Products.  
  - **Actual:** Env values are **Product** IDs (`prod_…`); Checkout Session create fails before a URL is returned.  
  - **Owner:** CEO / env (Vercel Preview) — replace with Price IDs from Stripe Test mode Dashboard → Product → Price. Then retest Pass 1.  
  - **Browser:** Playwright/Chromium (API path) + Cursor QA workstation.

## Suggestions (non-blocking)

- Map Stripe `StripeInvalidRequestError` (e.g. invalid price) to `MEMBERS_STRIPE_ERROR` (502) instead of generic `MEMBERS_INTERNAL_ERROR` (500) so QA/ops see a clearer fail-closed signal without reading runtime logs.
- After Price IDs are fixed, re-run full path: Checkout test card `4242…` → `/?joined=1#membership` → roster or `login/start` evidence of active plan.

## FEATURES.md drift

None for Join UI / plans / OTP start. Checkout activation path not observable until Price IDs are corrected.

## Sign-off

**Pass 1:** **hold** — Join UI, plans, health, Mailosaur OTP start/verify-attempt work; **blocked on Preview Stripe env** (Product IDs in `STRIPE_PRICE_*`). Epic stays open; do **not** merge to `main`. Retest after CEO sets real test **Price** IDs and redeploys/refreshes Preview env.
