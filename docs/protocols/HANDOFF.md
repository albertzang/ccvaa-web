# Handoff protocol

## Work ID (required for feature work)

Canonical ID: **`{feature-slug}-{NNNN}`** (e.g. `admin-console-0003`).  
Source of truth: [`docs/product/BACKLOG.md`](../product/BACKLOG.md).

| Artifact | Filename pattern |
|----------|------------------|
| Dev handoff | `docs/qa/handoffs/HANDOFF-DEV-{feature-slug}-{NNNN}.md` |
| QA handoff | `docs/qa/handoffs/HANDOFF-QA-{feature-slug}-{NNNN}-pass1.md` (also `-pass2`) |
| QA report | `docs/qa/reports/QA-{feature-slug}-{NNNN}-pass1.md` |
| Branch | `feat/{feature-slug}-{NNNN}-short-slug` or `fix/{feature-slug}-{NNNN}-…` |

**One path per work ID + pass.** If Pass 1/2 signs **retest** / **hold** and QA runs again, **overwrite** the same `…-passN.md` (and the same handoff filename). Do **not** create `-prior`, `-v2`, `-attemptN`, or dated copies — earlier content lives in **git history**. Optionally note “retest after earlier hold” in the report body.

**Bugs** live only as backlog items (`type: bug`, **Source:** `ceo` | `qa`). No `docs/qa/bugs/` files.

**Baseline** (no feature backlog item yet): `HANDOFF-QA-baseline-{NNNN}.md` / `QA-baseline-{NNNN}.md`. Assign `{NNNN}` from **Next baseline ID** in `docs/qa/README.md`, then increment it. Put the calendar date only in the handoff/report **Date** field (multiple baselines per day allowed). After the report, PM promotes findings into backlog items (**Source:** `qa`).

Blank backlog ID on feature Dev/QA work → **block**.

## When to hand off

| From | To | Trigger |
|------|-----|---------|
| CEO | PM | Baseline kickoff / bug report / backlog review / pick ID to kick off |
| PM | Developer | Backlog item kicked off (`in-progress`) with acceptance criteria + work ID |
| Developer | QA (Pass 1) | Feature branch pushed; Preview URL ready; handoff named with work ID |
| QA | PM | Pass 1 complete — recommend merge or hold |
| CEO/PM | Developer | Approve merge to `main` after Pass 1 |
| Developer | (self) | After merge: delete feature branch local + remote |
| Developer | QA (Pass 2) | PR merged; branch cleaned up; Production deploy live |
| PM | QA (baseline) | CEO asks for Production audit of already-on-main (or regression) scope |
| QA | PM | Pass 2 or baseline complete — confirmed or issues found |
| PM | (backlog) | Promote QA/CEO findings → backlog items (**Source:** `qa` / `ceo`); ship → `completed` + FEATURES.md |
| QA | PM | New defects in a QA report (PM creates backlog `bug` items) |
| PM | Developer | Pass 2 / baseline fail → new fix handoff (new branch from `main`; new or same work ID as PM decides) |

See also `docs/protocols/GIT_DEPLOY.md` and `docs/protocols/CEO.md`.

## Workflows (PM)

### Baseline kickoff

1. CEO: kick off baseline  
2. PM: take **Next baseline ID** from `docs/qa/README.md` → Pass=`baseline` handoff `HANDOFF-QA-baseline-{NNNN}.md` (date in body only); increment Next ID; scope = FEATURES.md (full or subset)  
3. QA: report on Production  
4. PM: promote issues into feature backlogs (`task`/`bug`, **Source:** `qa`); CEO confirms priorities  

### CEO reports bug

1. CEO describes bug → PM creates backlog item (`type: bug`, **Source:** `ceo`, priority with CEO)  
2. On kickoff: status `in-progress` → Dev handoff with work ID  
3. Pass 1 → merge → Pass 2 → `completed` + FEATURES.md if needed  
4. Link related QA reports from the backlog item when useful  

### QA finds a bug during a pass

