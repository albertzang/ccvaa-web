# Handoff: Developer / PM → QA

**Date:** 2026-07-15  
**Pass:** `1`  
**Backlog work ID:** `members-0004`  
**Ship path that led here:** `feature-branch`  
**Epic branch:** `feat/members`  
**Merge gate:** `epic`  
**Filled by:** Product Manager  

**Save as:** `docs/handoffs/HANDOFF-QA-pass1.md`

**Branch name:** `feat/members`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/8  
**Commit:** tip of `feat/members`  
**Preview URL:** https://ccvaa-web-git-feat-members-azang-projects.vercel.app  
**Preview protection:** both `x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie=true` from `.env.local` (`PREVIEW_PROTECTION.md`). Never paste secret.

**Out of scope:** https://ccvaa.ca/ · Production live keys · merge to `main`

## CEO-confirmed Preview env

Health: `db.ok`, Resend/Mailosaur/session configured, **`stripe: "configured"`**. Neon Preview branch migrated/seeded. Stripe test Products + webhook + Preview env set.

Use Mailosaur (`MAILOSAUR_*`) for Join email-verify OTP. Stripe **Test mode** card: `4242 4242 4242 4242`, any future expiry, any CVC.

## Focus — `members-0004` live Join

- [ ] Health: `stripe: "configured"`
- [ ] `#membership` Join UI: plans (Founding + Annual pre-cap; Lifetime fee > Founding enforced in env)
- [ ] Join flow: name/email/newsletter opt-in → Mailosaur OTP verify → Stripe Checkout → return `/?joined=1#membership` (or documented success)
- [ ] Webhook activates membership (login or profile/admin roster evidence of paid plan)
- [ ] Fail paths: invalid OTP / clear errors; do not thrash Founding cap unless easy spot-check
- [ ] Lint/typecheck if feasible
- [ ] Sign-off **continue epic** / **hold** / **retest** — **do not merge**

## Report

`docs/templates/qa-report.md` → overwrite `docs/reports/QA-pass1.md`. Commit + push on `feat/members`.
