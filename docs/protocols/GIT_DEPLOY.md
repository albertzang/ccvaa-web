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

**Preview access:** Previews use Vercel Deployment Protection. QA bypasses via `VERCEL_AUTOMATION_BYPASS_SECRET` in gitignored `.env.local`. **Browser Pass 1** needs both `x-vercel-protection-bypass` and `x-vercel-set-bypass-cookie=true` on the same navigation. Full rules: `docs/protocols/PREVIEW_PROTECTION.md`.

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
| **Feature branch name** | **Developer** | Created when starting work. **Per-item:** `feat/{feature-slug}-{NNNN}-short-slug`. **Epic lane:** reuse handoff **Epic branch** (e.g. `feat/members`). PM may suggest; Developer creates. |
| **PR** | **Developer** | Opened against `main` after the branch has commits. |
| **Preview URL** | **Vercel** (generated) → **Developer records it** | Appears on the GitHub PR (Vercel bot / deployment checks) or Vercel dashboard. Typical shape: `https://ccvaa-web-git-<branch-slug>-<team>.vercel.app` — do **not** reconstruct by hand. |
| **Preview protection bypass** | **CEO** sets secret in Vercel + `.env.local`; **QA** reads local env | See `docs/protocols/PREVIEW_PROTECTION.md`. Never commit the secret. |
| **Pass 1 handoff to QA** | **Developer** (PM may copy) | Must paste the **exact** Preview URL into `docs/templates/handoff-qa.md`. |
| **Feature branch cleanup** | **Developer** | Delete local + remote **immediately after merge** (per-item **or** epic milestone merge), before Pass 2. |
| **Pass 2 bugfix** | **Developer** | New branch from latest `main` (or CEO-approved `direct-to-main`) — not the old feature branch. |

```
PM handoff-dev (optional suggested branch name)
  → Developer creates branch + implements + opens PR
  → Vercel publishes Preview URL
  → Developer fills handoff-qa with branch, PR link, exact Preview URL
  → QA Pass 1 tests that URL (Dev optional)
```

## Verifier (who runs Pass 1 / Pass 2)

Set on the backlog item and Dev handoff. See [`docs/product/BACKLOG.md`](../product/BACKLOG.md).

| Verifier | Default Ship path | Default Verify passes | Agent QA? |
|----------|-------------------|------------------------|--------------|
| **`agent`** | `feature-branch` | `pass1+pass2` | QA agent (`HANDOFF-QA-*` / `QA-*`) |
| **`ceo`** | `direct-to-main` | `pass2` | CEO manually — **no** agent QA files |
| **`n/a`** | **`direct-to-main`** (default for `agent-os-*`; `feature-branch` only for **self-evolve** or CEO-explicit umbrella PR) | `n/a` | **No** — **`agent-os`** / docs-process only; CEO reviews via chat |

**Verify passes** may be `pass1+pass2`, `pass1` (Preview only), or `pass2` (Production only). Preview = pre-merge staging. **`agent-os-*` items always use Verifier / Verify passes = `n/a`**, and Ship path defaults to **`direct-to-main`** (do not leave `tbd`).

**Prefer common lanes** (see [`COMMUNICATION.md`](COMMUNICATION.md) — happy path / epic-milestone / CEO Verifier / tiny-fix / agent-os / **self-evolve** / baseline). **Rare overrides** (e.g. `agent` + `direct-to-main`, agent `pass1`-only) need explicit CEO wording — do not invent them.

