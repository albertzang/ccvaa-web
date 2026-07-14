# QA report

**Pass:** 1 (pre-merge)  
**Backlog work ID:** `members-0006`  
**Environment(s) + exact URLs:** Preview https://ccvaa-web-git-feat-members-azang-projects.vercel.app (Deployment Protection bypass via `.env.local`; both `x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie=true`; bypass value omitted from report). API checks used header `x-vercel-protection-bypass`.  
**Branch / PR / commit:** `feat/members` · PR https://github.com/albertzang/ccvaa-web/pull/8 · `af5df0b`  
**Date:** 2026-07-14  
**Result:** pass-with-issues

**Save as:** `docs/reports/QA-pass1.md`

**Retest:** overwrite this same path. Do not create `-prior` / `-v2` / `-attemptN` files.

## Scope tested

`members-0006` — logged-in `#membership` profile (name edit, email OTP change, Annual renewal fields, perks placeholder; no newsletter UI in profile slot). Epic Preview after `af5df0b`. Merge gate **epic** — sign-off **continue epic** (not merge to `main`).

Live logged-in profile / name / email OTP / Annual anniversary E2E **blocked** on this Preview: member login **start** still returns **503** `MEMBERS_DB_UNAVAILABLE` (shared Neon schema-not-migrated issue from `members-0003` / `members-0005` QA). Verified logged-out UI smoke, fail-closed APIs (401/503), and SSR markers. Cursor browser MCP tabs unavailable; UI via bypassed HTML fetch + API probes.

## Checklist results

| Area | Result | Notes |
|------|--------|-------|
| Preview protection bypass | pass | Both query params; CCVAA homepage loads; not Vercel login wall |
| `#membership` logged-out UI | pass | SSR: “Member sign-in”, “Send login code”, “Join CCVAA”; no `member-profile-name`, “Your membership” title, or “Member perks” (profile-only markers absent when logged out) |
| `#membership` logged-in profile UI | blocked | Cannot obtain member session — `POST /api/members/login/start` `annual@ccvaa-seed.test` → **503** schema. Code review: `MemberProfileForm` renders name/email/perks/logout; `MembershipPanel` swaps login/join for profile when `authenticated` |
| Name save + session persist | blocked | `PATCH /api/members/profile/name` without session → **401** `MEMBERS_SESSION_INVALID` (fail-closed). Live save/refresh not testable without login |
| Email change OTP flow | blocked | `POST /api/members/profile/email/start` / `verify` without session → **401**. Resend configured on Preview (`health`); cannot exercise send/verify E2E |
| Annual anniversary / next renewal | blocked | Seed `annual@ccvaa-seed.test` login **503**; cannot confirm read-only Annual fields or Founding/Lifetime omission live |
| Perks placeholder | blocked (code ok) | `MemberProfileForm` includes dashed perks card (“Member perks” copy in `site.ts`); not in logged-out SSR |
| No newsletter UI in `#membership` profile slot | pass | Logged-out SSR: no `newsletter-email` id (`NewsletterForm` lives in `#contact` only). Membership copy mentions newsletter stays in Contact — not a control. Join newsletter opt-in not in SSR chunk (client-only when Join shown). Profile component has no newsletter controls |
| Fail-closed APIs | pass | Unauthenticated profile/name/email → **401**. Invalid login email → **400** `MEMBERS_VALIDATION_ERROR`. Health without DB would **503**; Preview health **200** `db.ok`, `resend: configured`, `session: configured`, `stripe: missing` |
| Logout | pass | `POST /api/members/login/logout` → **200** “Signed out of membership.”, `grantsAdmin: false`. `GET /api/members/login/session` → **200** `authenticated: false` |
| Member cookie does not open `/admin` | pass | No member session obtainable; session API always `grantsAdmin: false`; `/admin` returns **200** Hover mail-session chrome (no member grant) |
| `npm run lint` + `typecheck` | pass | Clean on `feat/members` @ `af5df0b` |
| Do not merge (epic) | n/a | Confirmed |

## Bugs found

- (none new for `members-0006`)

**Shared infrastructure blocker (known):** Preview `DATABASE_URL` connects (`GET /api/members/health` **200** `db.ok`) but members tables appear unmigrated — login **start** and profile E2E fail **503**. Previously reported in `members-0005` Pass 1 QA; PM/CEO: run migrate + seed on Preview Neon, then retest login + profile flows.

## Suggestions (non-blocking)

- After Preview migrate + seed, retest: login as `annual@ccvaa-seed.test` → profile shows anniversary/next renewal; Founding/Lifetime omit renewal; name save survives refresh; email change OTP via Resend logs.
- Prefer Mailosaur on Preview for repeatable OTP capture.

## FEATURES.md drift

None observed for profile copy/structure. PM note: health `db.ok` does not imply members schema migrated.

## Sign-off

**Pass 1:** **continue epic** — `members-0006` profile implementation and fail-closed behavior look correct; logged-in E2E blocked by shared Preview schema gap (not a regression in this ticket). Epic stays open; do **not** merge to `main`. Retest profile E2E after Preview migrate + seed.
