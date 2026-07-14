# Handoff: Developer / PM → QA

**Date:**  
**Pass:** `1` | `2` | `baseline`  
**Backlog work ID:** `{feature-slug}-{NNNN}` (**required** for Pass 1/2 feature work; `n/a` for baseline)  
**Ship path that led here:** `feature-branch` | `direct-to-main` | `n/a` (baseline)  
**Epic branch:** _(optional)_ e.g. `feat/members` — blank on happy path  
**Merge gate:** `item` (default) | `epic` — when `epic`, Pass 1 sign-off is **continue epic** (not merge to `main`)  
**Filled by:** Developer (Pass 1 Preview URL) / PM (baseline) / either (Pass 2)  

**Save as:**  
- Feature: `docs/handoffs/HANDOFF-QA-pass1.md` (or `HANDOFF-QA-pass2.md`)  
- Baseline: `docs/handoffs/HANDOFF-QA-baseline.md` (date in **Date** field only)  

**Branch name:** (per-item: must include work ID; epic: shared Epic branch name; n/a for baseline or direct-to-main)  
**PR link:** (n/a for baseline or direct-to-main)  
**Commit:** (optional for baseline — note `main` tip if known)  
**Preview URL:** (Pass **1** only — **required**; paste exact URL from Vercel / GitHub PR — do not reconstruct)  
**Preview protection:** QA reads `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local` (do **not** paste the secret here). See `docs/protocols/PREVIEW_PROTECTION.md`.  
**Production URL:** https://ccvaa-web.vercel.app/ (Pass **2** and **baseline**)  

**Post-merge cleanup (Pass 2 only):**  
- [ ] Feature/epic branch deleted **locally**  
- [ ] Feature/epic branch deleted **on origin** (or n/a for `direct-to-main`)  
Cleanup happens **right after merge**, before Pass 2 testing — see `docs/protocols/GIT_DEPLOY.md`.  
**Baseline:** cleanup n/a (no feature branch for this pass).
**Epic milestone:** one cleanup after **merge milestone** (not after each ticket Pass 1).
**Out of scope for QA:** https://ccvaa.ca/ — CEO manual only (DNS/cache). Do not test or block on it.

## How QA gets the Preview URL (Pass 1 only)

1. Developer creates the branch and opens the PR.
2. Vercel posts the Preview deployment URL on the PR.
3. Developer pastes that URL into **Preview URL** above.
4. QA tests **only** that pasted URL. If blank on Pass 1 → block and ask Developer/PM.
5. **Protection bypass:** Before navigating, QA loads `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local` and opens  
   `<Preview URL>?x-vercel-protection-bypass=<secret>` (or `&…` if query already present).  
   If the secret is empty/missing → **block** and ask CEO to fill `.env.local`. Never write the secret into this handoff or the QA report.  
   Details: `docs/protocols/PREVIEW_PROTECTION.md`.

## Environments to test this pass

- [ ] Dev — http://localhost:3000/ (optional on Pass 1 only)
- [ ] Preview — _(must match Preview URL field)_ (required on Pass 1)
- [ ] Production — https://ccvaa-web.vercel.app/ (required on Pass 2 and **baseline**)

## What changed

(For **baseline:** “Audit already-on-main features per FEATURES.md” — no new PR.)

## Focus checklist

- [ ]
- [ ]

## Known risks / flaky areas

## Preview env notes (Pass 1)

Admin mail auth needs Preview Deployment Protection bypass if testing `/admin` on Preview (mailbox login in iframe).

## Production / baseline / Pass 2 auth notes

- Admin auth = Hover mailbox login in Mail iframe — see `docs/protocols/QA_AUTH.md`
- QA reads `ADMIN_EMAIL` / `ADMIN_PASS` from `.env.local` to sign in — **do not** paste into handoffs or reports
- Never commit mailbox passwords or give them standing share outside `.env.local`

## Report back with

`docs/templates/qa-report.md` → save as `docs/reports/QA-pass1.md` (or `QA-pass2.md` / `QA-baseline.md`)  
Bugs found → list in this QA report for PM triage (backlog `type: bug`, **Source:** `qa`). No separate bug files.
  
- Pass 1: **merge** / **hold** / **retest** *(Merge gate `epic` → **continue epic**)*  
- Pass 2: **ship confirmed** / **hotfix** *(may cover multiple milestone work IDs)*  
- Baseline: **baseline confirmed** / **issues found**
