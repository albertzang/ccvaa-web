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

## Who owns branch name vs Preview URL

| Item | Owner | Notes |
|------|-------|--------|
| **Feature branch name** | **Developer** | Created when starting work. Convention: `feat/…`, `fix/…`, `chore/…`. PM may *suggest* a name in the Dev handoff; Developer decides and creates it. |
| **PR** | **Developer** | Opened against `main` after the branch has commits. |
| **Preview URL** | **Vercel** (generated) → **Developer records it** | Appears on the GitHub PR (Vercel bot / deployment checks) or Vercel dashboard. Typical shape: `https://ccvaa-web-git-<branch-slug>-<team>.vercel.app` — do **not** reconstruct by hand. |
| **Pass 1 handoff to QA** | **Developer** (PM may copy) | Must paste the **exact** Preview URL into `docs/templates/handoff-qa.md`. |
| **QA Pass 1 target** | **QA** | Uses **only** the Preview URL from the handoff. If missing → **block** and ask Developer/PM. Never guess the URL from the branch name. |

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
    → QA Pass 2: Production smoke on https://ccvaa-web.vercel.app/
    → PM: update FEATURES.md
    → CEO (optional): manual check of https://ccvaa.ca/ outside this protocol
```

### Pass 1 — before merge (QA)

- **Required:** exact Preview URL from handoff (Developer-provided)
- **Optional:** Dev (`localhost:3000`) for early feedback while coding
- **Do not** use Production (`ccvaa-web.vercel.app`) or `ccvaa.ca` for Pass 1 of new work
- Result: **pass** → ready to merge; **fail** → bugs back to Developer; retest Preview after fixes

### Pass 2 — after merge (QA)

- **Required:** Production smoke on https://ccvaa-web.vercel.app/
- **Do not** require or block on https://ccvaa.ca/ — CEO handles that manually
- Keep Pass 2 focused (smoke + change-specific checks)

## Developer git rules

| Do | Don't |
|----|--------|
| Create and name the feature branch from latest `main` | Push product work straight to `main` by default |
| Open a PR; wait for CI + Preview deploy | Merge before Preview QA passes (unless CEO waives) |
| Paste the exact Preview URL into the QA handoff | Invent the Preview URL from the branch name |
| Use `ccvaa-web.vercel.app` only for Pass 2 | Use `ccvaa-web.vercel.app` as the feature Preview URL |
| Merge only when CEO/PM asks after Pass 1 | Force-push `main` or skip hooks |
| Point Pass 2 at `ccvaa-web.vercel.app` | Ask QA to verify `ccvaa.ca` |

**Exceptions (CEO must approve):** docs-only, emergency hotfix, or trivial one-liners may go to `main` with a shortened path (still prefer PR when practical).

## Branch naming (Developer)

`feat/…`, `fix/…`, `chore/…` — short and descriptive. Example: `feat/admin-members-list`.

## Env vars on Preview

Preview deployments use Vercel **Preview** environment variables. If admin OTP/mail must be tested on Preview, those secrets must exist for Preview (not only Production). Note gaps in the QA handoff.

## Optional later: true staging

A long-lived `staging` branch + dedicated domain can be added later if Preview-per-PR is not enough. Until then, **Preview = staging**.
