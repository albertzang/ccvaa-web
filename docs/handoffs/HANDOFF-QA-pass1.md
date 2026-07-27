# Handoff: Developer / PM → QA

**Date:** 2026-07-26  
**Pass:** `1`  
**Backlog work ID:** `members-0026`  
**Ship path that led here:** `feature-branch`  
**Filled by:** Developer  

**Save as:** `docs/handoffs/HANDOFF-QA-pass1.md`

**Branch name:** `feat/members-0026-stripe-customer-id`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/10  
**Commit:** `9ee0edb`  
**Preview URL:** https://ccvaa-web-git-feat-members-0026-stripe-cu-f4e6a6-azang-projects.vercel.app  
**Preview protection:** QA reads `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local` (do **not** paste the secret here). Browser Pass 1: both bypass query **and** `x-vercel-set-bypass-cookie=true`. See `docs/protocols/PREVIEW_PROTECTION.md`.  
**Production URL:** https://ccvaa-web.vercel.app/ (Pass **2**)  

**Post-merge cleanup (Pass 2 only):**  
- [ ] Feature branch deleted **locally**  
- [ ] Feature branch deleted **on origin**  
Cleanup happens **right after merge**, before Pass 2 testing — see `docs/protocols/GIT_DEPLOY.md`.  

**Out of scope for QA:** https://ccvaa.ca/ — CEO manual only (DNS/cache). Do not test or block on it.

## Environments to test this pass

- [ ] Dev — http://localhost:3000/ (optional on Pass 1 only)
- [ ] Preview — https://ccvaa-web-git-feat-members-0026-stripe-cu-f4e6a6-azang-projects.vercel.app (required)
- [ ] Production — n/a for Pass 1

## What changed

Stripe billing binds to **Customer ID** (not email):

1. Verified profile email change → `stripe.customers.update` when `stripe_customer_id` is set; fail closed (Neon email unchanged on Stripe failure)
2. Join Checkout (session + OTP-join) reuses Stripe `customer` when member has `stripe_customer_id`
3. `checkout.session.completed` / join activation resolve by `stripe_customer_id` first; email metadata / `customer_email` fallback
4. Docs: Neon email = login; Stripe Customer ID = billing (`docs/members/schema.md`)

## Focus checklist

- [ ] Paid member with `stripe_customer_id`: change email via profile OTP — login email updates; Stripe Customer email tracks (test mode Dashboard)
- [ ] If Stripe sync fails (or unavailable) for a bound customer — clear error; Neon email **not** changed
- [ ] Member row with existing `stripe_customer_id` (e.g. re-Join / newsletter-only with prior customer) → Checkout session uses `customer` (no unnecessary duplicate Customer)
- [ ] New Join without Customer ID still works via `customer_email`
- [ ] After paid Checkout: activation / join return succeeds; member still linked to same `stripe_customer_id`
- [ ] Regression: Join Founding/Lifetime/Annual happy path; MessageBanner surfaces profile email errors

## Known risks / flaky areas

- Stripe test mode + webhook timing on Preview; join return fulfills from paid session if webhook lags
- Members public surface may stay gated by Edge Config — use Preview with Members on / bypass per env
- Out of scope: Customer Portal, cancel UX (`members-0024`), live keys (`members-0009`)

## Preview env notes (Pass 1)

Admin mail auth needs Preview Deployment Protection bypass if testing `/admin` on Preview (mailbox login in iframe). Stripe test keys expected on Preview.

## Production / baseline / Pass 2 auth notes

- Admin auth = Hover mailbox login in Mail iframe — see `docs/protocols/QA_AUTH.md`
- QA reads `ADMIN_EMAIL` / `ADMIN_PASS` from `.env.local` to sign in — **do not** paste into handoffs or reports
- Never commit mailbox passwords or give them standing share outside `.env.local`

## Report back with

`docs/templates/qa-report.md` → save as `docs/reports/QA-pass1.md`  
Bugs found → list in this QA report for PM triage (backlog `type: bug`, **Source:** `qa`). No separate bug files.

- Pass 1: **merge** / **hold** / **retest**
