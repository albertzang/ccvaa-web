# Handoff: Developer → QA

**Date:** 2026-07-29  
**Pass:** `1`  
**Backlog work ID:** `members-0024`  
**Ship path that led here:** `feature-branch`  
**Filled by:** Developer  
**Iteration:** `3` (retest after Iteration 3 Customer invariant)

**Branch name:** `feat/members-0024-memberships-portal`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/11  
**Commit:** `7ea2353`  
**Preview URL:** https://ccvaa-web-git-feat-members-0024-membershi-c691b4-azang-projects.vercel.app  
**Preview protection:** QA reads `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local` (do **not** paste the secret here). Browser Pass 1: both bypass query **and** `x-vercel-set-bypass-cookie=true`. See `docs/protocols/PREVIEW_PROTECTION.md`.  
**Production URL:** https://ccvaa-web.vercel.app/ (Pass **2**)  

**Out of scope for QA:** https://ccvaa.ca/ — CEO manual only.

## Environments to test this pass

- [ ] Dev — http://localhost:3000/ (optional)
- [ ] Preview — https://ccvaa-web-git-feat-members-0024-membershi-c691b4-azang-projects.vercel.app (required)
- [ ] Production — n/a for Pass 1

## What changed

**Iteration 3:** Enforce invariant — every `memberships` row requires that member’s `members.stripe_customer_id` to be a durable Stripe Customer (`cus_*`). Reject null / Guest (`gcus_*`).

- App write path: before membership upsert/insert (and Founding activation), require + persist `cus_*` on `members`
- Checkout: still payment-mode `customer_creation: 'always'` when no Customer; reuse `customer` only when already `cus_*`
- Migration **`0004`** (do not re-run/edit `0003`): partial unique index on `members(stripe_customer_id)` where not null; `BEFORE INSERT OR UPDATE` trigger on `memberships` that raises if member Customer is null / not `cus_%`
- Paid seeds use `cus_seed_*` so migrate/seed pass

**CEO / Preview Neon:** If Preview Integration uses a Neon branch that already has `0003` but not `0004`, run `npm run db:migrate` (applies `0004`) against that Preview `DATABASE_URL`. Fresh Preview DBs need full migrate through `0004`. Seeds may need re-run after migrate so paid seed rows have `cus_…`.

Prior Iteration 2: payment-mode `customer_creation: 'always'`. Iteration 1: `memberships` + portal + prune.

## Focus checklist

- [ ] Join Founding → pay → profile `stripeCustomerId` is `cus_…`; **Manage billing** works
- [ ] Lifetime smoke (same payment-mode path) → Customer + Manage billing
- [ ] Annual still OK; Customer reused when already set
- [ ] Newsletter-only still has no Manage billing (no `stripe_customer_id`)
- [ ] Confirm Preview deploy tip ≥ `7ea2353` and migration `0004` applied (membership APIs must not 503 on missing schema)

## Known risks / flaky areas

- **Migration `0004` must be applied on Preview Neon** before membership writes succeed under the new trigger — CEO may need `npm run db:migrate` if Integration did not auto-migrate
- Old Preview rows with memberships but null/`gcus_*` Customer are out of scope for backfill; new Joins should create `cus_*`
- Stripe Customer portal must be enabled in Stripe **test** Dashboard
- Wait for Vercel Preview deploy of `7ea2353` before retesting

## Preview env notes (Pass 1)

Admin mail auth needs Preview Deployment Protection bypass if testing `/admin` on Preview.

## Report back with

`docs/templates/qa-report.md` → `docs/reports/QA-pass1.md`  
Pass 1: **merge** / **hold** / **retest**
