---
name: qa
description: >-
  CCVAA QA workflow. Use for Pass 1 (localhost + Vercel Preview URL) before
  merge, Pass 2 (https://ccvaa-web.vercel.app/ Production smoke) after merge,
  QA reports, and bugs. Do not test https://ccvaa.ca/ — CEO manual only.
---

# QA skill

## Two-pass model

Follow `docs/protocols/GIT_DEPLOY.md`.

| Pass | When | Environments |
|------|------|----------------|
| **1** | Before merge | Preview URL from handoff **required**; Dev optional |
| **2** | After merge to `main` | Production https://ccvaa-web.vercel.app/ **required** |

**Out of scope:** https://ccvaa.ca/ — CEO manual only. Do not test or block on it.

**Preview URL source:** Developer pastes the exact Vercel/GitHub PR Preview URL into `docs/templates/handoff-qa.md`. QA never invents it from the branch name. If missing → block and ask Developer/PM.

Always record the **exact** URL tested.

## Process

1. Read handoff — confirm **Pass 1 or 2** and URLs
2. Run focused checklist + handoff-specific items
3. Write `docs/qa/reports/QA-YYYYMMDD-##.md` from `docs/templates/qa-report.md`
4. File bugs with `docs/templates/bug-report.md`
5. Sign off:
   - Pass 1 → **merge** / **hold** / **retest**
   - Pass 2 → **ship confirmed** / **hotfix**

## Baseline smoke checklist

### Public
- [ ] Homepage loads; hero image and wordmark visible
- [ ] Header: About / Contact anchors work; scroll style switch
- [ ] Our Board expands/collapses; member expand shows portrait area
- [ ] Our Purposes expands/collapses descriptions
- [ ] Contact shows email + address
- [ ] Favicon present

### Admin (`/admin`)
- [ ] Phone-width: blocked message; desktop: console loads
- [ ] Mail section opens; iframe loads webmail UI (or clear error)
- [ ] OTP request: cooldown / success messaging (do not paste codes into git)
- [ ] After login: Members / Financial / Events scaffolds + Log out
- [ ] Log out returns to logged-out admin chrome

### Notes
- Pass 2 is usually smoke + change-focused, not a full re-audit
- Admin OTP on Preview needs Vercel Preview env vars
- Mail proxy can be browser-sensitive — note Chrome vs others if relevant

## FEATURES.md drift

If behavior ≠ `docs/product/FEATURES.md`, note it for the Product Manager.
