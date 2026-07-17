# Handoff: Developer / PM → QA

**Date:** 2026-07-16  
**Pass:** `1`  
**Backlog work ID:** `members-0022`  
**Ship path that led here:** `feature-branch`  
**Epic branch:** `feat/members`  
**Merge gate:** `epic`  
**Filled by:** Developer  

**Save as:** `docs/handoffs/HANDOFF-QA-pass1.md`

**Branch name:** `feat/members`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/8  
**Commit:** `f264db1` (implementation tip on `feat/members` / PR #8 — wait for Vercel Preview deploy of this SHA before testing)  
**Preview URL:** https://ccvaa-web-git-feat-members-azang-projects.vercel.app  
**Preview protection:** both `x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie=true` from `.env.local` (`PREVIEW_PROTECTION.md`). Never paste secret.

**Out of scope:** https://ccvaa.ca/ · merge to `main` · real membership perks (`0012`) · ESP provider / Production go-live (`0009`) · Stripe Elements

## Environments to test this pass

- [ ] Dev — http://localhost:3000/ (optional)
- [ ] Preview — https://ccvaa-web-git-feat-members-azang-projects.vercel.app (required; wait for deploy of tip `f264db1`)
- [ ] Production — n/a (Pass 1)

## What changed

`members-0022` on epic `feat/members`:

1. **Contact** is inquiry-only — newsletter UI removed
2. **`#membership` portal:** unverified = Name + Email + OTP strip + branded glass gate; verified = Name auto-save, email change (re-OTP), newsletter toggle (default off), Join Checkout or “Membership perks coming soon…”
3. **Session** binds to Member ID UUID (plan may be `none`); newsletter toggle needs no OTP while verified
4. **`/?unsub=<token>#membership`:** newsletter off + verified session + toggle off (idempotent); invalid token = clear message, no fake session
5. **Hero:** Subscribe and Join both → `#membership`; cohesive coastal CTA pair + shared ocean/cream badges
6. Docs: FEATURES.md, members Product model, `docs/members/esp.md`

## Focus checklist

### Contact
- [ ] No newsletter subscribe/unsubscribe UI on `#contact`
- [ ] Email + mailing address still present

### Unverified `#membership`
- [ ] Identity strip: Name (required, international-friendly) + Email + Send code + OTP + Verify
- [ ] Desktop compact; mobile stacked/full-width (not a cramped forced row)
- [ ] Glass gate shows: “Verify your email to unlock the newsletter and membership.” and “One code. Then subscribe, join, or both — on your terms.”
- [ ] No newsletter toggle and no Join until verified

### Verified `#membership`
- [ ] Verify creates/upserts `members`; session uses Member ID; email unique
- [ ] Name auto-saves (debounce) with feedback
- [ ] Email change requires new OTP; Member ID unchanged
- [ ] Newsletter toggle defaults **off** after first verify
- [ ] Toggle on/off with no additional OTP; does not change paid plan
- [ ] Non-member → Stripe Checkout plans; paid member → “Membership perks coming soon…”

### Unsubscribe
- [ ] Valid `/?unsub=<token>#membership` → newsletter off, verified UI, toggle off (idempotent reload)
- [ ] Invalid/expired token → clear `#membership` message, not verified

### Hero
- [ ] Subscribe and Join both scroll to `#membership`
- [ ] Live counts + accessible labels retain meanings
- [ ] CTA pair cohesive (shared sizing/typography/radius/focus; coral vs cream glass; shared badge treatment); balanced on narrow screens; readable contrast

## Known risks / flaky areas

- Preview deploy may still be building when handoff is written — confirm tip `f264db1` is live
- Resend OTP delivery / Mailosaur timing on Preview
- Stripe Checkout test mode only
- Cookie + unsub in same SSR request: success path also passes profile into the panel

## Preview env notes (Pass 1)

Member verify needs `DATABASE_URL`, `RESEND_*`, `MEMBER_SESSION_SECRET` on Preview. Stripe join needs `STRIPE_*` + founding/fee env. Bypass Deployment Protection per protocol above.

## Report back with

`docs/templates/qa-report.md` → save as `docs/reports/QA-pass1.md`  

- Pass 1 (Merge gate `epic`): **continue epic** / **hold** / **retest**