1. QA records finding in the QA report (repro / expected / actual) — does **not** invent a work ID  
2. PM promotes each finding to a backlog `bug` (**Source:** `qa`)  
3. CEO sets priority / kickoff  
4. If the pass is verifying an **already kicked-off** work ID, update that item / fail the pass — do not create a duplicate ID  

### Backlog review

CEO asks to list/review → PM summarizes open items by feature and priority → edit priorities/status/cancel/add together.

### Pick + kickoff

CEO chooses `{feature-slug}-{NNNN}` → PM sets `in-progress` → writes `HANDOFF-DEV-…` → suggests branch with ID → CEO gates per `CEO.md`.

### Conversation → backlog

PM proposes backlog items from chat when goals/bugs emerge; does not invent large `now` scope without CEO priority agreement. Keeps statuses current through the ship path.

## Definition of ready (for Developer)

- [ ] **Backlog work ID** present (`{feature-slug}-{NNNN}`) — required for product work
- [ ] **Ship path** set: `feature-branch` (default) or `direct-to-main` (CEO-approved, stated)
- [ ] Problem and success criteria written (from backlog description + handoff)
- [ ] Out of scope listed
- [ ] Environment / secrets implications noted (incl. Preview vs Production env vars)
- [ ] FEATURES.md section referenced or marked “new”
- [ ] If Ship path blank/ambiguous → treat as `feature-branch`; if `direct-to-main` without CEO approval → block
- [ ] If backlog ID blank on feature work → **block** and ask PM

## Definition of done (for Developer → QA Pass 1)

- [ ] Code complete for agreed scope on a **feature branch** named with work ID
- [ ] PR open (title includes work ID); CI green (or noted)
- [ ] **Exact Preview URL** recorded in QA Pass 1 handoff — not guessed from branch name
- [ ] QA Pass 1 handoff filename includes work ID
- [ ] `npm run lint` and `npm run typecheck` (and build if relevant) pass
- [ ] Commit/push/PR only as CEO/PM asked

## Definition of verified — Pass 1 (QA → PM, before merge)

- [ ] Checklist run on **Preview URL from handoff** (required) and **Dev** if requested
- [ ] Work ID recorded on report filename / body
- [ ] If Preview URL missing → blocked; asked Developer/PM (do not invent URL)
- [ ] New defects listed under **Bugs found** (repro + Preview URL); PM will promote to backlog
- [ ] Explicit recommendation: **merge** / **hold** / **retest**
- [ ] FEATURES.md accuracy flagged if docs drift

## Definition of verified — Baseline (QA → PM, no PR)

- [ ] Checklist run on https://ccvaa-web.vercel.app/ for handoff scope (often full FEATURES.md)
- [ ] No Pass 1 / Preview required
- [ ] New defects listed under **Bugs found** (repro + Production URL)
- [ ] Explicit recommendation: **baseline confirmed** / **issues found**
- [ ] FEATURES.md drift flagged
- [ ] Do **not** block on https://ccvaa.ca/
- [ ] PM will promote findings to backlog (**Source:** `qa`) — QA does not invent work IDs

## Definition of verified — Pass 2 (QA → PM, after merge)

- [ ] Production smoke on https://ccvaa-web.vercel.app/ (change-focused)
- [ ] Work ID on report
- [ ] Regressions listed under **Bugs found** if needed
- [ ] Explicit recommendation: **ship confirmed** / **rollback or hotfix**
- [ ] Do **not** block on https://ccvaa.ca/ (CEO manual only)
- [ ] If fail: expect a **new** fix branch from `main` (or CEO `direct-to-main`) — not the old feature branch

## Definition of done (Developer, post-merge cleanup)

- [ ] PR merged to `main` when CEO/PM asked
- [ ] Local feature branch deleted
- [ ] Remote feature branch deleted (`git push origin --delete …` or GitHub UI + prune)
- [ ] Pass 2 handoff written (cleanup boxes checked; work ID in filename)

## Definition of done (PM, after Pass 2 ship confirmed)

- [ ] Backlog item status → `completed` (or `canceled` if dropped)
- [ ] `FEATURES.md` updated if behavior changed
- [ ] Links on backlog item to PR / reports as useful
