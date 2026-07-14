# Handoff: Developer → QA

**Date:** 2026-07-14  
**Pass:** `1`  
**Backlog work ID:** `members-0006`  
**Ship path that led here:** `feature-branch`  
**Epic branch:** `feat/members`  
**Merge gate:** `epic`  
**Filled by:** Developer  

**Save as:** `docs/handoffs/HANDOFF-QA-pass1.md`

**Branch name:** `feat/members`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/8  
**Commit:** tip of `feat/members` after members-0006 push  
**Preview URL:** https://ccvaa-web-git-feat-members-azang-projects.vercel.app  
**Preview protection:** QA reads `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local`. Browser Pass 1: both bypass query **and** `x-vercel-set-bypass-cookie=true`. See `docs/protocols/PREVIEW_PROTECTION.md`.  
**Production URL:** https://ccvaa-web.vercel.app/ (Pass **2** only)

**Post-merge cleanup (Pass 2 only):** n/a until **merge milestone**

**Out of scope for QA:** https://ccvaa.ca/

## What changed

Logged-in `#membership` profile replaces the signed-in stub: name edit; email change with OTP re-verify on the new address; Annual read-only anniversary / next renewal; light member perks placeholder. Join + login remain when logged out (`members-0004` / `0005`). No newsletter UI here.

## Focus checklist

- [ ] Signed-in member sees profile (not Join/login forms) in `#membership`
- [ ] Name save updates display name; session persists after refresh
- [ ] Email change: send code to new address → verify → email updates (if DB + Resend available)
- [ ] Annual seed member shows anniversary + next renewal; Founding/Lifetime omit renewal fields
- [ ] Perks placeholder visible; no newsletter controls in `#membership`
- [ ] Fail-closed 503/401 when `DATABASE_URL` / session / Resend missing (document blocked live paths)
- [ ] Logout still works; member cookie does not open `/admin`
- [ ] Lint + typecheck clean on branch
- [ ] Sign-off **continue epic** — **do not merge**

## Known risks

- Live profile + email OTP need Neon migrate+seed on Preview plus `DATABASE_URL`, `RESEND_*`, `MEMBER_SESSION_SECRET`
- OTP capture needs Resend logs / Mailosaur / real inbox; seed `@ccvaa-seed.test` may be uncapturable without Mailosaur
- Stripe Join live may still be missing (out of scope for this ticket)

## Report back with

Overwrite `docs/reports/QA-pass1.md`. Commit + push on `feat/members`.
