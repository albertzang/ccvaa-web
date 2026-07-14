# Handoff: Developer / PM → QA

**Date:** 2026-07-14  
**Pass:** `1`  
**Backlog work ID:** `members-0005`  
**Ship path that led here:** `feature-branch`  
**Epic branch:** `feat/members`  
**Merge gate:** `epic`  
**Filled by:** Product Manager  

**Save as:** `docs/handoffs/HANDOFF-QA-pass1.md`

**Branch name:** `feat/members`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/8  
**Commit:** tip of `feat/members`  
**Preview URL:** https://ccvaa-web-git-feat-members-azang-projects.vercel.app  
**Preview protection:** QA reads `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local`. Browser Pass 1: both bypass query **and** `x-vercel-set-bypass-cookie=true`. See `docs/protocols/PREVIEW_PROTECTION.md`.  
**Production URL:** https://ccvaa-web.vercel.app/ (Pass **2** only)

**Post-merge cleanup (Pass 2 only):** n/a until **merge milestone**

**Out of scope for QA:** https://ccvaa.ca/

## What changed

Member email OTP login on `#membership`: start → 6-digit OTP (Resend) → httpOnly session; logout. Does not grant `/admin`. Join UI may coexist when logged out (`members-0004`).

## Focus checklist

- [ ] `#membership` shows Member sign-in (and Join when logged out)
- [ ] Seeded/active member OTP login path if DB migrated+seeded; else document blocked and verify UI + fail-closed API behavior
- [ ] Logout clears session; member cookie does not open `/admin`
- [ ] Newsletter-only / non-member: clear not-eligible (if testable)
- [ ] Health / lint / typecheck as feasible
- [ ] Sign-off **continue epic** / hold / retest — **do not merge**

## Known risks

- OTP capture needs Resend logs / Mailosaur / real inbox; seed `@ccvaa-seed.test` may be uncapturable without Mailosaur
- Neon migrate + seed on Preview still may be incomplete — treat live OTP as blocked if so
- Stripe Join live may still be missing

## Report back with

Overwrite `docs/reports/QA-pass1.md`. Commit + push on `feat/members`.
