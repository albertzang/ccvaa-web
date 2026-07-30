# Handoff: Developer → QA

**Date:** 2026-07-29  
**Pass:** `1`  
**Backlog work ID:** `members-0024`  
**Ship path that led here:** `feature-branch`  
**Filled by:** Developer  
**Iteration:** `4` (focused retest — Manage billing opens portal in new tab)

**Branch name:** `feat/members-0024-memberships-portal`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/11  
**Commit:** `c44d3b4`  
**Preview URL:** https://ccvaa-web-git-feat-members-0024-membershi-c691b4-azang-projects.vercel.app  
**Preview protection:** QA reads `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local` (do **not** paste the secret here). Browser Pass 1: both bypass query **and** `x-vercel-set-bypass-cookie=true`. See `docs/protocols/PREVIEW_PROTECTION.md`.  
**Production URL:** https://ccvaa-web.vercel.app/ (Pass **2**)  

**Out of scope for QA:** https://ccvaa.ca/ — CEO manual only.

## Environments to test this pass

- [ ] Dev — http://localhost:3000/ (optional)
- [ ] Preview — https://ccvaa-web-git-feat-members-0024-membershi-c691b4-azang-projects.vercel.app (required)
- [ ] Production — n/a for Pass 1

## What changed

**Iteration 4:** **Manage billing** opens the Stripe Customer Portal URL in a **new tab** (`window.open(..., "_blank", "noopener,noreferrer")`). The CCVAA `#membership` page stays in the current tab. Fail-closed in-app errors (no customer, Stripe down) unchanged.

Prior iterations (already on this PR): memberships + portal + prune; payment-mode `customer_creation: 'always'`; Customer invariant (`cus_*`) + migration `0004`.

## Focus checklist

- [ ] Sign in as a paid member with **Manage billing** visible
- [ ] Click **Manage billing** → Stripe portal opens in a **new tab**; current tab remains on the site (`#membership` / members area)
- [ ] Fail-closed still works when portal cannot open (e.g. newsletter-only / no customer — no Manage billing, or in-app error if forced)

## Known risks / flaky areas

- Popup blockers may block `window.open` if the click→async gap is long; if portal does not open, note whether an error appeared in-app
- Stripe Customer portal must be enabled in Stripe **test** Dashboard
- Wait for Vercel Preview deploy tip ≥ `c44d3b4` before retesting

## Preview env notes (Pass 1)

Admin mail auth needs Preview Deployment Protection bypass if testing `/admin` on Preview.

## Report back with

`docs/templates/qa-report.md` → `docs/reports/QA-pass1.md`  
Pass 1: **merge** / **hold** / **retest**
