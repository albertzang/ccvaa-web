# Handoff: PM → QA — Baseline audit (pre-multi-agent backlog)

**Date:** 2026-07-10  
**Pass:** `baseline`  
**Ship path that led here:** `n/a` (baseline)  
**Filled by:** Product Manager  

**Branch name:** n/a  
**PR link:** n/a  
**Commit:** `main` (current Production deploy)  
**Preview URL:** n/a  
**Production URL:** https://ccvaa-web.vercel.app/  

**Post-merge cleanup:** n/a  

**Out of scope for QA:** https://ccvaa.ca/ — CEO manual only. Do not test or block on it.

## Environments to test this pass

- [ ] Dev — not required
- [ ] Preview — n/a
- [x] Production — https://ccvaa-web.vercel.app/ (**required**)

## What changed

Baseline audit of features already on `main` before the multi-agent QA protocol existed. No new PR. Scope = full living inventory in `docs/product/FEATURES.md`.

## Focus checklist

### Public (`/`)
- [ ] Homepage loads; hero image + on-dark wordmark; no hero CTAs; text non-selectable
- [ ] Header: About / Contact anchors; scroll past hero → on-light wordmark / style switch
- [ ] Our Board: collapse/expand; group photo placeholder; members Zhong Liu / Yaqi Jing / Albert Zang; member expand → portrait + bio placeholders
- [ ] Our Purposes: titles visible; descriptions toggle together
- [ ] Contact: email + mailing address
- [ ] Footer: org name, tagline, copyright (no duplicate contact)
- [ ] Favicon present

### Admin (`/admin`)
- [ ] Narrow/phone viewport: “Desktop or tablet required” (or equivalent)
- [ ] Desktop viewport: admin console loads; cream header language
- [ ] Mail section: expands; iframe shows Hover webmail UI or a clear error (note which)
- [ ] OTP: request UI works (success or clear error); cooldown messaging if re-requested; **do not commit OTP codes**
- [ ] If login completable (CEO mailbox): scaffolds Members / Financial / Events + Log out; log out returns to logged-out chrome
- [ ] If OTP email inaccessible: mark full login/scaffolds as **blocked** (not automatic product fail); still report request-UI result

## Known risks / flaky areas

- Hover mail reverse-proxy / iframe / cookie quirks
- Admin OTP depends on Production Vercel SMTP env
- In-memory OTP rate limits are per serverless instance

## Production / baseline auth notes

OTP → `info@ccvaa.ca`. Do not commit codes.

## Report back with

Write `docs/qa/reports/QA-20260710-01.md` (or next free id) from `docs/templates/qa-report.md`.  
File bugs under `docs/qa/bugs/` from `docs/templates/bug-report.md`.  
Sign-off: **baseline confirmed** / **issues found**.