**CEO Verifier:** after Dev ships to the listed env(s), PM asks CEO to verify. CEO says **`verified`** → backlog `completed` (**does not** auto-push product code). Issues → **Iteration** on the **same** work ID. On **`agent-os-*`**, **`verified`** also ships (`direct-to-main` → push; **self-evolve** / `feature-branch` → merge). Table: [`COMMUNICATION.md`](COMMUNICATION.md#what-ceo-verified-means). Details: `docs/protocols/CEO.md`.

## Default delivery flow (Verifier = `agent`)

```
PM handoff
    → Developer: feature branch + PR (not direct push to main)
    → QA Pass 1: Dev (optional) + Preview (required) — if Verify passes includes pass1
    → CEO/PM: approve merge
    → Developer: merge PR into main (when asked)
    → Developer: delete feature branch locally + remotely (immediately after merge)
    → QA Pass 2: Production smoke on https://ccvaa-web.vercel.app/ — if Verify passes includes pass2
    → PM: update FEATURES.md
    → CEO (optional): manual check of https://ccvaa.ca/ outside this protocol
```

**Default merge timing:** one backlog item → one merge to `main` after that item’s Pass 1. For large features that must not land half-built, use the **epic/milestone** lane below.

## Epic / milestone ship lane (opt-in)

Use when several work IDs must ship together (e.g. Members platform + public UI) so `main` never gets an incomplete slice.

| Field (backlog + Dev handoff) | Values | Meaning |
|-------------------------------|--------|---------|
| **Ship path** | `feature-branch` | Still required (Preview exists) |
| **Epic branch** | e.g. `feat/members` or `feat/members-m1` | Shared long-lived branch + one open PR |
| **Merge gate** | `item` (default) \| `epic` | `item` = merge after this ticket’s Pass 1; `epic` = **do not** merge yet — keep committing on Epic branch |

### Rules

1. **CEO/PM declares** the epic at kickoff of the first ticket (set **Epic branch** + **Merge gate: `epic`** on participating items).
2. **Developer** creates `Epic branch` once from latest `main`, opens **one** PR, reuses that branch/PR for every work ID in the milestone. Branch naming may omit per-ticket `NNNN` when on an epic (`feat/{feature-slug}` or `feat/{feature-slug}-m{N}`).
3. **Pass 1** still runs **per ticket** (Verifier = `agent` + pass1) against the **same Preview URL** (updated as commits land). Pass 1 **pass** ≠ merge when Merge gate is `epic`. After **continue epic**, PM records a one-line Pass 1 note on that backlog item (**Overall** or Notes) before the next ticket overwrites fixed `HANDOFF-QA-pass1.md` / `QA-pass1.md`.
4. **Do not merge** until CEO/PM says **merge milestone** (list work IDs). Prefer a short milestone Pass 1 recheck on Preview if the last ticket’s Pass 1 is stale.
5. **Status:** Merge gate `epic` tickets stay **`in-progress` until milestone Pass 2** (or `closed`). Do **not** mark `completed` after ticket Pass 1 alone.
6. **After milestone merge:** delete Epic branch local + remote; run **Pass 2** (if required) — prefer **one** Pass 2 handoff listing all milestone work IDs on the same Production deploy. Then mark participating items `completed` and delete handoffs/reports once (milestone close).
7. **Next milestone:** cut a **new** epic branch from latest `main` (do not revive the deleted branch).
8. **Pass 1 fail** on a ticket: fix on the **same** Epic branch / PR; retest Preview.
9. **Pass 2 fail** after milestone merge: new `fix/…` branch from `main` (same as ordinary lane) — Iteration on the failing work ID(s).
10. Items **without** Epic branch keep the default **per-item merge** lane unchanged.

```
Epic kickoff (CEO/PM)
  → Dev: feat/{slug}[+mN] + PR; tickets with Merge gate=epic share it
  → per ticket: implement → Pass 1 on shared Preview (no merge)
  → CEO/PM: merge milestone (IDs listed)
  → Dev: merge PR → delete epic branch
  → Pass 2 once for the milestone (if Verify passes need pass2)
```

Mechanics also: [`COMMUNICATION.md`](COMMUNICATION.md) · [`HANDOFF.md`](HANDOFF.md) · [`CEO.md`](CEO.md) · [`BACKLOG.md`](../product/BACKLOG.md).

## CEO Verifier flow (typical defaults: direct-to-main + pass2)

```
PM handoff (Verifier: ceo)
    → Developer: work on main; push when CEO asks
    → Skip agent QA
    → PM: ask CEO to verify https://ccvaa-web.vercel.app/ (and/or Preview if pass1)
    → CEO: "verified" → PM completes backlog
         OR notes issues → Iteration on same ID → Dev again
    → CEO (optional): check ccvaa.ca
```

### Pass 1 — Preview (QA agent, or CEO if Verifier = `ceo`)

- Only when **Verify passes** includes `pass1`
- **Required:** exact Preview URL from handoff (Developer-provided)
- **Optional:** Dev (`localhost:3000`) for early feedback while coding
- **Do not** use Production (`ccvaa-web.vercel.app`) or `ccvaa.ca` for Pass 1 of new work
- **Agent + Merge gate `item` (default):** result **pass** → ready to merge; **fail** → same feature branch / PR; retest Preview after fixes
- **Agent + Merge gate `epic`:** result **pass** → **continue epic** (do **not** merge); **fail** → same Epic branch / PR; retest Preview
- **CEO Verifier:** CEO replies **verified** (for this pass) or notes issues → Iteration

### Pass 2 — after merge / direct-to-main push (QA agent, or CEO if Verifier = `ceo`)

- Only when **Verify passes** includes `pass2`
- **Required:** Production smoke on https://ccvaa-web.vercel.app/
- **Do not** require or block on https://ccvaa.ca/ — CEO handles that manually
- Keep Pass 2 focused (smoke + change-specific checks)
- Feature branch should already be deleted when Ship path was `feature-branch` (see cleanup below)
- **CEO Verifier:** **`verified`** completes the item; issues → Iteration on same work ID

### Baseline — Production QA mode (no feature work ID)

**Same environment as Pass 2** (https://ccvaa-web.vercel.app/). Difference: no open PR / no `{feature-slug}-{NNNN}` yet — audit already-on-`main` against FEATURES.md (or a subset), then PM promotes findings into backlog items.

| | |
|--|--|
| **Who initiates** | PM (with CEO ask), or CEO |
| **Pass value on handoff** | `baseline` |
| **Environment** | Production **required** |
| **Skip** | Preview / Pass 1 / merge / branch cleanup |
| **Sign-off** | **baseline confirmed** / **issues found** |

```
CEO/PM: baseline handoff
  → QA: checklist on Production
  → report + Bugs found
  → PM: promote to feature backlogs (**Source:** `qa`)
```

Do **not** fake a Pass 1 against Production. Details remain in handoff templates / gates matrix.

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

Every Dev handoff must set **Ship path** (or inherit Verifier defaults). Developer never invents `direct-to-main` from “this looks small.”

| Ship path | Who decides | Who executes | When allowed |
|-----------|-------------|--------------|--------------|
| **`feature-branch`** | Default when **Verifier = `agent`**; CEO may override | **Developer** | Normal product/code work; CEO Verifier + Preview is a **rare** override |
| **`direct-to-main`** | Default when **Verifier = `ceo`** or **`n/a`**; else **CEO must approve** | See below | CEO Verifier; agent-os; emergency hotfix — **not** the default for Verifier=`agent` |

### Who executes `direct-to-main`

| Change type | Executes | Notes |
|-------------|----------|--------|
| Small **doc / protocol / agent-OS** updates | **PM** | Push when CEO asks **or** on `agent-os-*` **`verified`** (same turn) |
| **Hotfix / code** on `main` (incl. CEO Verifier items) | **Developer** | Handoff says `direct-to-main` **and** (CEO approved **or** Verifier = `ceo`) |
| User-facing / auth / mail with **Verifier = `agent`** | Prefer **`feature-branch`** | Agent QA needs Preview for pass1; `agent` + `direct-to-main` is a **rare** override |

### How Developer knows

1. Open `docs/templates/handoff-dev.md`
2. Read **Verifier**, **Verify passes**, **Ship path** (+ **Epic branch** / **Merge gate** if set)
3. If Ship path missing/blank → apply Verifier defaults (`agent` → `feature-branch`; `ceo` / `n/a` → `direct-to-main`)
4. If `direct-to-main` but CEO approval is not stated **and** Verifier is neither `ceo` nor `n/a` → **block** and ask PM/CEO (do not push)
5. If Verifier = `ceo` → **do not** write agent QA handoffs; notify PM when the verify env is ready
6. If Verifier = `n/a` → docs/process only (typically PM-owned); no Pass 1/2

### Shortened flow when `direct-to-main` (code)

```
CEO-approved handoff (Ship path: direct-to-main) — or Verifier: ceo
  → Developer commits on main (when CEO asks to push)
  → Skip Preview / agent Pass 1 (unless Verify passes includes pass1 — **rare** override)
  → If Verifier = agent + pass2: light QA Pass 2 on https://ccvaa-web.vercel.app/ (**unusual** vs happy path; CEO should have overridden Ship path)
  → If Verifier = ceo + pass2: PM asks CEO to verify Production (no agent QA)
  → PM updates FEATURES.md if behavior changed (after ship confirmed / CEO verified)
  → CEO may manually check ccvaa.ca
```

Pure docs/protocol updates by PM: usually **no QA** unless CEO asks.

## Developer git rules

| Do | Don't |
|----|--------|
| Follow **Verifier** + **Ship path** (+ **Epic branch** / **Merge gate** if set) from the handoff | Invent `direct-to-main` because the change “looks small” |
| Create and name the feature branch from latest `main` when Ship path is `feature-branch` | Push product work straight to `main` without CEO-approved / Verifier=`ceo` `direct-to-main` |
| On **Merge gate = `epic`:** keep one PR; **do not** merge after ticket Pass 1 | Merge an epic ticket early “because Pass 1 passed” |
| On **Merge gate = `item`** (default): open/merge as usual after Pass 1 | Leave random long-lived branches without an Epic declaration |
| Open a PR; wait for CI + Preview deploy when on feature-branch | Merge before Preview verify when Verify passes includes `pass1` (unless CEO waives) |
| Paste the exact Preview URL into the agent QA handoff **or** give it to PM for CEO | Invent the Preview URL from the branch name |
| Skip agent QA files when Verifier = `ceo` | Write `HANDOFF-QA-*` for CEO Verifier items |
| Use `ccvaa-web.vercel.app` only for Pass 2 / CEO pass2 | Use `ccvaa-web.vercel.app` as the feature Preview URL |
| Merge / push `main` only when CEO/PM asks (incl. **merge milestone**) | Force-push `main` or skip hooks |
| Delete feature/epic branch local + remote **right after merge** | Wait for Pass 2 before cleanup; revive merged branch for Pass 2 fixes |
| Pass 2 / CEO-verify fixes: Iteration same ID; **new** branch from `main` if prior was merged | Keep committing on the old merged feature branch |
| Point Pass 2 at `ccvaa-web.vercel.app` | Ask QA agent to verify `ccvaa.ca` |

## Branch naming (Developer)

Include the backlog work ID on **per-item** branches. Examples:

- `feat/admin-console-0001-members-list`
- `fix/admin-console-0004-preview-env`

**Epic lane:** `feat/{feature-slug}` or `feat/{feature-slug}-m{N}` (shared; ticket IDs live in commits/PR/handoffs, not necessarily the branch name).

Pure Agent OS / docs chores may use `chore/agent-os-0001-…`.  
See `docs/product/BACKLOG.md`. Blank work ID on product work → block.

## Env vars on Preview

Preview deployments use Vercel **Preview** environment variables. Admin login uses mail-session auth (no OTP/SMTP/Redis Preview secrets). Deployment Protection bypass still applies for agent/CEO Preview access — see `docs/protocols/PREVIEW_PROTECTION.md`.

**Admin auth for QA/CEO:** sign into Hover webmail inside `/admin` Mail — see `docs/protocols/QA_AUTH.md`. Do not give agents standing mailbox credentials in git.

## Optional later: true staging

A long-lived `staging` branch + dedicated domain can be added later if Preview-per-PR is not enough — tracked as [`agent-os-0003`](../product/backlogs/agent-os-BACKLOG.md#agent-os-0003--optional-long-lived-staging-branchdomain). Until then, **Preview = staging**.
