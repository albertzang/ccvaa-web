# Handoff: Developer / PM → QA

**Date:** 2026-07-14  
**Pass:** `1`  
**Backlog work ID:** `members-0003`  
**Ship path that led here:** `feature-branch`  
**Epic branch:** `feat/members`  
**Merge gate:** `epic`  
**Filled by:** Developer  

**Save as:** `docs/handoffs/HANDOFF-QA-pass1.md`

**Branch name:** `feat/members`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/8  
**Commit:** _(tip after push)_  
**Preview URL:** https://ccvaa-web-git-feat-members-azang-projects.vercel.app  
**Preview protection:** QA reads `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local` (do **not** paste the secret here). See `docs/protocols/PREVIEW_PROTECTION.md`.  
**Production URL:** https://ccvaa-web.vercel.app/ (Pass **2** only — not for this pass)

**Post-merge cleanup (Pass 2 only):** n/a until **merge milestone**

**Out of scope for QA:** https://ccvaa.ca/ — CEO manual only.

## What changed

Contact `#contact` newsletter axis: subscribe (double opt-in via Resend OTP), manage preference (newsletter-only + paid members), tokenized unsubscribe landing `/?unsub=<token>#contact`. Hero **Subscribe** anchors to `#contact`. ESP sync stub + footer URL docs (`docs/members/esp.md`). Unsub never cancels membership.

## Focus checklist

- [ ] Hero **Subscribe** button scrolls to `#contact`
- [ ] Contact newsletter UI: subscribe flow (email → pending → 6-digit confirm → on)
- [ ] Manage preference: lookup by email; unsubscribe when on; subscribe link when off; pending shows confirm form
- [ ] Copy is CASL-friendly; newsletter clearly separate from paid membership
- [ ] Token unsub: `/?unsub=seed-unsub-newsletter-only#contact` (after `npm run db:seed`) → Contact message; membership unchanged; idempotent on reload
- [ ] Invalid token `/?unsub=bad-token#contact` → invalid message; no crash
- [ ] Without `DATABASE_URL` / `RESEND_*` on Preview: subscribe/confirm fail closed with clear API error (503)
- [ ] With `DATABASE_URL` + Resend + Mailosaur: full double opt-in on Dev or Preview (see `docs/members/mailosaur-qa.md`, purpose `newsletter_confirm`)
- [ ] `GET /api/members/health` still works; no admin regressions (optional smoke)
- [ ] `npm run lint` + `npm run typecheck` clean (CI on PR)
- [ ] **Do not merge** (epic merge gate)

## Known risks / flaky areas

- Preview live subscribe requires CEO to set `DATABASE_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL` in Vercel Preview env (same as members-0001/0002).
- ESP sync is stub only — `ESP_API_KEY` / `ESP_LIST_ID` optional; no real provider calls until `members-0009`.
- Seed unsub tokens are dev-only (`npm run db:seed`); Production tokens created on confirm.

## Preview env notes (Pass 1)

- `DATABASE_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL` — CEO sets in Vercel Preview for live newsletter QA.
- Mailosaur optional for OTP capture — `docs/members/mailosaur-qa.md`.
- Deployment Protection bypass for Preview — `VERCEL_AUTOMATION_BYPASS_SECRET` in `.env.local`.

## Production / baseline / Pass 2 auth notes

- Admin auth = Hover mailbox login in Mail iframe — see `docs/protocols/QA_AUTH.md`
- QA reads `ADMIN_EMAIL` / `ADMIN_PASS` from `.env.local` — **do not** paste into handoffs or reports

## Report back with

`docs/reports/QA-pass1.md` — Pass 1 result for **continue epic** (do **not** merge to `main`).
