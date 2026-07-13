# Handoff protocol

## Work ID (required for feature work)

Canonical ID: **`{feature-slug}-{NNNN}`** (e.g. `admin-console-0003`).  
Source of truth: [`docs/product/BACKLOG.md`](../product/BACKLOG.md).

| Artifact | Filename pattern |
|----------|------------------|
| Dev handoff | `docs/handoffs/HANDOFF-DEV-{feature-slug}-{NNNN}.md` |
| QA handoff | `docs/handoffs/HANDOFF-QA-{feature-slug}-{NNNN}-pass1.md` (also `-pass2`) |
| QA report | `docs/reports/QA-{feature-slug}-{NNNN}-pass1.md` |
| Branch | `feat/{feature-slug}-{NNNN}-short-slug` or `fix/{feature-slug}-{NNNN}-…` |

**One path per work ID + pass.** If Pass 1/2 signs **retest** / **hold** and QA runs again, **overwrite** the same `…-passN.md` (and the same handoff filename). Do **not** create `-prior`, `-v2`, `-attemptN`, or dated copies — earlier content lives in **git history**. Optionally note “retest after earlier hold” in the report body.

Same rule for **Dev handoff Iterations** (CEO Verifier rework or agent fail fix on the same ID): overwrite `HANDOFF-DEV-{feature-slug}-{NNNN}.md`.

### Lifespan (delete on close)

Handoffs and QA reports are **ephemeral working docs** for an open work ID (or open baseline). They are **not** long-term product docs (`FEATURES.md` / feature backlogs are).

| When | Delete |
|------|--------|
| Backlog item → **`completed`** or **`canceled`** | All `HANDOFF-DEV|QA-*{feature-slug}-{NNNN}*` and `QA-{feature-slug}-{NNNN}*` under `docs/handoffs/` and `docs/reports/` |
| Baseline closed (findings promoted / triage done) | `HANDOFF-QA-baseline-{NNNN}.md` and `QA-baseline-{NNNN}.md` |

PM deletes these in the **same turn** as the status change (or baseline close). Recover prior text from **git history** if needed. Do not leave backlog **Links** pointing at deleted paths — keep PR / commit links only.

**Bugs** live only as backlog items (`type: bug`, **Source:** `ceo` | `qa`). No parallel bugs directory.

**Verifier** on the backlog item / Dev handoff: `agent` (default) | `ceo`.  
**Verify passes:** `pass1+pass2` | `pass1` | `pass2`.  
When **Verifier = `ceo`**, skip agent QA artifacts entirely; CEO verifies per [`CEO.md`](CEO.md). Defaults: Ship path `direct-to-main`, Verify passes `pass2`.

**Baseline** (no feature backlog item yet): `HANDOFF-QA-baseline-{NNNN}.md` / `QA-baseline-{NNNN}.md`. Assign `{NNNN}` from **Next baseline ID** in `docs/reports/README.md`, then increment it. Put the calendar date only in the handoff/report **Date** field (multiple baselines per day allowed). After the report, PM promotes findings into backlog items (**Source:** `qa`), then **deletes** the baseline handoff + report (lifespan rule above).

Blank backlog ID on feature Dev/QA work → **block**.

## When to hand off

