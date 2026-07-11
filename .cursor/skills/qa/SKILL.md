---
name: qa
description: >-
  CCVAA QA workflow. Use for Pass 1 (Preview), Pass 2 (Production after merge),
  or baseline (Production audit without a PR) on https://ccvaa-web.vercel.app/.
  Do not test https://ccvaa.ca/ — CEO manual only.
---

# QA skill

## Pass model

Follow `docs/protocols/GIT_DEPLOY.md`.

| Pass | When | Environments |
|------|------|----------------|
| **1** | Before merge | Preview URL from handoff **required**; Dev optional |
| **2** | After merge to `main` | Production https://ccvaa-web.vercel.app/ **required** |
| **baseline** | Already-on-main audit / regression (no PR) | Production https://ccvaa-web.vercel.app/ **required** |

**Out of scope:** https://ccvaa.ca/ — CEO manual only. Do not test or block on it.

**Preview URL source (Pass 1):** Developer pastes the exact Vercel/GitHub PR Preview URL into the handoff. QA never invents it. If missing on Pass 1 → block.

Always record the **exact** URL tested.

## Process

1. Read handoff — confirm **Pass 1, 2, or baseline** and URLs
2. Run focused checklist + handoff-specific items (baseline often = full FEATURES.md)
3. Write `docs/qa/reports/QA-YYYYMMDD-##.md` from `docs/templates/qa-report.md`
4. File bugs with `docs/templates/bug-report.md` under `docs/qa/bugs/`
5. Sign off:
   - Pass 1 → **merge** / **hold** / **retest**
   - Pass 2 → **ship confirmed** / **hotfix**
   - Baseline → **baseline confirmed** / **issues found**

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
- [ ] After login: Members / Financial / Events scaffolds + Log out (if login possible)
- [ ] Log out returns to logged-out admin chrome (if logged in)

### Notes
- Pass 2 is usually smoke + change-focused; **baseline** is usually a fuller FEATURES.md audit
- Admin OTP on Preview needs Vercel Preview env vars
- **OTP readout:** CEO-in-the-loop (`docs/protocols/QA_AUTH.md`) — never store mailbox passwords or OTP codes in repo/reports
- If CEO unavailable for readout: mark full login as blocked (not automatic product fail); still test request UI
- Mail proxy can be browser-sensitive — note Chrome vs others if relevant

## FEATURES.md drift

If behavior ≠ `docs/product/FEATURES.md`, note it for the Product Manager.
