# Handoff: Developer → QA

**Date:** 2026-07-27  
**Pass:** `1`  
**Backlog work ID:** `members-0024`  
**Ship path that led here:** `feature-branch`  
**Filled by:** Developer  
**Iteration:** `2` (retest after Pass 1 hold)

**Branch name:** `feat/members-0024-memberships-portal`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/11  
**Commit:** `0980297`  
**Preview URL:** https://ccvaa-web-git-feat-members-0024-membershi-c691b4-azang-projects.vercel.app  
**Preview protection:** QA reads `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local` (do **not** paste the secret here). Browser Pass 1: both bypass query **and** `x-vercel-set-bypass-cookie=true`. See `docs/protocols/PREVIEW_PROTECTION.md`.  
**Production URL:** https://ccvaa-web.vercel.app/ (Pass **2**)  

**Out of scope for QA:** https://ccvaa.ca/ — CEO manual only.

## Environments to test this pass

- [ ] Dev — http://localhost:3000/ (optional)
- [ ] Preview — https://ccvaa-web-git-feat-members-0024-membershi-c691b4-azang-projects.vercel.app (required)
- [ ] Production — n/a for Pass 1

## What changed

**Iteration 2:** Payment-mode Join Checkout (Founding/Lifetime) now sets `customer_creation: 'always'` when no existing `stripe_customer_id`, so Checkout creates a Stripe Customer and activation persists it — **Manage billing** works after Founding/Lifetime pay. Existing `customer` is still reused when set. Annual unchanged.

Prior Iteration 1: `memberships` history table; Join + Stripe subscription webhooks; Customer portal; plan copy; past_due; newsletter/OTP prune; admin/counts/profile; schema.md + FEATURES.

## Focus checklist

- [ ] **Retest hold:** Join Founding → pay → profile has `stripeCustomerId`; UI shows **Manage billing**; portal session succeeds
- [ ] **Retest hold:** Lifetime smoke (same payment-mode path) → Customer linked + Manage billing
- [ ] Spot-check Annual still OK (subscription path unchanged)
- [ ] Prior greens: newsletter toggle; newsletter-only no Manage billing; past_due; admin roster; unsub token — only if time / regression risk

## Known risks / flaky areas

- Preview Neon must be migrated before membership APIs work (hard-delete migration; no backfill)
- Stripe Customer portal must be enabled in Stripe **test** Dashboard (CEO may already have done this)
- Webhook subscription events must be subscribed on the Stripe test endpoint
- Wait for Vercel Preview deploy of `0980297` before retesting

## Preview env notes (Pass 1)

Admin mail auth needs Preview Deployment Protection bypass if testing `/admin` on Preview.

## Report back with

`docs/templates/qa-report.md` → `docs/reports/QA-pass1.md`  
Pass 1: **merge** / **hold** / **retest**
