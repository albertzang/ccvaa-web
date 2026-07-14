# Handoff: Developer / PM → QA

**Date:** 2026-07-14  
**Pass:** `1`  
**Backlog work ID:** `members-0005`  
**Ship path that led here:** `feature-branch`  
**Epic branch:** `feat/members`  
**Merge gate:** `epic`  
**Filled by:** Developer  

**Save as:** `docs/handoffs/HANDOFF-QA-pass1.md`

**Branch name:** `feat/members`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/8  
**Commit:** _(latest after push — use branch HEAD)_  
**Preview URL:** https://ccvaa-web-git-feat-members-azang-projects.vercel.app  
**Preview protection:** QA reads `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local` (do **not** paste the secret here). See `docs/protocols/PREVIEW_PROTECTION.md`.  
**Production URL:** https://ccvaa-web.vercel.app/ (Pass **2** only — not for this pass)

**Post-merge cleanup (Pass 2 only):** n/a until **merge milestone**

**Out of scope for QA:** https://ccvaa.ca/ — CEO manual only. OAuth/passwords; admin auth; Join redesign; full profile UI (`members-0006`).

## What changed

`#membership` member email OTP login wall: send 6-digit code (Resend, `purpose=login`) → verify → httpOnly signed cookie `ccvaa_member_session` (7-day TTL) + logout. Active paid members only. Logged-out view shows **Member sign-in** above **Join**. Logged-in stub shows email/plan + Sign out (profile chrome is `0006`). Session **never** grants `/admin`. Fail closed without `DATABASE_URL` / `RESEND_*` / `MEMBER_SESSION_SECRET`.

APIs: `POST /api/members/login/start`, `POST /api/members/login/verify`, `POST /api/members/login/logout`, `GET /api/members/login/session`.

## Focus checklist

- [ ] Homepage `#membership`: login form + Join when logged out
- [ ] Without `DATABASE_URL` / `RESEND_*` / `MEMBER_SESSION_SECRET`: login start/verify fail closed (503 / clear message)
- [ ] With secrets + seeded (or real) active member: start → email OTP → verify → signed-in stub (plan + email)
- [ ] Logout clears member session; Join/login return; `/admin` still Hover-only (member cookie does not open admin)
- [ ] Non-member / newsletter-only email: not eligible (404-style clear message)
- [ ] OTP rate limits / expiry behave (15 min TTL; 3 sends/hour; 5 verify attempts) — light spot-check OK
- [ ] `npm run lint` + `npm run typecheck` clean (CI on PR)
- [ ] **Do not merge** (epic merge gate)

## Known risks / flaky areas

- Live OTP requires Preview: `DATABASE_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, **`MEMBER_SESSION_SECRET`** (new).
- Seeded emails (`founding@` / `lifetime@` / `annual@ccvaa-seed.test`) need `npm run db:seed` on Preview Neon. Seed login OTP `123456` for annual is optional/dev-only and may be superseded by a fresh start.
- Mailosaur optional for capturing login OTP — `docs/members/mailosaur-qa.md`.
- Open Preview with protection bypass **and** `x-vercel-set-bypass-cookie=true` so client `fetch` keeps the bypass cookie.
- Join paths still need Stripe secrets if testing Join alongside login.

## Preview env notes (Pass 1)

CEO/PM set in Vercel **Preview** (and `.env.local` for Dev):

| Var | Purpose |
|-----|---------|
| `DATABASE_URL` | Neon |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Login OTP send |
| `MEMBER_SESSION_SECRET` | HMAC for httpOnly member session cookie |
| Mailosaur (optional) | Capture `login` purpose OTP |

Deployment Protection bypass — `VERCEL_AUTOMATION_BYPASS_SECRET` in `.env.local`.

## Production / baseline / Pass 2 auth notes

- Admin auth = Hover mailbox login in Mail iframe — see `docs/protocols/QA_AUTH.md`
- Member session ≠ admin session
- QA reads `ADMIN_EMAIL` / `ADMIN_PASS` from `.env.local` — **do not** paste into handoffs or reports

## Report back with

`docs/reports/QA-pass1.md` — Pass 1 result for **continue epic** (do **not** merge to `main`).
