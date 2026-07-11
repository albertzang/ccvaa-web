# Handoff: Developer / PM → QA — Pass 2 (OTP Redis shared store)

**Date:** 2026-07-10  
**Pass:** `2`  
**Ship path that led here:** `feature-branch` (PR #2 merged)  
**Filled by:** Product Manager  

**Branch name:** n/a (merged; remote `fix/otp-verify-shared-store` deleted)  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/2 (MERGED)  
**Commit:** `f39f965` (merge) / includes `2491e61` Redis + single-Send docs  
**Preview URL:** n/a  
**Production URL:** https://ccvaa-web.vercel.app/  

**Post-merge cleanup:**  
- [x] Feature branch deleted on origin (`fix/otp-verify-shared-store`)  
- [x] Local branch deleted / on `main`

**Out of scope for QA:** https://ccvaa.ca/ — CEO manual only.

## Environments to test this pass

- [x] Production — https://ccvaa-web.vercel.app/ (**required**)

## What changed

BUG-20260710-02 fix shipped via PR #2: admin OTP challenges + rate-limit buckets use **Upstash Redis** (`KV_REST_API_URL` + `KV_REST_API_TOKEN`) so verify works across Vercel serverless instances. Pass 1 on Preview (**QA-20260710-05**) passed with coordinated single-Send login. CEO confirmed Production Redis env previously.

## Focus checklist

- [ ] Production homepage smoke (loads)
- [ ] Desktop `/admin` loads
- [ ] **Full admin login (required):** **single-Send** + CEO-in-the-loop — see `docs/protocols/QA_AUTH.md`
  - Exactly **one** successful **Send login code** on Production
  - Stop → ask parent/CEO for newest 6-digit code from `info@ccvaa.ca`
  - **Verify once** → session + Members / Financial / Events scaffolds + Log out
- [ ] Confirm **no** “No active code found” on fresh coordinated verify (closes BUG-20260710-02 if pass)
- [ ] Wrong-code / lockout drills **skipped** this pass (preserve 5/hour Send quota)

## Known risks

- Production must have `KV_REST_API_URL` + `KV_REST_API_TOKEN` (CEO set). If verify fails with “No active code found” after a fresh coordinated code → **hotfix**, do not spam Send.
- OTP readout: **single-Send** only — never extra Sends while waiting for CEO.

## OTP

> **OTP:** single-Send + CEO-in-the-loop (`docs/protocols/QA_AUTH.md`). QA Sends once → CEO pastes newest code → QA verifies once. No extra Sends.

## Report back with

`docs/qa/reports/QA-20260710-06.md`  
Pass 2 sign-off: **ship confirmed** / **hotfix**  
If ship confirmed: note BUG-20260710-02 can be closed.