| From | To | Trigger |
|------|-----|---------|
| CEO | PM | Baseline kickoff / bug or task report / backlog review / pick ID to kick off |
| PM | Developer | Backlog item kicked off (`in-progress`) with acceptance criteria + work ID + Verifier + Ship path |
| Developer | QA (Pass 1) | **Verifier = `agent`** + Verify passes includes `pass1`; feature branch pushed; Preview URL ready |
| Developer | PM (CEO verify) | **Verifier = `ceo`**; target env ready (Preview and/or Production per Verify passes) |
| QA | PM | Pass 1 complete — recommend merge or hold |
| CEO/PM | Developer | Approve merge / push after Pass 1 or CEO Preview check / direct-to-main |
| Developer | (self) | After merge: delete feature branch local + remote |
| Developer | QA (Pass 2) | **Verifier = `agent`** + Verify passes includes `pass2`; PR merged; branch cleaned up; Production live |
| PM | CEO | **Verifier = `ceo`**: one-line ask to verify listed env(s) |
| PM | QA (baseline) | CEO asks for Production audit of already-on-main (or regression) scope |
| QA | PM | Pass 2 or baseline complete — confirmed or issues found |
| CEO | PM | **`verified`** → backlog `completed`; **or** issues → Iteration on same ID |
| PM | (backlog) | Promote QA/CEO findings → backlog items (**Source:** `qa` / `ceo`); ship → `completed` + FEATURES.md |
| QA | PM | New defects in a QA report (PM creates backlog `bug` items) |
| PM | Developer | Pass 2 / baseline / CEO-verify fail → Iteration Dev handoff (same work ID unless scope split); new branch from `main` if prior feature branch was merged |

See also `docs/protocols/GIT_DEPLOY.md` and `docs/protocols/CEO.md`.

## Workflows (PM)

### Baseline kickoff

1. CEO: kick off baseline  
2. PM: take **Next baseline ID** from `docs/reports/README.md` → Pass=`baseline` handoff `HANDOFF-QA-baseline-{NNNN}.md` (date in body only); increment Next ID; scope = FEATURES.md (full or subset)  
3. QA: report on Production  
4. PM: promote issues into feature backlogs (`task`/`bug`, **Source:** `qa`); CEO confirms priorities + Verifier  

### CEO reports bug or task

1. CEO describes bug/goal → PM creates backlog item (`type: bug` with **Source:** `ceo`, or `task`)  
2. Set **Verifier** / **Verify passes** / Ship path (CEO may choose `ceo` → defaults `direct-to-main` + `pass2`)  
3. On kickoff: status `in-progress` → Dev handoff with work ID + Verifier fields  
4. **If Verifier = `agent`:** Pass 1/2 per Verify passes → `completed` + FEATURES.md if needed  
5. **If Verifier = `ceo`:** after Dev ships → ask CEO to verify → **`verified`** completes; issues → Iteration on same ID  

### QA finds a bug during a pass

1. QA records finding in the QA report (repro / expected / actual) — does **not** invent a work ID  
2. PM promotes each finding to a backlog `bug` (**Source:** `qa`, Verifier usually `agent`)  
3. CEO sets priority / kickoff / optional Verifier override  
4. If the pass is verifying an **already kicked-off** work ID, update that item / fail the pass — do not create a duplicate ID  

### Backlog review

CEO asks to list/review → PM summarizes open items by feature and priority (incl. Verifier) → edit priorities/status/cancel/add together.

### Pick + kickoff

CEO chooses `{feature-slug}-{NNNN}` → PM sets `in-progress` → writes `HANDOFF-DEV-…` (Verifier + Verify passes + Ship path) → CEO gates per `CEO.md`.

### Conversation → backlog

PM proposes backlog items from chat when goals/bugs emerge; does not invent large `now` scope without CEO priority agreement. Keeps statuses current through the ship path.

### CEO Verifier Iteration

1. CEO notes issues after testing (chat is enough)  
2. PM appends **Iteration N** on the **same** backlog item; status stays `in-progress`  
3. PM overwrites `HANDOFF-DEV-{feature-slug}-{NNNN}.md` with delta acceptance criteria  
4. Dev implements; PM asks CEO to verify again  
5. Repeat until CEO says **`verified`** → `completed` + FEATURES.md if needed  

## Definition of ready (for Developer)

- [ ] **Backlog work ID** present (`{feature-slug}-{NNNN}`) — required for product work
- [ ] **Verifier** and **Verify passes** present (or apply defaults from `BACKLOG.md`)
- [ ] **Ship path** set: apply Verifier defaults if blank (`agent` → `feature-branch`; `ceo` → `direct-to-main`)
- [ ] Problem and success criteria written (from backlog description + handoff)
- [ ] Out of scope listed
- [ ] Environment / secrets implications noted (incl. Preview vs Production env vars)
- [ ] FEATURES.md section referenced or marked “new”
- [ ] If `direct-to-main` without CEO approval and Verifier ≠ `ceo` → **block**
- [ ] If backlog ID blank on feature work → **block** and ask PM

