# Handoff: Developer / PM → QA

**Date:** 2026-07-10  
**Pass:** `1`  
**Backlog work ID:** `admin-console-0006`  
**Ship path that led here:** `feature-branch`  
**Filled by:** Developer  

**Branch name:** `fix/otp-smtp-error-copy`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/1  
**Commit:** `18295d4` (handoffs) / `486e9f4` (error-copy fix)  
**Preview URL:** https://ccvaa-web-git-fix-otp-smtp-error-copy-albert-zangs-projects.vercel.app  
**Production URL:** https://ccvaa-web.vercel.app/ (Pass **2** and **baseline**)  

**Post-merge cleanup (Pass 2 only):**  
- [ ] Feature branch deleted **locally**  
- [ ] Feature branch deleted **on origin** (or n/a for `direct-to-main`)  
Cleanup happens **right after merge**, before Pass 2 testing — see `docs/protocols/GIT_DEPLOY.md`.  
**Baseline:** cleanup n/a (no feature branch for this pass).

**Out of scope for QA:** https://ccvaa.ca/ — CEO manual only (DNS/cache). Do not test or block on it.

## How QA gets the Preview URL (Pass 1 only)

1. Developer creates the branch and opens the PR.
2. Vercel posts the Preview deployment URL on the PR.
3. Developer pastes that URL into **Preview URL** above.
4. QA tests **only** that pasted URL. If blank on Pass 1 → block and ask Developer/PM.

## Environments to test this pass

- [ ] Dev — http://localhost:3000/ (optional on Pass 1 only)
- [x] Preview — https://ccvaa-web-git-fix-otp-smtp-error-copy-albert-zangs-projects.vercel.app (required on Pass 1)
- [ ] Production — https://ccvaa-web.vercel.app/ (required on Pass 2 and **baseline**)

## What changed

Environment-aware SMTP/OTP config error copy (admin-console-0006 code side):

- `src/lib/admin/email.ts` — missing `SMTP_PASS` errors mention Vercel Production/Preview env vars when `VERCEL` is set; local still mentions `.env.local`
- `src/components/admin/LoginSection.tsx` — “dev mode” success status uses localhost vs deployed guidance

**Out of scope (unchanged):** Setting `SMTP_PASS` in Vercel (CEO). Codes still will not send until SMTP is configured + redeployed.

## Focus checklist

- [ ] On Preview: open `/admin` (desktop width), click **Send login code**
- [ ] If SMTP still unset: error text mentions **Vercel Preview** env vars (or Production wording if mis-detected) — must **not** say “add … to `.env.local`” only
- [ ] Error text does not leak secrets / passwords
- [ ] Optional Dev: with missing `SMTP_PASS`, error may still mention `.env.local`
- [ ] Cooldown / “Please wait…” behavior still works after a failed request

## Known risks / flaky areas

- Without `SMTP_PASS` on Preview, OTP email still fails — this Pass 1 only validates **error copy**, not successful delivery
- Preview env may differ from Production; note which Vercel env the message names

## Preview env notes (Pass 1)

Admin OTP/mail need Vercel **Preview** env vars if testing auth on Preview. This fix does not add them.

## Production / baseline / Pass 2 auth notes

- OTP emailed to `info@ccvaa.ca` (or `ADMIN_OTP_EMAIL`). **Do not commit codes.**
- **OTP readout (current standard):** CEO-in-the-loop — see `docs/protocols/QA_AUTH.md`. QA triggers Send; CEO pastes the code into the QA chat for that session only.
- If CEO unavailable: test request UI/cooldown/errors; mark full login/scaffolds **blocked** (not automatic product fail) unless handoff says otherwise.
- Never give QA standing mailbox passwords.

## Report back with

`docs/templates/qa-report.md` (Bugs found → PM backlog triage)  
- Pass 1: **merge** / **hold** / **retest**  
- Pass 2: **ship confirmed** / **hotfix**  
- Baseline: **baseline confirmed** / **issues found**
