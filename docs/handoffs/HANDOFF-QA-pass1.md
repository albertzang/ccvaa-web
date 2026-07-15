# Handoff: Developer / PM → QA

**Date:** 2026-07-14  
**Pass:** `1`  
**Backlog work ID:** `members-0003` (then `members-0005`)  
**Ship path that led here:** `feature-branch`  
**Epic branch:** `feat/members`  
**Merge gate:** `epic`  
**Filled by:** Product Manager  

**Save as:** `docs/handoffs/HANDOFF-QA-pass1.md`

**Branch name:** `feat/members`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/8  
**Commit:** tip of `feat/members`  
**Preview URL:** https://ccvaa-web-git-feat-members-azang-projects.vercel.app  
**Preview protection:** Read `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local`. Browser Pass 1 **must** open with both:
`?x-vercel-protection-bypass=<secret>&x-vercel-set-bypass-cookie=true`
See `docs/protocols/PREVIEW_PROTECTION.md` (**agent-os-0014**). Never paste the secret.

**Production URL:** https://ccvaa-web.vercel.app/ (Pass **2** only — not this pass)

**Out of scope for QA:** https://ccvaa.ca/

## Environments

- [ ] Preview — required (URL above)
- [ ] Dev / Production — n/a this pass

## Why retest

Prior Pass 1 **hold**: Preview Neon schema missing (`MEMBERS_DB_UNAVAILABLE`) while health `db.ok`. CEO has now **migrate + seed** against the Preview branch `DATABASE_URL`. Expect schema present; live newsletter + login OTP unblocked (Stripe still missing — Join Checkout out of scope).

## Part A — `members-0003`

- [ ] Health: `db.ok`, `email.resend: "configured"`; subscribe/preference **not** schema 503
- [ ] Live subscribe → OTP path (capture via Resend dashboard / Mailosaur / evidence of accept)
- [ ] Preference lookup for seed or known email
- [ ] Hero Subscribe → `#contact`; invalid unsub landing
- [ ] Sign-off: **continue epic** / **hold** / **retest** — do not merge

Overwrite `docs/reports/QA-pass1.md`, commit+push, then Part B.

## Part B — `members-0005`

- [ ] `#membership` login; seed active member OTP → session stub; logout; `grantsAdmin: false`
- [ ] Non-member / newsletter-only clear rejection
- [ ] Sign-off: **continue epic** / **hold** / **retest** — do not merge

## Report

Template `docs/templates/qa-report.md` → `docs/reports/QA-pass1.md`. Epic sign-off only.
