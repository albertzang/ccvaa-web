# Handoff: Developer / PM → QA

**Date:** 2026-07-16  
**Pass:** `1`  
**Backlog work ID:** `members-0021`  
**Ship path that led here:** `feature-branch`  
**Epic branch:** `feat/members`  
**Merge gate:** `epic`  
**Filled by:** Developer  

**Save as:** `docs/handoffs/HANDOFF-QA-pass1.md`

**Branch name:** `feat/members`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/8  
**Commit:** `1d3ca6b` (implementation). Branch tip on `feat/members` / PR #8 — wait for latest Preview deploy before testing.  
**Preview URL:** https://ccvaa-web-git-feat-members-azang-projects.vercel.app  
**Preview protection:** both `x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie=true` from `.env.local` (`PREVIEW_PROTECTION.md`). Never paste secret.

**Out of scope:** https://ccvaa.ca/ · merge to `main` · moving newsletter into Membership · ESP provider (`0009`) · changing double opt-in rules

## Environments to test this pass

- [ ] Dev — http://localhost:3000/ (optional)
- [ ] Preview — https://ccvaa-web-git-feat-members-azang-projects.vercel.app (required; wait for deploy of tip)
- [ ] Production — n/a (Pass 1)

## What changed

`members-0021` on epic `feat/members`:

1. **Contact newsletter tabs:** **Subscribe** | **Unsubscribe** (Membership-like pill tablist); only active panel visible
2. **Unsubscribe:** email + Unsubscribe only — no “Check preference” / lookup step
3. **Backend outcomes:** distinct user-safe messages for subscribed→off, already off, and unknown email; membership never cancelled
4. **One-click `/?unsub=<token>#contact`:** server redeem (idempotent) → Contact newsletter, Unsubscribe tab active, email prefilled, result message shown; invalid/expired token shows clear message on Unsubscribe tab
5. **Subscribe:** double opt-in + required name preserved (confirm stays under Subscribe tab)
6. Docs: FEATURES.md + `docs/members/esp.md`

## Focus checklist

### Tabs / Subscribe
- [ ] Tabs: Subscribe left; Unsubscribe right; Membership-like chrome; one panel at a time
- [ ] Subscribe still requires name + email; double opt-in confirm code flow works
- [ ] Desktop + mobile

### Manual Unsubscribe
- [ ] Email + Unsubscribe only (no preference lookup / “Check preference”)
- [ ] Subscribed address → clear unsubscribed success; membership unchanged
- [ ] Already-off address → clear already-unsubscribed message
- [ ] Unknown email → clear not-found / unknown message
- [ ] Paid membership (if tested) unchanged after unsub

### One-click token landing
- [ ] Valid `/?unsub=<token>#contact`: Contact focused, Unsubscribe tab active, email filled, success (or already) message shown
- [ ] Reload same URL: idempotent (already-unsubscribed message OK)
- [ ] Invalid/expired token: clear invalid message on Unsubscribe tab

### Sign-off
- [ ] Lint/typecheck if feasible
- [ ] Sign-off **continue epic** / **hold** / **retest** — **do not merge**

## Known risks / flaky areas

- Preview deploy must include the latest tip before testing
- Token landing needs a real `unsub_tokens` row (seed or after confirmed subscribe)
- Hash `#contact` scroll depends on browser; confirm Contact newsletter is visible
- Manual unknown vs already-off messages are intentional and should not be conflated in the report

## Preview env notes (Pass 1)

Admin mail auth not required for this ticket. Newsletter subscribe needs `DATABASE_URL` + `RESEND_*` on Preview for live double opt-in; token unsub needs DB. Bypass both protection headers from `.env.local`.

## Report back with

`docs/templates/qa-report.md` → save as `docs/reports/QA-pass1.md`  
Bugs → list in QA report for PM triage.  

Pass 1 (Merge gate `epic`): **continue epic** / **hold** / **retest** — **do not merge**
