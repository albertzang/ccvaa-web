# QA report

**Pass:** 1 (pre-merge)  
**Backlog work ID:** `members-0006`  
**Environment(s) + exact URLs:** Preview https://ccvaa-web-git-feat-members-azang-projects.vercel.app (Deployment Protection bypass via `.env.local`; both `x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie=true`; bypass value omitted). API checks used header `x-vercel-protection-bypass`. Mailosaur OTP via `MAILOSAUR_*`; admin Hover mail-session via `ADMIN_EMAIL` / `ADMIN_PASS` (values omitted).  
**Branch / PR / commit:** `feat/members` · PR https://github.com/albertzang/ccvaa-web/pull/8 · tip at report commit  
**Date:** 2026-07-15  
**Result:** pass

**Save as:** `docs/reports/QA-pass1.md`

**Retest:** overwrite this same path. Do not create `-prior` / `-v2` / `-attemptN` files.

## Scope tested

**Part A `members-0006`** — logged-in `#membership` profile E2E on Preview (no Stripe):

- Temporary admin promote of Mailosaur address → annual/active (with anniversary + next renewal)
- Login OTP (Mailosaur) → `GET /api/members/profile`
- Name edit + Zod rejection of empty name
- Email change start → Mailosaur OTP on new address → verify (identity update)
- Browser: profile UI in `#membership` (perks placeholder; no newsletter controls)
- Roster restored to newsletter-only after

**Explicitly stopped before** live Stripe Join Checkout (`members-0004`). Health `stripe: "missing"` expected.

## Checklist results — Part A (`members-0006`)

| Area | Result | Notes |
|------|--------|-------|
| Health sanity | pass | `db.ok`, resend/session configured; `stripe: missing` (expected) |
| Login → profile | pass | Mailosaur login; profile returns name + annual plan |
| Annual anniversary / next renewal | pass | Both present on profile after annual promote |
| Name edit | pass | PATCH name OK; empty/whitespace name rejected (Zod) |
| Email change re-verify | pass | OTP to new Mailosaur address required before email update |
| Perks placeholder | pass | “Member perks” placeholder visible in `#membership` |
| No newsletter UI in profile | pass | No subscribe/opt-in controls in profile face (informational copy may mention newsletter → Contact) |

## Bugs found

- (none)

## Suggestions (non-blocking)

- Seed one Preview active member on `@<MAILOSAUR_SERVER_ID>.mailosaur.net` so profile/login E2E does not need temporary admin promote.

## FEATURES.md drift

None observed for logged-in profile behavior exercised this run.

## Sign-off

**Pass 1:** **continue epic** — `members-0006` logged-in profile E2E passes on Preview. Epic stays open; do **not** merge to `main`.

**Stopped before Stripe** — no Join Checkout testing; no Stripe secrets requested.

**Next:** Part B `members-0008` admin roster (same Preview), then stop for CEO Stripe setup.
