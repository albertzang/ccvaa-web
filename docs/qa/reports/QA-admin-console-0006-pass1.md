# QA report

**ID:** QA-admin-console-0006-pass1
**Backlog work ID:** admin-console-0006  
**Pass:** 1 (pre-merge)  
**Environment(s) + exact URLs:** Preview — https://ccvaa-web-git-fix-otp-smtp-error-copy-albert-zangs-projects.vercel.app  
**Branch / PR / commit:** `fix/otp-smtp-error-copy` / [PR #1](https://github.com/albertzang/ccvaa-web/pull/1) / head `18295d4` (error-copy fix `486e9f4`)  
**Date:** 2026-07-10  
**Result:** pass

## Scope tested

Handoff `docs/qa/handoffs/HANDOFF-QA-admin-console-0006-pass1.md` — environment-aware SMTP/OTP config error copy (admin-console-0006 code side).

- Preview `/admin` at desktop width: load + **Send login code**
- User-visible / API error wording when `SMTP_PASS` unset
- No secret leakage in error text
- Cooldown / “Please wait…” after a failed request
- Spot-check: admin desktop load; optional mobile gate
- Full CEO-in-the-loop login: **not required** (handoff); marked n/a

**Not tested:** Dev (`localhost`), Production, `ccvaa.ca`.

**Method note:** Cursor browser MCP tabs did not stay open; exercised with system Chrome (Playwright `channel: 'chrome'`) plus authenticated `curl` against the Preview OTP API (Vercel share bypass for deployment protection).

## Checklist results

| Area | Result | Notes |
|------|--------|-------|
| Public homepage | n/a | Out of handoff scope |
| Board / Purposes | n/a | Out of handoff scope |
| Contact | n/a | Out of handoff scope |
| Admin mobile gate | pass | 390×844: “Desktop or tablet required” |
| Admin mail | n/a | Out of handoff scope |
| Admin OTP | pass | Error copy + cooldown verified (send still fails until CEO sets `SMTP_PASS` — expected) |
| Admin scaffolds | n/a | Full login not required this pass |

### Focus checklist (handoff)

| Item | Result | Notes |
|------|--------|-------|
| Preview `/admin` desktop + Send login code | pass | Admin console loads; button present |
| Error mentions Vercel Preview (not only `.env.local`) | pass | See evidence below |
| No secrets in error text | pass | Mentions env var **name** `SMTP_PASS` only; no password values |
| Cooldown / Please wait after failed request | pass | API 429 + UI `Resend in Ns` on immediate retry |
| Optional Dev `.env.local` wording | n/a | Dev not tested this pass |

## Evidence (error copy)

**UI** (after **Send login code** on Preview `/admin`):

> SMTP_PASS is not set. Add your Hover mailbox password in the Vercel Preview environment variables, then redeploy. Ensure ADMIN_OTP_DEV_MODE is not true.

**API** `POST /api/admin/otp/request` → HTTP 500, same message.

- Does **not** mention `.env.local`
- Names **Vercel Preview** (correct for this deploy’s `VERCEL_ENV`)
- Immediate second request → HTTP 429: `Please wait before requesting another code.` with `retryAfterMs`; UI then shows **Resend in Ns** and disables the button

## Bugs found

None new.

- [admin-console-0006](../../product/backlogs/admin-console-BACKLOG.md) remains **open** for missing `SMTP_PASS` (CEO/Vercel env). **Error-copy portion** of that bug is verified fixed on this Preview; mail still will not send until env is set + redeployed.

## Suggestions (non-blocking)

- On SMTP config **500** responses, the API does not return `retryAfterMs`, so the button stays labeled **Send login code** until a second click hits the 429 path. Cooldown still works; returning `retryAfterMs` on the 500 would make the first failure show **Resend in Ns** immediately (pre-existing UX, not a Pass 1 blocker).

## Sign-off

**Pass 1:** merge  
**Pass 2:** n/a  
**Baseline:** n/a  
