# Handoff: Developer / PM → QA — Pass 2 (OTP error-copy)

**Date:** 2026-07-10  
**Pass:** `2`  
**Backlog work ID:** `admin-console-0006`  
**Ship path that led here:** `feature-branch` (PR #1 merged)  
**Filled by:** Product Manager  

**Branch name:** n/a (merged; remote branch deleted)  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/1 (MERGED)  
**Commit:** on `main` (merge includes `486e9f4` error-copy fix)  
**Preview URL:** n/a  
**Production URL:** https://ccvaa-web.vercel.app/  

**Post-merge cleanup:**  
- [x] Feature branch deleted on origin (`fix/otp-smtp-error-copy`)  
- [ ] Local branch deleted (Developer/PM confirm if still present)

**Out of scope for QA:** https://ccvaa.ca/ — CEO manual only.

## Environments to test this pass

- [x] Production — https://ccvaa-web.vercel.app/ (**required**)

## What changed

Environment-aware SMTP/OTP config error copy shipped via PR #1. CEO has since set Production SMTP env; OTP **send** works.

## Focus checklist

- [ ] `/admin` loads on desktop; mobile gate still works (spot-check)
- [ ] **Send login code** succeeds (no `SMTP_PASS is not set` / no `.env.local`-only wording)
- [ ] Login UI still presents verify form after send
- [ ] Note: full verify may fail with “No active code found” — that is **admin-console-0007** (separate track). Do **not** fail Pass 2 solely for that if error-copy + send path look good; file/confirm under admin-console-0007 if reproduced
- [ ] Public homepage smoke (loads) optional light check

## Known risks

- OTP verify across serverless instances (admin-console-0007)
- Do not commit OTP codes; CEO-in-the-loop if you attempt full login (`docs/protocols/QA_AUTH.md`)

## Report back with

`docs/qa/reports/QA-admin-console-0006-pass2.md`  
Pass 2 sign-off: **ship confirmed** / **hotfix**
