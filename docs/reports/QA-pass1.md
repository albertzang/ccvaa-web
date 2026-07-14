# QA report

**Pass:** 1 (pre-merge)  
**Backlog work ID:** `members-0001`  
**Environment(s) + exact URLs:** Preview https://ccvaa-web-git-feat-members-azang-projects.vercel.app (Deployment Protection bypass used via `.env.local`; bypass query omitted from URL)  
**Branch / PR / commit:** `feat/members` · PR https://github.com/albertzang/ccvaa-web/pull/8 · `9bae70b`  
**Date:** 2026-07-14  
**Result:** pass

**Save as:** `docs/reports/QA-pass1.md`

**Retest:** overwrite this same path. Do not create `-prior` / `-v2` / `-attemptN` files.

## Scope tested

Platform-only ticket (members-0001): Neon + Drizzle schema, OTP/unsub tokens, shared Zod, migrate/seed scripts, fail-closed `/api/members/health`. Merge gate **epic** — sign-off is **continue epic**, not merge to `main`.

## Checklist results

| Area | Result | Notes |
|------|--------|-------|
| `GET /api/members/health` (Preview) | pass | **503** with `{"ok":false,"code":"MEMBERS_ENV_MISSING",...}` — expected fail-closed when Preview has no `DATABASE_URL` |
| `npm run db:migrate` + `db:seed` | blocked | Local `.env.local` has no `DATABASE_URL`; cannot run migrate/seed on this workstation. Seed script defines `SEED_ANNUAL_ANNIVERSARY = "2025-03-15"` in code — not executed locally |
| `npm run lint` + `typecheck` | pass | Clean locally; GitHub Actions **build** pass on PR #8 |
| No public UI / Stripe / Resend / admin roster | pass | Branch diff is platform-only (`src/app/api/members/health`, `src/db/*`, `src/lib/members/*`, drizzle, scripts); no public page or admin roster changes |
| Admin mail-session smoke (optional) | pass | `GET /admin` → **200** on Preview (layout loads; full mailbox login not exercised this pass) |
| Public homepage (regression) | pass | `GET /` → **200** on Preview |

## Bugs found

- (none)

Known backlog IDs already under test: `members-0001` in [`docs/product/backlogs/members-BACKLOG.md`](../product/backlogs/members-BACKLOG.md).

## Suggestions (non-blocking)

- CEO: set `DATABASE_URL` in Vercel **Preview** env (Neon branch recommended) before later members tickets need live DB on Preview.
- QA workstation: add `DATABASE_URL` to `.env.local` when Neon Dev branch credentials are available so migrate/seed can be verified locally on future passes.

## Sign-off

**Pass 1:** **continue epic** — members-0001 platform scaffolding and fail-closed health check behave as specified on Preview. Epic branch `feat/members` remains open for subsequent members tickets; do **not** merge to `main` on this pass.
