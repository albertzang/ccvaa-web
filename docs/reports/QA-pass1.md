# QA report

**Pass:** 1 (pre-merge)  
**Backlog work ID:** `members-0002`  
**Environment(s) + exact URLs:** Preview https://ccvaa-web-git-feat-members-azang-projects.vercel.app (Deployment Protection bypass used via `.env.local`; bypass query omitted from URL)  
**Branch / PR / commit:** `feat/members` · PR https://github.com/albertzang/ccvaa-web/pull/8 · `659db03`  
**Date:** 2026-07-14  
**Result:** pass

**Save as:** `docs/reports/QA-pass1.md`

**Retest:** overwrite this same path. Do not create `-prior` / `-v2` / `-attemptN` files.

## Scope tested

Resend transactional send path + shared confirm/OTP helpers (DB challenges, 15-minute expiry, rate limits). Mailosaur documented for Preview QA. No public forms or admin UI. Merge gate **epic** — sign-off is **continue epic**, not merge to `main`.

## Checklist results

| Area | Result | Notes |
|------|--------|-------|
| `GET /api/members/health` (Preview) | pass | **503** with `email.resend: "missing"`, `email.mailosaur: "missing"`, `code: "MEMBERS_ENV_MISSING"` — no secrets in JSON body |
| `npm run members:send-otp-test` fail-closed (local) | pass | Exits **1** with clear message: `DATABASE_URL is not configured...` (no `DATABASE_URL` / Resend keys in local `.env.local`) |
| Live OTP send + Mailosaur verify | blocked | Preview env lacks `DATABASE_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`; local `.env.local` also lacks these + Mailosaur vars. Full round-trip deferred per handoff — not a defect for this pass |
| Rate limits documented | pass | `docs/members/mailosaur-qa.md`: 3 challenges/email/purpose/hour, 5 verify attempts/challenge, 15-minute TTL; matches `src/lib/members/otp-config.ts` |
| `npm run lint` + `typecheck` | pass | Clean locally; GitHub Actions **build** pass on PR #8 |
| No public UI / Stripe / admin roster | pass | Only `/api/members/health` route added; no new public pages or admin roster changes |
| Admin mail-session smoke (optional) | pass | `GET /admin` → **200** on Preview (layout loads; mailbox login not exercised) |
| Public homepage (regression) | pass | `GET /` → **200** on Preview |

## Bugs found

- (none)

Known backlog IDs already under test: `members-0002` in [`docs/product/backlogs/members-BACKLOG.md`](../product/backlogs/members-BACKLOG.md).

## Suggestions (non-blocking)

- CEO: set `DATABASE_URL`, `RESEND_API_KEY`, and `RESEND_FROM_EMAIL` in Vercel **Preview** when live send tests on Preview are needed for later members tickets.
- QA workstation: add Neon + Resend test keys + Mailosaur vars to `.env.local` to exercise `members:send-otp-test` send/verify flow locally on a future pass.

## Sign-off

**Pass 1:** **continue epic** — members-0002 Resend/OTP helpers and fail-closed behavior match spec on Preview. Live OTP round-trip blocked by missing Preview/local secrets (expected). Epic branch `feat/members` remains open; do **not** merge to `main` on this pass.
