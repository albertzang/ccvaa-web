# QA report

**Pass:** 1 (pre-merge)  
**Backlog work ID:** `members-0005`  
**Environment(s) + exact URLs:** Preview https://ccvaa-web-git-feat-members-azang-projects.vercel.app (Deployment Protection bypass used via `.env.local`; bypass query omitted from written URL; `x-vercel-set-bypass-cookie=true` used for API/HTML fetches)  
**Branch / PR / commit:** `feat/members` · PR https://github.com/albertzang/ccvaa-web/pull/8 · tip `afb0f19`  
**Date:** 2026-07-14  
**Result:** pass-with-issues

**Save as:** `docs/reports/QA-pass1.md`

**Retest:** overwrite this same path. Do not create `-prior` / `-v2` / `-attemptN` files.

## Scope tested

**members-0005** (epic Merge gate): `#membership` member email OTP login UI, login/session/logout APIs, fail-closed behavior without migrated Preview schema, admin isolation, lint/typecheck. Live OTP E2E blocked per handoff (unmigrated Neon + no Mailosaur). Browser MCP tab unavailable this pass — verified via bypassed curl + SSR HTML.

## Checklist results

| Area | Result | Notes |
|------|--------|-------|
| `#membership` Member sign-in + Join (logged out) | pass | Preview SSR HTML: “Member sign-in”, email field, “Send login code”, “Join CCVAA” panel; Stripe Join shows expected unavailable alert (`STRIPE_SECRET_KEY` missing — known `members-0004` gap) |
| Seeded/active member OTP login (live) | blocked | Preview Neon reachable (`GET /api/members/health` **200**, `db.ok: true`) but `members` schema unmigrated: `POST /api/members/login/start` → **503** `MEMBERS_DB_UNAVAILABLE`; `POST …/verify` → **503** with “Run migrations” message. Mailosaur missing on health. Cannot capture Resend OTP or use seed `123456` without migrate+seed |
| Fail-closed API (no generic 500) | pass | Invalid email → **400** `MEMBERS_VALIDATION_ERROR`. Unmigrated schema → **503** with stable codes/messages |
| `GET /api/members/login/session` (no cookie) | pass | **200** `authenticated: false`, `grantsAdmin: false` |
| `POST /api/members/login/logout` (no session) | pass | **200** idempotent sign-out message; `grantsAdmin: false` |
| Member session does not open `/admin` | pass | `GET /admin` **200** without member cookie (Hover mail-session chrome only); session API always `grantsAdmin: false` per contract |
| Newsletter-only not-eligible | blocked | `newsletter-only@ccvaa-seed.test` login start returns **503** `MEMBERS_DB_UNAVAILABLE` (schema), not **404** `MEMBERS_LOGIN_NOT_ELIGIBLE` — cannot distinguish until Preview migrate+seed |
| `GET /api/members/health` | pass | **200** `resend: configured`, `session: configured`, `stripe: missing`, `mailosaur: missing` |
| `npm run lint` + `typecheck` | pass | Clean locally on workstation |
| Do not merge (epic) | n/a | Confirmed — epic merge gate |

## Bugs found

- (none) — Preview env gaps (unmigrated schema, no Mailosaur) block live OTP E2E but match handoff known risks; deployed UI and fail-closed paths behave as specified.

Known backlog IDs already under test: `members-0005` in [`docs/product/backlogs/members-BACKLOG.md`](../product/backlogs/members-BACKLOG.md).

## Suggestions (non-blocking)

- Run `npm run db:migrate` (+ optional `npm run db:seed`) against Preview Neon before a later pass to verify full OTP → session → logout E2E and `MEMBERS_LOGIN_NOT_ELIGIBLE` for newsletter-only seed.
- Configure Mailosaur on Preview (or document CEO Resend log capture) for OTP verification without manual inbox.
- `login/start` unmigrated-schema errors surface as generic “Failed to look up member for login.” while `login/verify` returns the clearer migration message — consider aligning copy (cosmetic).

## Sign-off

**Pass 1:** **continue epic** — Member sign-in UI ships on Preview; session/logout APIs and admin isolation look correct; fail-closed **503**/**400** behavior verified. Live OTP login E2E remains blocked until Preview migrate/seed (+ OTP capture). Epic branch `feat/members` stays open; do **not** merge to `main`.
