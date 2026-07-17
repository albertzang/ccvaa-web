# Handoff: Developer / PM → QA

**Date:** 2026-07-16  
**Pass:** `1`  
**Backlog work ID:** `members-0022`  
**Ship path that led here:** `feature-branch`  
**Epic branch:** `feat/members`  
**Merge gate:** `epic`  
**Filled by:** Developer  
**Iteration:** `2` (Pass 1 hold retest)

**Save as:** `docs/handoffs/HANDOFF-QA-pass1.md`

**Branch name:** `feat/members`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/8  
**Commit:** `0613e63` (Iteration 2 tip — unsub landing cookie fix)  
**Preview URL:** https://ccvaa-e0dsb9hrm-azang-projects.vercel.app  
**Branch alias (may lag):** https://ccvaa-web-git-feat-members-azang-projects.vercel.app  
**Preview protection:** both `x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie=true` from `.env.local` (`PREVIEW_PROTECTION.md`). Never paste secret.

**Out of scope:** https://ccvaa.ca/ · merge to `main` · real membership perks (`0012`) · ESP provider / Production go-live (`0009`) · Stripe Elements

## Environments to test this pass

- [ ] Dev — http://localhost:3000/ (optional)
- [ ] Preview — https://ccvaa-e0dsb9hrm-azang-projects.vercel.app (required; tip `0613e63` / `dpl_97rGQy8jCVKzoFyucA1wGDyuFg4Q`)
- [ ] Production — n/a (Pass 1)

## What changed (Iteration 2)

Fix for Pass 1 hold: valid `/?unsub=<token>` no longer sets cookies from the RSC page.

1. `GET /?unsub=<token>` → redirects to `GET /api/members/newsletter/unsub/landing?token=…`
2. Landing Route Handler redeems token, sets httpOnly member session cookie, redirects to `/?unsubscribed=1|already|invalid#membership`
3. Home page only reads result status + session (no cookie writes in RSC)

Unchanged from Iteration 1: Contact inquiry-only, verified portal, Hero CTAs, invalid-token messaging.

## Focus checklist

### Unsubscribe (primary retest)
- [ ] Valid `/?unsub=seed-unsub-newsletter-only#membership` → **200** (not 500); newsletter off; verified UI; toggle **off**; success/already message; idempotent reload
- [ ] Valid `/?unsub=seed-unsub-annual-member#membership` → same + paid member shows **“Membership perks coming soon…”**
- [ ] Invalid/expired token → clear “invalid or has expired” message; **no** fake verified session
- [ ] Confirm landing hops through `/api/members/newsletter/unsub/landing` (Set-Cookie on redirect response)

### Smoke (already passed Iteration 1 — quick check OK)
- [ ] Contact still inquiry-only (no newsletter UI)
- [ ] Unverified gate + verify OTP still works
- [ ] Newsletter toggle on/off without OTP while verified
- [ ] Hero Subscribe/Join → `#membership`

## Known risks / flaky areas

- Prefer tip deploy URL above if branch alias still shows pre-fix UI
- Resend OTP / Mailosaur timing on Preview
- Stripe Checkout test mode only

## Preview env notes (Pass 1)

Member verify needs `DATABASE_URL`, `RESEND_*`, `MEMBER_SESSION_SECRET` on Preview. Stripe join needs `STRIPE_*` + founding/fee env. Bypass Deployment Protection per protocol above.

## Report back with

`docs/templates/qa-report.md` → save as `docs/reports/QA-pass1.md`  

- Pass 1 (Merge gate `epic`): **continue epic** / **hold** / **retest**
