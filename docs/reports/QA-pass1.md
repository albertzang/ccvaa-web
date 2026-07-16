# QA report

**Pass:** 1 (pre-merge)  
**Backlog work ID:** `members-0003`  
**Environment(s) + exact URLs:** Preview https://ccvaa-web-git-feat-members-azang-projects.vercel.app (Deployment Protection bypass via `.env.local`; both `x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie=true`; bypass value omitted). API checks used header `x-vercel-protection-bypass`.  
**Branch / PR / commit:** `feat/members` · PR https://github.com/albertzang/ccvaa-web/pull/8 · `836427b`  
**Date:** 2026-07-15  
**Result:** fail

**Save as:** `docs/reports/QA-pass1.md`

**Retest:** overwrite this same path. Do not create `-prior` / `-v2` / `-attemptN` files.

## Scope tested

`members-0003` live newsletter on epic Preview — health, subscribe + Mailosaur OTP confirm, preference lookup, hero Subscribe → `#contact`, invalid unsub landing. Merge gate **epic**. **Stopped before Stripe.** Part B (`members-0005`) not yet in this commit.

## Checklist results

| Area | Result | Notes |
|------|--------|-------|
| Health sanity | pass | `db.ok`, `email.resend: configured`, `email.mailosaur: configured`, `session: configured`, `stripe: missing` (expected) |
| Schema / Neon | pass | No 503 schema errors; seed preference lookup works (not a remigrate hold) |
| Subscribe → Mailosaur OTP → confirm | fail | `POST /api/members/newsletter/subscribe` → **502** `MEMBERS_EMAIL_SEND_FAILED`: Invalid `from` field (Resend rejects Preview `RESEND_FROM_EMAIL` format). OTP never sent; Mailosaur unused |
| Preference lookup | pass | Seed `annual@ccvaa-seed.test` → `status: on`; API returns preference object. (Seed `newsletter-only@…` currently `off` — still proves lookup path) |
| Hero Subscribe → `#contact` | pass | Homepage HTML: Subscribe CTA + `href="#contact"` |
| Invalid unsub landing | pass | `/?unsub=definitely-invalid-token-qa` renders “This unsubscribe link is invalid or has expired.” |
| Live Stripe Join | n/a | Explicitly out of scope this run |

## Bugs found

- **high — Preview `RESEND_FROM_EMAIL` invalid format**  
  **URL:** https://ccvaa-web-git-feat-members-azang-projects.vercel.app/api/members/newsletter/subscribe  
  **Repro:** `POST` subscribe with a Mailosaur address while health shows `email.resend: "configured"`.  
  **Expected:** 200 pending + OTP in Mailosaur.  
  **Actual:** 502 `MEMBERS_EMAIL_SEND_FAILED` — Resend: “Invalid `from` field. The email address needs to follow the `email@example.com` or `Name <email@example.com>` format.”  
  **Fix (CEO/PM):** Set Preview `RESEND_FROM_EMAIL` to a valid value such as `CCVAA <onboarding@resend.dev>` (see `.env.example` / `docs/members/mailosaur-qa.md`). Health only checks non-empty, not format.

## Suggestions (non-blocking)

- Optionally tighten `isResendConfigured` / health to validate `from` format so Preview does not report `configured` when Resend will reject sends.

## FEATURES.md drift

None observed for Contact newsletter UI. Live double opt-in blocked by Preview env, not product UI.

## Sign-off

**Pass 1:** **hold** — `members-0003` UI/lookup/unsub landing OK; live subscribe OTP blocked by Preview Resend `from` misconfiguration. Epic stays open; do **not** merge to `main`. Part B next after this report commit (or same hold once Resend fixed + retest).
