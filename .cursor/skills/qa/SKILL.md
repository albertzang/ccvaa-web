---
name: qa
description: >-
  CCVAA QA workflow. Use for Pass 1 (Preview), Pass 2 (Production after merge),
  or baseline (Production audit without a PR) on https://ccvaa-web.vercel.app/.
  Do not test https://ccvaa.ca/ — CEO manual only.
---

# QA skill

## Identity / chat title

Always **`QA`**. On session start (or if the title drifts), rename via `rename_chat` to exactly that. No work-ID/topic titles; restore after any CEO one-off rename unless CEO says otherwise.

## Pass model

Follow `docs/protocols/GIT_DEPLOY.md`.

| Pass | When | Environments |
|------|------|----------------|
| **1** | Before merge (or before **continue epic** on Merge gate `epic`) | Preview URL from handoff **required**; Dev optional |
| **2** | After merge to `main` (incl. **milestone** merge) | Production https://ccvaa-web.vercel.app/ **required** |
| **baseline** | Already-on-main audit / regression (no PR) | Production https://ccvaa-web.vercel.app/ **required** |

**Out of scope:** https://ccvaa.ca/ — CEO manual only. Do not test or block on it.

**Preview URL source (Pass 1):** Developer pastes the exact Vercel/GitHub PR Preview URL into the handoff. QA never invents it. If missing on Pass 1 → block.

**Epic / milestone:** if handoff Merge gate is `epic`, Pass 1 still runs on Preview; sign-off **continue epic** (not merge to `main`) when the ticket looks good. Pass 2 runs once after CEO/PM **merge milestone**. See [`GIT_DEPLOY.md`](../../docs/protocols/GIT_DEPLOY.md#epic--milestone-ship-lane-opt-in).

**Preview protection:** Before opening Preview, read `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local` and navigate with **both**  
`?x-vercel-protection-bypass=<secret>&x-vercel-set-bypass-cookie=true` (or `&…` if a query already exists).  
Query-only (secret without set-bypass-cookie) is **insufficient** for interactive browser forms / same-origin `fetch`. curl/API may use header or query alone. See `docs/protocols/PREVIEW_PROTECTION.md`.  
If secret empty → block (ask CEO to fill `.env.local`). If Vercel login wall persists → block, do not thrash. Never commit or report the secret.

Always record the **exact** URL tested (you may omit the bypass query from the written report URL; note “bypass + set-bypass-cookie used”).

## Process

1. Read handoff — confirm **Pass 1, 2, or baseline**, **Backlog work ID** (required for Pass 1/2; `n/a` for baseline), and URLs. Blank work ID on feature work → **block**. If the backlog item’s **Verifier = `ceo`**, you should not receive a handoff — stop and ask PM.
2. **Pass 1:** apply Preview protection bypass from `.env.local` before browsing — both bypass secret **and** `x-vercel-set-bypass-cookie=true` on the same navigation
3. Run focused checklist + handoff-specific items (baseline often = full FEATURES.md)
4. Write report as `docs/reports/QA-pass1.md` (or `QA-pass2.md` / `QA-baseline.md`) from `docs/templates/qa-report.md`. Put feature work ID in the **body** when applicable (baseline: `n/a`). On **retest**, overwrite the same file — never add `-prior` / `-v2` / `-attemptN`. (PM deletes these files when the backlog item closes — do not archive copies.)
4b. **Pass 1 scratch (ephemeral):** You may use local ad-hoc scripts (e.g. `scripts/qa-pass1-*.mjs`) or machine logs (e.g. `docs/reports/.qa-pass1-*`) while building the report — **not** OS deliverables. **Delete scratch when the report is written** (same lifespan as handoffs/reports). **Do not commit** scratch unless a separate backlog item adds a **maintained** harness (Playwright/CI). `.gitignore` covers common patterns if deletion is missed.
5. List new defects under **Bugs found** in the QA report (PM promotes to backlog `type: bug`, **Source:** `qa`). Do not create a parallel bugs directory
6. Sign off:
   - Pass 1 → **merge** / **hold** / **retest** (Merge gate `epic` → **continue epic** instead of **merge**)
   - Pass 2 → **ship confirmed** / **hotfix** (epic milestone Pass 2 may list multiple work IDs)
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
- **Preview protection:** `.env.local` bypass + set-bypass-cookie for browser — `docs/protocols/PREVIEW_PROTECTION.md`
- Admin auth is Hover mailbox session — `docs/protocols/QA_AUTH.md` (`ADMIN_EMAIL` / `ADMIN_PASS` in `.env.local`)
- Never store mailbox passwords in repo/reports
- Mail proxy can be browser-sensitive — note Chrome vs others if relevant

## FEATURES.md drift

If behavior ≠ `docs/product/FEATURES.md`, note it for the Product Manager.
