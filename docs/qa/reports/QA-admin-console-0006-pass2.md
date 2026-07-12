# QA report

**ID:** QA-admin-console-0006-pass2
**Backlog work ID:** admin-console-0006  
**Pass:** 2 (post-merge)  
**Environment(s) + exact URLs:** Production — https://ccvaa-web.vercel.app/  
**Branch / PR / commit:** PR #1 merged (`1d7c42d`); includes `486e9f4` SMTP/OTP error-copy fix  
**Date:** 2026-07-10  
**Result:** pass

## Scope tested

Pass 2 smoke for OTP error-copy ship (handoff `docs/qa/handoffs/HANDOFF-QA-admin-console-0006-pass2.md`):

- Public homepage light smoke
- `/admin` desktop load + mobile gate spot-check
- **Send login code** success path (no `SMTP_PASS` / `.env.local`-only failure copy)
- Verify form after send; optional verify attempt (no CEO OTP paste this pass)

**Out of scope:** https://ccvaa.ca/. Full post-login scaffolds (CEO OTP readout optional; not required to pass this ship).

**Method note:** Cursor browser MCP tabs unavailable this session; checklist exercised with headless Chromium (Playwright) plus direct API checks against Production.

## Checklist results

| Area | Result | Notes |
|------|--------|-------|
| Public homepage | pass | 200; title OK; `#hero` + Coast to Coast wordmark visible |
| Board / Purposes | n/a | Not in Pass 2 focus |
| Contact | n/a | Not in Pass 2 focus |
| Admin mobile gate | pass | iPhone 13 viewport: “Desktop or tablet required” |
| Admin mail | n/a | Not in Pass 2 focus |
| Admin OTP | pass | Desktop: Send visible; send succeeds — UI: “A 6-digit code was sent to info@ccvaa.ca…”. API: `POST /api/admin/otp/request` → `{"ok":true,"mode":"smtp"}`. No `SMTP_PASS is not set` / no `.env.local`-only wording. Cooldown works (429 on immediate re-request). Verify form (“6-digit code” + **Verify and sign in**) present after send |
| Admin scaffolds | blocked | Full login not completed (no CEO OTP paste). Dummy verify → “Incorrect code. Please try again.” (challenge present on same instance). **admin-console-0007** (“No active code found”) **not reproduced** this pass |

## Bugs found

None new.

- [admin-console-0007](../../product/backlogs/admin-console-BACKLOG.md) — still open (CEO-reported verify/instance issue). Not reproduced in this Pass 2 session; does **not** block Pass 2 sign-off per handoff.

## Suggestions (non-blocking)

- Continue separate track for durable OTP challenge store (admin-console-0007 / `fix/otp-verify-shared-store` if in flight).

## Sign-off

**Pass 1:** n/a  
**Pass 2:** ship confirmed  
**Baseline:** n/a  
