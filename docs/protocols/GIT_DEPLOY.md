# Git & deploy protocol (feature branch → Preview → Production)

## Truth about environments (agent Dev/QA flow)

| Name | URL | What it tracks |
|------|-----|----------------|
| **Dev** | http://localhost:3000/ | Local machine (`npm run dev`) |
| **Preview** | Unique per branch/PR (from Vercel / GitHub PR checks) | Feature branch — **pre-merge** |
| **Production** | https://ccvaa-web.vercel.app/ | `main` — **agent QA Pass 2 target** |

### Out of agent Dev/QA flow

| Name | URL | Who tests |
|------|-----|-----------|
| **Public domain** | https://ccvaa.ca/ | **CEO only** (manual). Same Vercel Production deploy as `ccvaa-web.vercel.app`, but DNS/CDN/cache can lag or differ. Agents must **not** use `ccvaa.ca` for Pass 1 or Pass 2. |

There is **no** long-lived staging site today. **Preview = pre-merge staging.**

**Preview access:** Previews use Vercel Deployment Protection. QA bypasses via `VERCEL_AUTOMATION_BYPASS_SECRET` in gitignored `.env.local` (query `x-vercel-protection-bypass`). Full rules: `docs/protocols/PREVIEW_PROTECTION.md`.

## Deployment retention (Vercel)

Deleting a Git feature branch / closing a PR does **not** immediately remove Preview URLs. Deployments stay until Vercel **Deployment Retention** ages them out (or someone deletes them in the dashboard).

**Owner:** CEO (project Settings → Security → Deployment Retention Policy)  
**Docs:** https://vercel.com/docs/deployment-retention

### Current `ccvaa-web` policy (set 2026-07-11)

| Deployment type | Retention |
|-----------------|-----------|
| Canceled | **1 day** |
| Errored | **1 day** |
| Preview | **1 week** |
| Production | **1 week** |

### Agent / team expectations

- After merge + branch delete, old Preview URLs may still resolve for up to ~1 week (plus Vercel’s async cleanup lag). They remain behind Deployment Protection.
- Do **not** treat a live old Preview URL as “the branch still exists” or as a Pass 1 target after merge — Pass 2 uses Production only.
- Need a Preview gone **now** → CEO/Developer deletes that deployment in Vercel → Deployments (retention is for automatic cleanup).
- **Production at 1 week** is aggressive for rollback history; Vercel still keeps recent/aliased Production deploys. CEO may lengthen Production later without changing Preview.

## Who owns branch name vs Preview URL

| Item | Owner | Notes |
|------|-------|--------|
| **Feature branch name** | **Developer** | Created when starting work. Convention: `feat/…`, `fix/…`, `chore/…`. PM may *suggest* a name in the Dev handoff; Developer decides and creates it. |
| **PR** | **Developer** | Opened against `main` after the branch has commits. |
| **Preview URL** | **Vercel** (generated) → **Developer records it** | Appears on the GitHub PR (Vercel bot / deployment checks) or Vercel dashboard. Typical shape: `https://ccvaa-web-git-<branch-slug>-<team>.vercel.app` — do **not** reconstruct by hand. |
| **Preview protection bypass** | **CEO** sets secret in Vercel + `.env.local`; **QA** reads local env | See `docs/protocols/PREVIEW_PROTECTION.md`. Never commit the secret. |
| **Pass 1 handoff to QA** | **Developer** (PM may copy) | Must paste the **exact** Preview URL into `docs/templates/handoff-qa.md`. |
| **Feature branch cleanup** | **Developer** | Delete local + remote **immediately after merge**, before Pass 2. |
| **Pass 2 bugfix** | **Developer** | New branch from latest `main` (or CEO-approved `direct-to-main`) — not the old feature branch. |

```
PM handoff-dev (optional suggested branch name)
  → Developer creates branch + implements + opens PR
  → Vercel publishes Preview URL
  → Developer fills handoff-qa with branch, PR link, exact Preview URL
  → QA Pass 1 tests that URL (Dev optional)
```

