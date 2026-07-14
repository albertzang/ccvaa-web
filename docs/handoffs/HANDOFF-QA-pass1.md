# Handoff: Developer / PM → QA

**Date:** 2026-07-14  
**Pass:** `1`  
**Backlog work ID:** `members-0002`  
**Ship path that led here:** `feature-branch`  
**Epic branch:** `feat/members`  
**Merge gate:** `epic`  
**Filled by:** Developer  

**Save as:** `docs/handoffs/HANDOFF-QA-pass1.md`

**Branch name:** `feat/members`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/8  
**Commit:** `7a40435`  
**Preview URL:** https://ccvaa-web-git-feat-members-azang-projects.vercel.app  
**Preview protection:** QA reads `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local` (do **not** paste the secret here). See `docs/protocols/PREVIEW_PROTECTION.md`.  
**Production URL:** https://ccvaa-web.vercel.app/ (Pass **2** only — not for this pass)

**Post-merge cleanup (Pass 2 only):** n/a until **merge milestone**

**Out of scope for QA:** https://ccvaa.ca/ — CEO manual only.

## What changed

Resend transactional send path + shared confirm/OTP helpers (DB challenges, 15-minute expiry, rate limits). Mailosaur documented for Preview QA. No public forms or admin UI.

## Focus checklist

- [ ] `GET /api/members/health` on Preview reports `email.resend` and `email.mailosaur` as `"configured"` or `"missing"` (no secrets exposed)
- [ ] Without `RESEND_API_KEY` / `RESEND_FROM_EMAIL`: `npm run members:send-otp-test` fails closed with clear error (local only; needs `DATABASE_URL` too)
- [ ] With `DATABASE_URL` + Resend test keys + Mailosaur in `.env.local`: send OTP to `*@{MAILOSAUR_SERVER_ID}.mailosaur.net`, read code in Mailosaur, verify with `--verify` flag (see `docs/members/mailosaur-qa.md`)
- [ ] Rate limits: 3 challenges/email/purpose/hour; 5 verify attempts/challenge — documented in `docs/members/mailosaur-qa.md`
- [ ] `npm run lint` + `npm run typecheck` clean (CI on PR)
- [ ] No public UI, Stripe, or admin roster changes
- [ ] Existing `/admin` mail-session auth still works on Preview (optional smoke)

## Known risks / flaky areas

- Preview health still **503** on DB until CEO sets `DATABASE_URL` in Vercel Preview env — same as members-0001; `email.*` status still returned in JSON body.
- Live Resend send on Preview requires CEO to set `RESEND_API_KEY` + `RESEND_FROM_EMAIL` in Vercel Preview env; Mailosaur vars optional (QA can use local Dev for send script).
- OTP send test is a **script** (`npm run members:send-otp-test`), not a public route — intentional for this ticket.

## Preview env notes (Pass 1)

- `DATABASE_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL` — CEO sets in Vercel Preview when ready for live send tests on Preview.
- Mailosaur: optional QA tooling — see `docs/members/mailosaur-qa.md`.
- Admin mail auth needs Deployment Protection bypass if testing `/admin`.

## Production / baseline / Pass 2 auth notes

- Admin auth = Hover mailbox login in Mail iframe — see `docs/protocols/QA_AUTH.md`
- QA reads `ADMIN_EMAIL` / `ADMIN_PASS` from `.env.local` — **do not** paste into handoffs or reports

## Report back with

`docs/reports/QA-pass1.md` — Pass 1 result for **continue epic** (do **not** merge to `main`).
