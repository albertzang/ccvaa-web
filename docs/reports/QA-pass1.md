# QA report

**Pass:** 1 (pre-merge)  
**Backlog work ID:** `members-0003` + `members-0005`  
**Environment(s) + exact URLs:** Preview https://ccvaa-web-git-feat-members-azang-projects.vercel.app (Deployment Protection bypass via `.env.local`; both `x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie=true`; bypass value omitted). API checks used header `x-vercel-protection-bypass`. Mailosaur OTP fetch via `MAILOSAUR_*` in `.env.local` (unused this run — send never succeeded).  
**Branch / PR / commit:** `feat/members` · PR https://github.com/albertzang/ccvaa-web/pull/8 · `59c4308` (report tip after Part A commit)  
**Date:** 2026-07-15  
**Result:** fail

**Save as:** `docs/reports/QA-pass1.md`

**Retest:** overwrite this same path. Do not create `-prior` / `-v2` / `-attemptN` files.

## Scope tested

Epic Preview live Pass 1:

1. **Part A `members-0003`** — health, newsletter subscribe + Mailosaur OTP confirm, preference lookup, hero Subscribe → `#contact`, invalid unsub landing  
2. **Part B `members-0005`** — seeded active member login OTP → session stub → logout; `grantsAdmin: false`; non-member rejection  

**Explicitly stopped before** live Stripe Join Checkout (`members-0004`). Health `stripe: "missing"` expected — no Stripe secrets requested.

## Checklist results — Part A (`members-0003`)

| Area | Result | Notes |
|------|--------|-------|
| Health sanity | pass | `db.ok`, `resend/mailosaur/session: configured`, `stripe: missing` (expected) |
| Schema / Neon | pass | No 503 schema errors; seed data readable — **not** a remigrate hold |
| Subscribe → Mailosaur OTP → confirm | fail | Subscribe **502** `MEMBERS_EMAIL_SEND_FAILED` — Invalid Resend `from` field. OTP never sent |
| Preference lookup | pass | `annual@ccvaa-seed.test` → `status: on` |
| Hero Subscribe → `#contact` | pass | Homepage HTML |
| Invalid unsub landing | pass | Invalid/expired copy shown |

## Checklist results — Part B (`members-0005`)

| Area | Result | Notes |
|------|--------|-------|
| Seeded annual login OTP | fail | Seed code `123456` → **400** `MEMBERS_OTP_INVALID` (expired/stale). `POST /api/members/login/start` for `annual@ccvaa-seed.test` → **502** same Resend `from` failure — cannot refresh OTP or use Mailosaur for `@ccvaa-seed.test` |
| Session stub + logout | blocked | No successful verify → no session cookie to assert |
| `grantsAdmin: false` | blocked | Requires authenticated session |
| Non-member rejected clearly | pass | Mailosaur non-member address → **4xx** with “No active membership found…” |
| Login UI (`#membership`) | pass | Homepage includes membership / login surface |
| Schema 503 | n/a | Not observed |

## Bugs found

- **high — Preview `RESEND_FROM_EMAIL` invalid format** (blocks both `members-0003` and `members-0005` live OTP)  
  **URLs:**  
  - https://ccvaa-web-git-feat-members-azang-projects.vercel.app/api/members/newsletter/subscribe  
  - https://ccvaa-web-git-feat-members-azang-projects.vercel.app/api/members/login/start  
  **Repro:** Health shows `email.resend: "configured"`. `POST` subscribe or login/start.  
  **Actual:** 502 `MEMBERS_EMAIL_SEND_FAILED` — “Invalid `from` field. The email address needs to follow the `email@example.com` or `Name <email@example.com>` format.”  
  **Fix (CEO):** Correct Preview env `RESEND_FROM_EMAIL` (e.g. `CCVAA <onboarding@resend.dev>`). Health only checks non-empty.

- **medium — Seed login OTP not usable for live Pass 1 without re-seed**  
  **URL:** `/api/members/login/verify` with `annual@ccvaa-seed.test` + seed code  
  **Actual:** `MEMBERS_OTP_INVALID`. After Resend `from` is fixed, either re-seed Preview OTP or send login OTP to a Mailosaur-backed active member email.

## Suggestions (non-blocking)

- Validate `RESEND_FROM_EMAIL` format in health so Preview does not report `configured` when Resend will reject sends.
- For future live login E2E, seed or promote one active member whose email is `@<MAILOSAUR_SERVER_ID>.mailosaur.net`.

## FEATURES.md drift

None for newsletter/login UI. Live OTP paths blocked by Preview Resend env.

## Sign-off

**Pass 1:** **hold** — Parts A and B UI/API fail-closed and non-member messaging look good; **live OTP E2E blocked** by Preview `RESEND_FROM_EMAIL` format. Neon migrate/seed **not** implicated (no schema 503). Epic stays open; do **not** merge to `main`.

**Stopped before Stripe** per CEO/PM pause — no Join Checkout testing; no Stripe secrets requested.

**Next (PM/CEO):** Fix Preview `RESEND_FROM_EMAIL` → retest Pass 1 live `0003`/`0005` (overwrite this report). Then decide non-Stripe tickets (`0006` / `0008`) or pause for Stripe setup.
