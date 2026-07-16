# Handoff: Developer / PM → QA

**Date:** 2026-07-15  
**Pass:** `1`  
**Backlog work ID:** `members-0003` (then `members-0005`; then note only)  
**Ship path that led here:** `feature-branch`  
**Epic branch:** `feat/members`  
**Merge gate:** `epic`  
**Filled by:** Product Manager  

**Save as:** `docs/handoffs/HANDOFF-QA-pass1.md`

**Branch name:** `feat/members`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/8  
**Commit:** tip of `feat/members` (expect ≥ `a2b3afe`)  
**Preview URL:** https://ccvaa-web-git-feat-members-azang-projects.vercel.app  
**Preview protection:** `.env.local` `VERCEL_AUTOMATION_BYPASS_SECRET`. Browser **must** use both:
`?x-vercel-protection-bypass=<secret>&x-vercel-set-bypass-cookie=true`  
(`docs/protocols/PREVIEW_PROTECTION.md` / agent-os-0014). Never paste the secret.

**Production URL:** n/a this pass  
**Out of scope:** https://ccvaa.ca/ · **live Stripe Join Checkout** (CEO Stripe setup not done — pause epic there)

## CEO-confirmed Preview env

Health should show roughly: `db.ok`, `email.resend: "configured"`, `email.mailosaur: "configured"`, `session: "configured"`, **`stripe: "missing"`** (expected). Preview Neon branch migrated + seeded.

Use Mailosaur API (`MAILOSAUR_*` in `.env.local`) to read OTPs — do not ask CEO to paste codes.

## Part A — `members-0003` live

- [ ] Health sanity (resend + mailosaur configured; stripe missing OK)
- [ ] Subscribe with Mailosaur address → OTP via Mailosaur API → confirm
- [ ] Preference lookup (seed or confirmed email)
- [ ] Hero Subscribe → `#contact`; invalid unsub landing
- [ ] Sign-off **continue epic** / hold / retest — do not merge

Overwrite `docs/reports/QA-pass1.md`, commit+push, then Part B.

## Part B — `members-0005` live

- [ ] Seeded active member login via OTP (Mailosaur or seed path) → session stub → logout
- [ ] `grantsAdmin: false`; non-member rejected clearly
- [ ] Sign-off **continue epic** / hold / retest — do not merge

## Explicitly out of scope this run

- Live Join Checkout / Stripe webhook / founding cap (`members-0004` live path)
- Do not ask CEO for Stripe secrets
- After Part B: stop and report — PM will decide next non-Stripe tickets (`0006` E2E / `0008` if needed) or pause for Stripe

## Report

`docs/templates/qa-report.md` → `docs/reports/QA-pass1.md`. Epic sign-off only.
