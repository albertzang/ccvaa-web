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

**Preview protection:** Before opening Preview, read `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local` and navigate with  
`?x-vercel-protection-bypass=<secret>` (or `&…`). See `docs/protocols/PREVIEW_PROTECTION.md`.  
If secret empty → block (ask CEO to fill `.env.local`). If Vercel login wall persists → block, do not thrash. Never commit or report the secret.

Always record the **exact** URL tested (you may omit the bypass query from the written report URL; note “bypass used”).

## Process

1. Read handoff — confirm **Pass 1, 2, or baseline**, **Backlog work ID** (required for Pass 1/2; `n/a` for baseline), and URLs. Blank work ID on feature work → **block**. If the backlog item’s **Verifier = `ceo`**, you should not receive a handoff — stop and ask PM.
2. **Pass 1:** apply Preview protection bypass from `.env.local` before browsing
3. Run focused checklist + handoff-specific items (baseline often = full FEATURES.md)
4. Write report as `docs/reports/QA-pass1.md` (or `QA-pass2.md` / `QA-baseline.md`) from `docs/templates/qa-report.md`. Put feature work ID in the **body** when applicable (baseline: `n/a`). On **retest**, overwrite the same file — never add `-prior` / `-v2` / `-attemptN`. (PM deletes these files when the backlog item closes — do not archive copies.)
5. List new defects under **Bugs found** in the QA report (PM promotes to backlog `type: bug`, **Source:** `qa`). Do not create a parallel bugs directory
6. Sign off:
   - Pass 1 → **merge** / **hold** / **retest**
   - Pass 2 → **ship confirmed** / **hotfix**
   - Baseline → **baseline confirmed** / **issues found** (PM promotes findings to backlog)

**Note:** Items with **Verifier = `ceo`** are verified by the CEO, not this agent. Baseline audits still use the QA agent.

## Baseline smoke checklist

### Public
- [ ] Homepage loads; hero image and wordmark visible
- [ ] Header: About / Contact anchors work; scroll style switch
- [ ] Our Board expands/collapses; member expand shows portrait area
- [ ] Our Purposes expands/collapses descriptions
- [ ] Contact shows email + address
- [ ] Favicon present

### Admin (`/admin`)
- [ ] Console loads on phone and desktop viewports
- [ ] Webmail panel: iframe loads webmail UI (or clear error)
- [ ] After mailbox login: Members / Events / Financial + Log out
- [ ] Log out returns to logged-out admin chrome (if logged in)

### Notes
- Pass 2 is usually smoke + change-focused; **baseline** is usually a fuller FEATURES.md audit
- **Preview protection:** `.env.local` bypass — `docs/protocols/PREVIEW_PROTECTION.md`
- Admin auth is Hover mailbox session — `docs/protocols/QA_AUTH.md` (`ADMIN_EMAIL` / `ADMIN_PASS` in `.env.local`)
- Never store mailbox passwords in repo/reports
- Mail proxy can be browser-sensitive — note Chrome vs others if relevant

## FEATURES.md drift

If behavior ≠ `docs/product/FEATURES.md`, note it for the Product Manager.