## Default delivery flow

```
PM handoff
    → Developer: feature branch + PR (not direct push to main)
    → QA Pass 1: Dev (optional) + Preview (required)
    → CEO/PM: approve merge
    → Developer: merge PR into main (when asked)
    → Developer: delete feature branch locally + remotely (immediately after merge)
    → QA Pass 2: Production smoke on https://ccvaa-web.vercel.app/
    → PM: update FEATURES.md
    → CEO (optional): manual check of https://ccvaa.ca/ outside this protocol
```

### Pass 1 — before merge (QA)

- **Required:** exact Preview URL from handoff (Developer-provided)
- **Optional:** Dev (`localhost:3000`) for early feedback while coding
- **Do not** use Production (`ccvaa-web.vercel.app`) or `ccvaa.ca` for Pass 1 of new work
- Result: **pass** → ready to merge; **fail** → bugs back to Developer on the **same** feature branch / PR; retest Preview after fixes

### Pass 2 — after merge (QA)

- **Required:** Production smoke on https://ccvaa-web.vercel.app/
- **Do not** require or block on https://ccvaa.ca/ — CEO handles that manually
- Keep Pass 2 focused (smoke + change-specific checks)
- Feature branch should already be deleted (see cleanup below)

### Baseline — Production audit without a preceding PR (QA)

Use when work is **already on `main`** and never got Pass 1/2, or whenever CEO/PM wants a full regression against Production outside a normal ship.

| | |
|--|--|
| **Who initiates** | PM (with CEO ask), or CEO |
| **Pass value on handoff** | `baseline` |
| **Environment** | https://ccvaa-web.vercel.app/ **required** |
| **Skip** | Preview / Pass 1 / merge / branch cleanup |
| **Scope** | Usually full `docs/product/FEATURES.md` (or a listed subset) |
| **Sign-off** | **baseline confirmed** / **issues found** (bugs → normal fix path) |

```
CEO/PM: baseline handoff (scope + Production URL)
  → QA: full/focused checklist on https://ccvaa-web.vercel.app/
  → QA report + bugs
  → PM: triage fixes (new feature-branch or CEO direct-to-main)
  → CEO (optional): manual ccvaa.ca check
```

**When to use again:** pre-multi-agent backlog, post-incident regression, “we’re not sure Production matches FEATURES.md,” or any CEO-requested Production audit without an open PR.

Do **not** fake a Pass 1 against Production or re-branch old work only to fit the happy path.

## Feature branch cleanup (after merge)

**Owner:** Developer  
**When:** **Immediately after the PR is merged** — before (or as you write) the QA Pass 2 handoff. Do **not** wait for Pass 2 to finish.

**Why before Pass 2:** Once merged, the source of truth is `main`. Keeping the old feature branch invites fixing “on the merged branch,” which drifts from Production. Pass 2 issues get a **new** branch from latest `main` (below).

```bash
git checkout main
git pull origin main
git branch -d <feature-branch>           # local (use -D only if intentionally discarding unmerged work — rare after merge)
git push origin --delete <feature-branch>  # remote
```

Also OK: use GitHub’s “Delete branch” on the merged PR, then delete the local branch and `git fetch --prune`.

| Do | Don't |
|----|--------|
| Delete local **and** remote feature branch after merge | Leave remote feature branches hanging “until Pass 2” |
| Confirm you’re on updated `main` before deleting | Delete `main` or anyone else’s active branch |
| Note cleanup done in the Pass 2 handoff | Reuse the deleted branch name for unrelated work the same day without care |

`direct-to-main` has no feature branch to delete.

## Pass 2 failures — how to fix

**Do not** continue work on the already-merged (and deleted) feature branch.

| Situation | What to do |
|-----------|------------|
| Pass 2 finds bugs | PM/CEO triage → new Dev handoff. Developer cuts a **new** branch from latest `main` (e.g. `fix/…`), full **feature-branch** path: Preview Pass 1 → merge → cleanup → Pass 2 again |
| Trivial Production hotfix | CEO may approve **Ship path: `direct-to-main`** instead |
| Pass 1 finds bugs (before merge) | Keep using the **same** feature branch / PR; push fixes; retest Preview |