## Definition of done (for Developer → next verify step)

- [ ] Code complete for agreed scope on the Ship path named with work ID
- [ ] Lint/typecheck (and build if relevant) pass
- [ ] **Verifier = `agent` + pass1:** PR open; exact Preview URL in QA Pass 1 handoff
- [ ] **Verifier = `ceo` + pass1:** Preview URL (or PR) given to PM for CEO — **no** agent QA file
- [ ] **Verifier = `agent` + pass2 only / post-merge:** Pass 2 handoff ready on Production
- [ ] **Verifier = `ceo` + pass2:** Production deploy live; tell PM CEO can verify — **no** agent QA file
- [ ] Commit/push/PR/merge only as CEO/PM asked

## Definition of verified — Pass 1 (QA → PM, before merge)

- [ ] Checklist run on **Preview URL from handoff** (required) and **Dev** if requested
- [ ] Work ID recorded on report filename / body
- [ ] If Preview URL missing → blocked; asked Developer/PM (do not invent URL)
- [ ] New defects listed under **Bugs found** (repro + Preview URL); PM will promote to backlog
- [ ] Explicit recommendation: **merge** / **hold** / **retest**
- [ ] FEATURES.md accuracy flagged if docs drift
- [ ] Only when **Verifier = `agent`** and Verify passes includes `pass1`

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
- [ ] If fail: expect Iteration / **new** fix branch from `main` (or CEO `direct-to-main`) — not the old feature branch
- [ ] Only when **Verifier = `agent`** and Verify passes includes `pass2`

## Definition of verified — CEO Verifier (CEO → PM)

- [ ] CEO smoked the env(s) listed in Verify passes (Preview and/or https://ccvaa-web.vercel.app/)
- [ ] CEO replies **`verified`** → PM marks backlog `completed` (+ FEATURES.md if needed)
- [ ] Or CEO notes issues → PM Iteration on same work ID; status stays `in-progress`
- [ ] No agent QA report required
- [ ] Do **not** require agents to use https://ccvaa.ca/ (CEO may check it separately)
- [ ] Does **not** by itself authorize commit/push for product code — CEO still approves push/merge per Ship path (unless already pushed and this is Production verify only)

## Definition of verified — agent-os (CEO → PM)

- [ ] Work ID is `agent-os-{NNNN}` (Verifier / Verify passes = `n/a`)
- [ ] CEO replies **`verified`** after skim/approve
- [ ] PM marks backlog **`completed`** (+ FEATURES.md / protocols as needed)
- [ ] PM ships in the same turn per **Ship path** — no second “please commit/merge” ask:
  - **`direct-to-main`:** commit + push `main`
  - **`feature-branch`:** merge the PR + delete feature branch (local + remote)
- [ ] Or CEO notes issues → Iteration on same `agent-os-*` ID until **`verified`**

## Definition of done (Developer, post-merge cleanup)

- [ ] PR merged to `main` when CEO/PM asked
- [ ] Local feature branch deleted
- [ ] Remote feature branch deleted (`git push origin --delete …` or GitHub UI + prune)
- [ ] Next verify step ready (agent Pass 2 handoff **or** CEO verify cue); work ID in filenames when agent QA applies

## Definition of done (PM, after ship confirmed / CEO verified)

- [ ] Backlog item status → `completed` (or `canceled` if dropped)
- [ ] `FEATURES.md` updated if behavior changed
- [ ] **Delete** all `docs/handoffs/` + `docs/reports/` files for that work ID (same turn); strip dead file Links from the backlog item — keep PR/commit links if useful
- [ ] **If `agent-os-*` and CEO said `verified`:** ship per Ship path in the same turn (standing authorization)