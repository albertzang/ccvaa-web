# Handoff: Developer → QA

**Date:** 2026-07-27  
**Pass:** `1`  
**Backlog work ID:** `members-0024`  
**Ship path that led here:** `feature-branch`  
**Filled by:** Developer  

**Branch name:** `feat/members-0024-memberships-portal`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/11  
**Commit:** `488291c`  
**Preview URL:** https://ccvaa-web-git-feat-members-0024-membershi-c691b4-azang-projects.vercel.app  
**Preview protection:** QA reads `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local` (do **not** paste the secret here). Browser Pass 1: both bypass query **and** `x-vercel-set-bypass-cookie=true`. See `docs/protocols/PREVIEW_PROTECTION.md`.  
**Production URL:** https://ccvaa-web.vercel.app/ (Pass **2**)  

**Out of scope for QA:** https://ccvaa.ca/ — CEO manual only.

## Environments to test this pass

- [ ] Dev — http://localhost:3000/ (optional)
- [ ] Preview — https://ccvaa-web-git-feat-members-0024-membershi-c691b4-azang-projects.vercel.app (required)
- [ ] Production — n/a for Pass 1

## What changed

`memberships` history table; Join + Stripe subscription webhooks write current membership; Customer portal **Manage billing**; plan copy Annual until / Lifetime / Founding; past_due perks off / no Join; newsletter pending + OTP purpose + login start/verify + unsub_tokens pruned; admin/counts/profile use current membership; schema.md + FEATURES updated.

## Focus checklist

- [ ] Run / confirm Preview DB has migration `0003_memberships_portal` applied (`npm run db:migrate` against Preview Neon if schema errors)
- [ ] Gate OTP verify → newsletter toggle on/off (no pending state)
- [ ] Join Annual/Founding/Lifetime → plan copy; **Manage billing** when Stripe Customer linked
- [ ] Newsletter-only verified member: no Manage billing
- [ ] past_due (via Stripe test / admin edit): perks off; no Join; portal opens
- [ ] Portal return → Neon reflects won’t-renew / cancelled / past_due after webhooks
- [ ] Admin roster current plan/status/period end; hero paid count = active memberships
- [ ] Unsub token `/?unsub=<token>#membership` still works (lifelong `members.unsub_token`)

## Known risks / flaky areas

- Preview Neon must be migrated before membership APIs work (hard-delete migration; no backfill)
- Stripe Customer portal must be enabled in Stripe **test** Dashboard (CEO may already have done this)
- Webhook subscription events must be subscribed on the Stripe test endpoint

## Preview env notes (Pass 1)

Admin mail auth needs Preview Deployment Protection bypass if testing `/admin` on Preview.

## Report back with

`docs/templates/qa-report.md` → `docs/reports/QA-pass1.md`  
Pass 1: **merge** / **hold** / **retest**