```
Pass 2 fail
  → new fix branch from main (or CEO-approved direct-to-main)
  → NOT: revive / push more commits to the old merged feature branch as the ship vehicle
```

## Ship path (feature-branch vs direct-to-main)

Every Dev handoff must set **Ship path** explicitly. Developer never infers it from “this looks small.”

| Ship path | Who decides | Who executes | When allowed |
|-----------|-------------|--------------|--------------|
| **`feature-branch`** (default) | PM writes it; CEO may override | **Developer** | All normal product/code work |
| **`direct-to-main`** | **CEO must approve** (PM may recommend) | See below | Docs-only, emergency hotfix, or trivial one-liner — still prefer PR when practical |

### Who executes `direct-to-main`

| Change type | Executes | Notes |
|-------------|----------|--------|
| Small **doc / protocol / agent-OS** updates | **PM** | Already in PM remit; push only when CEO asks |
| **Hotfix / trivial code** on `main` | **Developer** | Only if handoff says `direct-to-main` **and** CEO approved |
| User-facing, auth, mail proxy, or uncertain scope | Stay on **`feature-branch`** | No shortcuts |

### How Developer knows

1. Open `docs/templates/handoff-dev.md`
2. Read **Ship path:** `feature-branch` | `direct-to-main`
3. If missing, blank, or ambiguous → treat as **`feature-branch`**
4. If `direct-to-main` but CEO approval is not stated → **block** and ask PM/CEO (do not push)

### Shortened flow when `direct-to-main` (code)

```
CEO-approved handoff (Ship path: direct-to-main)
  → Developer commits on main (when CEO asks to push)
  → Skip QA Pass 1 / Preview
  → QA Pass 2 light smoke on https://ccvaa-web.vercel.app/ (recommended for code)
  → PM updates FEATURES.md if behavior changed
  → CEO may manually check ccvaa.ca
```

Pure docs/protocol updates by PM: usually **no QA** unless CEO asks.

## Developer git rules

| Do | Don't |
|----|--------|
| Follow **Ship path** from the handoff | Invent `direct-to-main` because the change “looks small” |
| Create and name the feature branch from latest `main` (default path) | Push product work straight to `main` without CEO-approved `direct-to-main` |
| Open a PR; wait for CI + Preview deploy | Merge before Preview QA passes (unless CEO waives) |
| Paste the exact Preview URL into the QA handoff | Invent the Preview URL from the branch name |
| Use `ccvaa-web.vercel.app` only for Pass 2 | Use `ccvaa-web.vercel.app` as the feature Preview URL |
| Merge / push `main` only when CEO/PM asks | Force-push `main` or skip hooks |
| Delete feature branch local + remote **right after merge** | Wait for Pass 2 before cleanup; revive merged branch for Pass 2 fixes |
| Pass 2 fixes: **new** branch from `main` (or CEO `direct-to-main`) | Keep committing on the old merged feature branch |
| Point Pass 2 at `ccvaa-web.vercel.app` | Ask QA to verify `ccvaa.ca` |

## Branch naming (Developer)

`feat/…`, `fix/…`, `chore/…` — short and descriptive. Example: `feat/admin-members-list`.

## Env vars on Preview

Preview deployments use Vercel **Preview** environment variables. If admin OTP/mail must be tested on Preview, those secrets must exist for Preview (not only Production). Note gaps in the QA handoff.

**OTP readout for QA:** single-Send + CEO-in-the-loop — see `docs/protocols/QA_AUTH.md`. Do not give agents standing mailbox credentials. Do not spam **Send login code** (1/min, 5/hour/IP).

## Optional later: true staging

A long-lived `staging` branch + dedicated domain can be added later if Preview-per-PR is not enough. Until then, **Preview = staging**.
