# QA report

**Pass:** 1 (pre-merge)  
**Backlog work ID:** `members-0005`  
**Environment(s) + exact URLs:** Preview https://ccvaa-web-git-feat-members-azang-projects.vercel.app (Deployment Protection bypass via `.env.local`; both `x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie=true`; bypass value omitted from report). API checks used header `x-vercel-protection-bypass`.  
**Branch / PR / commit:** `feat/members` · PR https://github.com/albertzang/ccvaa-web/pull/8 · tip at report writing `1be7eef` (Part A hold commit); reconfirm tip on push  
**Date:** 2026-07-14  
**Result:** fail

**Save as:** `docs/reports/QA-pass1.md`

**Retest:** overwrite this same path. Do not create `-prior` / `-v2` / `-attemptN` files.

## Scope tested

Part B — `members-0005` member OTP login on epic Preview (after Part A `members-0003` **hold** for schema). Confirmed past Vercel auth wall. Health, login start/verify/session/logout APIs, `#membership` UI markers, admin isolation, fail paths. Live OTP E2E blocked: login **start** itself returns schema **503** (not merely uncapturable OTP). Merge gate **epic** — **continue epic** / **hold** / **retest** (not merge to `main`).

**Part A context:** Same Preview same session — newsletter subscribe/preference also **503** schema missing; report previously overwritten+pushed as `members-0003` hold (`1be7eef`).

## Checklist results

| Area | Result | Notes |
|------|--------|-------|
| Preview protection bypass | pass | Both query params; site title CCVAA; not Vercel login wall |
| `GET /api/members/health` | pass | **200** `db.ok`, `resend: configured`, `session: configured`, `stripe: missing`, `mailosaur: missing` |
| `#membership` Member sign-in + Join (logged out) | pass | SSR HTML: “Member sign-in”, “Send login code”, “Join CCVAA”, `#membership`. Stripe Join unavailable expected (`stripe: missing`) |
| Seeded active member OTP (start → verify → stub) | fail / blocked | `POST /api/members/login/start` `annual@ccvaa-seed.test` → **503** `MEMBERS_DB_UNAVAILABLE` (“Failed to look up member for login.”). Verify with seed `123456` → **503** schema incomplete. No Resend OTP accepted; Mailosaur missing |
| Newsletter-only / non-member not-eligible | blocked | `newsletter-only@ccvaa-seed.test` start → **503** schema (cannot observe `MEMBERS_LOGIN_NOT_ELIGIBLE`) |
| Fail paths / validation | pass | Invalid email start → **400** `MEMBERS_VALIDATION_ERROR`. Schema failures return **503** (not generic 500) |
| `GET /api/members/login/session` | pass | **200** `authenticated: false`, `grantsAdmin: false` |
| `POST /api/members/login/logout` | pass | **200** idempotent “Signed out of membership.”; `grantsAdmin: false` |
| Member cookie does not open `/admin` | pass | No member session obtainable; session always `grantsAdmin: false`; `/admin` is Hover mail-session chrome only |
| `npm run lint` + `typecheck` | pass | Clean (ran with Part A) |
| Do not merge (epic) | n/a | Confirmed |

## Bugs found

List new defects for PM triage (do **not** invent work IDs). Include severity + short repro.  
PM promotes each to a backlog `bug` (**Source:** `qa`).

1. **Preview Neon schema incomplete blocks member login start** — **severity: high** (same root cause as Part A newsletter)  
   - **URL:** https://ccvaa-web-git-feat-members-azang-projects.vercel.app  
   - **Repro:** Bypass protection → health **200** with `session: configured` + `resend: configured` → `POST /api/members/login/start` `{"email":"annual@ccvaa-seed.test"}` → **503** `MEMBERS_DB_UNAVAILABLE`. Verify similarly fails with migrate message.  
   - **Expected:** After migrate + seed, start accepts and sends OTP (or clear not-eligible for newsletter-only).  

Known backlog IDs: `members-0005` (and shared Preview schema issue from `members-0003` Part A).

## Suggestions (non-blocking)

- Migrate + seed the Preview `DATABASE_URL`, then retest login start (Resend) and preferential OTP capture via Resend logs / Mailosaur.
- Cursor browser MCP tabs unavailable this session; UI via bypassed HTML fetch.

## FEATURES.md drift

None for login copy. PM: health `db.ok` does not imply members tables migrated.

## Sign-off

**Pass 1:** **hold** — `#membership` UI + session/logout + validation look good, but login **start** is not accepted on this Preview (schema missing). Epic stays open; do **not** merge to `main`. Retest after Preview migrate (+ seed).
