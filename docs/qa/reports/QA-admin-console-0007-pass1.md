# QA report

**ID:** QA-admin-console-0007-pass1
**Backlog work ID:** admin-console-0007  
**Pass:** 1 (pre-merge) — retest (same file overwritten; prior attempt in git history)  
**Environment(s) + exact URLs:** Preview — https://ccvaa-web-git-fix-otp-verify-shared-store-azang-projects.vercel.app (protection bypass used; bypass query/header and OTP codes omitted from this report)  
**Branch / PR / commit:** `fix/otp-verify-shared-store` / [PR #2](https://github.com/albertzang/ccvaa-web/pull/2) / `f0dd5d8`  
**Date:** 2026-07-10  
**Result:** pass

## Scope tested

Pass 1 for admin-console-0007 (OTP Redis / shared challenge store). Earlier attempt the same day signed **retest** (OTP mismatch / full login not proven); this report is the successful retest after CEO confirmed Preview login works manually:

- Preview protection bypass via `.env.local` `VERCEL_AUTOMATION_BYPASS_SECRET` — works (no Vercel login wall)
- Homepage + `/admin` load (200)
- Single coordinated **Send login code** → CEO-in-the-loop OTP → **Verify and sign in** once
- Session cookie / `/api/admin/session` authenticated
- Post-login scaffolds (Members / Financial / Events) + Log out
- Wrong-code / lockout path **skipped** this pass to preserve OTP send quota (5/hour)

**Out of scope:** https://ccvaa.ca/

**Method:** curl with `x-vercel-protection-bypass` header against Preview APIs (same client IP for request + verify).

## Checklist results

| Area | Result | Notes |
|------|--------|-------|
| Public homepage | pass | 200; no Vercel wall with bypass |
| Board / Purposes | n/a | Not in Pass 1 focus |
| Contact | n/a | Not in Pass 1 focus |
| Admin mobile gate | n/a | API-focused desktop path |
| Admin mail | n/a | Not in Pass 1 focus |
| Admin OTP | pass | One Send (`mode: smtp`, 200). One verify → `ok: true` (200). Challenge found (no `No active code found`) → shared Redis/KV store behaves as intended on Preview |
| Admin scaffolds | pass | After verify: `/api/admin/session` → `authenticated: true`. UI unlocks Members / Financial dashboard / Events & posts scaffolds + Log out. Logout → session `authenticated: false` |

## Bugs found

None new.

- [admin-console-0007](../../product/backlogs/admin-console-BACKLOG.md) — original Production `No active code found` **not reproduced** on Preview; success-path login **verified** this pass.

## Suggestions (non-blocking)

- Pass 2 on Production after merge should re-confirm one coordinated Send → verify (same Redis env on Production).
- Wrong-code / lockout messaging was covered in the earlier Pass 1 attempt (see git history for that revision); optional light recheck on Pass 2 if time allows.

## Sign-off

**Pass 1:** merge  
**Pass 2:** n/a (pending merge)  
**Baseline:** n/a  
