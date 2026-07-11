# Handoff: Developer / PM → QA

**Date:**  
**Pass:** 1 (pre-merge: Dev + Preview) | 2 (post-merge: Production smoke)  
**Filled by:** Developer (required for Pass 1 Preview URL) / PM may copy  

**Branch name:** (Developer-created)  
**PR link:**  
**Commit:**  
**Preview URL:** (Pass 1 — **required**; paste exact URL from Vercel / GitHub PR — do not reconstruct)  
**Production URL:** https://ccvaa-web.vercel.app/ (Pass 2)  

**Out of scope for QA:** https://ccvaa.ca/ — CEO manual only (DNS/cache). Do not test or block on it.

## How QA gets the Preview URL

1. Developer creates the branch and opens the PR.
2. Vercel posts the Preview deployment URL on the PR.
3. Developer pastes that URL into **Preview URL** above (and checks the box below).
4. QA tests **only** that pasted URL. If blank → block and ask Developer/PM.

## Environments to test this pass

- [ ] Dev — http://localhost:3000/ (optional on Pass 1)
- [ ] Preview — _(must match Preview URL field)_ (required on Pass 1)
- [ ] Production — https://ccvaa-web.vercel.app/ (required on Pass 2)

## What changed

## Focus checklist

- [ ]
- [ ]

## Known risks / flaky areas

## Preview env notes (Pass 1)

Admin OTP/mail need Vercel **Preview** env vars if testing auth on Preview.

## How to verify auth (if needed)

OTP → `info@ccvaa.ca` (or ADMIN_OTP_EMAIL). Do not commit codes.

## Report back with

`docs/templates/qa-report.md` + bugs via `docs/templates/bug-report.md`  
Pass 1: recommend **merge** / **hold** / **retest**  
Pass 2: recommend **ship confirmed** / **hotfix**
