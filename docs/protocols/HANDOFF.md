# Handoff protocol

**Workflow map:** [`COMMUNICATION.md`](COMMUNICATION.md) (stages, common lanes, what **`verified`** means, rare overrides). This file owns **artifact paths, lifespan, handoff triggers, and the gates matrix** (ready / done / verified).

## Work ID (required for feature work)

Canonical ID: **`{feature-slug}-{NNNN}`** (e.g. `admin-console-0003`).  
Source of truth: [`docs/product/BACKLOG.md`](../product/BACKLOG.md).  
Put the work ID in the **handoff/report body** — not in the filename.

| Artifact | Filename (fixed) |
|----------|------------------|
| Dev handoff | `docs/handoffs/HANDOFF-DEV.md` |
| QA handoff | `docs/handoffs/HANDOFF-QA-pass1.md` / `HANDOFF-QA-pass2.md` / `HANDOFF-QA-baseline.md` |
| QA report | `docs/reports/QA-pass1.md` / `QA-pass2.md` / `QA-baseline.md` |
| Branch | Per-item: `feat/{feature-slug}-{NNNN}-short-slug` or `fix/…`. **Epic:** shared `feat/{feature-slug}` or `feat/{feature-slug}-m{N}` |

**Shared fixed paths.** Filenames do **not** include feature slug or backlog ID. Only one active feature handoff/report set should exist at a time; a new kickoff **overwrites** these paths. Prefer finishing the prior item first (`completed` / `closed` + delete artifacts).

**Retest / Iteration:** overwrite the same fixed path. Do **not** create `-prior`, `-v2`, `-attemptN`, or dated copies — earlier content lives in **git history**.

### Lifespan (delete on close)

Handoffs and QA reports are **ephemeral working docs** for an open work ID (or open baseline). They are **not** long-term product docs (`FEATURES.md` / feature backlogs are).

| When | Delete |
|------|--------|
| Backlog item → **`completed`** or **`closed`** | `HANDOFF-DEV.md`, `HANDOFF-QA-pass1.md`, `HANDOFF-QA-pass2.md`, `QA-pass1.md`, `QA-pass2.md` (whichever exist) |
| Baseline closed (findings promoted / triage done) | `HANDOFF-QA-baseline.md` and `QA-baseline.md` |

PM deletes these in the **same turn** as the status change (or baseline close). Recover prior text from **git history** if needed. Do not leave backlog **Links** pointing at deleted paths — keep PR / commit links only.

**Epic / milestone:** while Merge gate is `epic`, do **not** delete handoffs/reports after a single ticket’s Pass 1 — keep until **milestone close** (Pass 2 or CEO marks all listed IDs `completed`/`closed`). Record each ticket’s Pass 1 outcome on the backlog item before overwriting fixed QA paths.

Status change + handoff/report deletion may land in the **same commit** as other doc updates for that close — no separate “please commit cleanup” ask when CEO already authorized the ship (`verified`, merge ask, or explicit commit ask).

**Bugs** live only as backlog items (`type: bug`, **Source:** `ceo` | `qa`). No parallel bugs directory.

**Verifier** on the backlog item / Dev handoff: `agent` (default) | `ceo` | `n/a` (agent-os / docs-process).  
**Verify passes:** `pass1+pass2` | `pass1` | `pass2` | `n/a`.  
When **Verifier = `ceo`**, skip agent QA artifacts entirely; CEO verifies per [`CEO.md`](CEO.md). Defaults: Ship path `direct-to-main`, Verify passes `pass2`.  
When **Verifier = `n/a`**, no Pass 1/2; Ship path defaults to `direct-to-main` (`feature-branch` only for self-evolve / CEO-explicit umbrella).

**Baseline** (no feature backlog item yet): `HANDOFF-QA-baseline.md` / `QA-baseline.md`. Put the calendar date in the **Date** field only. After the report, PM promotes findings into backlog items (**Source:** `qa`), then **deletes** the baseline handoff + report (lifespan rule above).

Blank backlog ID on feature Dev/QA work → **block**.


## When to hand off

| From | To | Trigger |
|------|-----|---------|
| CEO | PM | Baseline kickoff / bug or task report / backlog review / pick ID to kick off |
| PM | Developer | Backlog item kicked off (`in-progress`) with acceptance criteria + work ID + Verifier + Ship path (+ Epic branch / Merge gate if epic lane) |
| Developer | QA (Pass 1) | **Verifier = `agent`** + Verify passes includes `pass1`; feature or epic branch pushed; Preview URL ready |
| Developer | PM (CEO verify) | **Verifier = `ceo`**; target env ready (Preview and/or Production per Verify passes) |
| QA | PM | Pass 1 complete — recommend merge or hold (**Merge gate `epic`:** recommend **continue epic** / hold — not merge to `main`) |
| CEO/PM | Developer | Approve merge / push after Pass 1 or CEO Preview check / direct-to-main; **or** **merge milestone** for epic lane |
| Developer | (self) | After merge: delete feature/epic branch local + remote |
| Developer | QA (Pass 2) | **Verifier = `agent`** + Verify passes includes `pass2`; PR merged; branch cleaned up; Production live (epic: after **milestone** merge) |
| PM | CEO | **Verifier = `ceo`**: one-line ask to verify listed env(s) |
| PM | QA (baseline) | CEO asks for Production audit of already-on-main (or regression) scope |
| QA | PM | Pass 2 or baseline complete — confirmed or issues found |
| CEO | PM | **`verified`** → backlog `completed`; **or** issues → Iteration on same ID |
| PM | (backlog) | Promote QA/CEO findings → backlog items (**Source:** `qa` / `ceo`); ship → `completed` + FEATURES.md |
| QA | PM | New defects in a QA report (PM creates backlog `bug` items) |
| PM | Developer | Pass 2 / baseline / CEO-verify fail → Iteration Dev handoff (same work ID unless scope split); new branch from `main` if prior feature branch was merged |

See also `docs/protocols/GIT_DEPLOY.md` and `docs/protocols/CEO.md`. Workflow index: [`COMMUNICATION.md`](COMMUNICATION.md).

## Workflows (PM) — mechanics under the map

Stages **Intake → Prioritize → Kickoff → Ship → Verify → Close** are indexed in [`COMMUNICATION.md`](COMMUNICATION.md). Below are PM mechanics only (not a second map).

### Baseline kickoff

1. CEO: kick off baseline  
2. PM: write Pass=`baseline` handoff `HANDOFF-QA-baseline.md` (date in body only); scope = FEATURES.md (full or subset)  
3. QA: report on Production  
4. PM: promote issues into feature backlogs (`task`/`bug`, **Source:** `qa`); CEO confirms priorities + Verifier  

### Intake (CEO report or conversation → backlog)

1. CEO describes bug/goal (or PM proposes from chat) → PM creates backlog item (`type: bug` with **Source:** `ceo`, or `task`)  
2. Set **Verifier** / **Verify passes** / Ship path — prefer [common lanes](COMMUNICATION.md#common-lanes-use-defaults-unless-ceo-overrides)  
3. On kickoff: status `in-progress` → Dev handoff with work ID + Verifier fields  
4. **If Verifier = `agent` + Merge gate `item`:** Pass 1/2 per Verify passes → `completed` + FEATURES.md if needed  
5. **If Verifier = `agent` + Merge gate `epic`:** Pass 1 → **continue epic**; stay `in-progress` until milestone Pass 2 → then `completed` + FEATURES; delete handoffs/reports at milestone close  
6. **If Verifier = `ceo`:** after Dev ships → ask CEO to verify → **`verified`** completes backlog (**does not** auto-push); issues → Iteration on same ID  

### QA finds a bug during a pass

1. QA records finding in the QA report (repro / expected / actual) — does **not** invent a work ID  
2. PM promotes each finding to a backlog `bug` (**Source:** `qa`, Verifier usually `agent`)  
3. CEO sets priority / kickoff / optional Verifier override  
4. If the pass is verifying an **already kicked-off** work ID, update that item / fail the pass — do not create a duplicate ID  

### Backlog review

CEO asks to list/review → PM summarizes open items by feature and priority (incl. Verifier) → edit priorities/status/close/add together.

### Kickoff (+ tiny-fix)

CEO chooses `{feature-slug}-{NNNN}` → PM sets `in-progress` → writes `HANDOFF-DEV.md` (Verifier + Verify passes + Ship path; + **Epic branch** / **Merge gate** when using the epic lane) → CEO gates per `CEO.md`.

**Epic / milestone fast notes:** when CEO/PM declares an epic, set the same **Epic branch** on each participating ticket with **Merge gate `epic`**. Pass 1 still per ticket; **do not** ask for per-ticket merge — ask **merge milestone** when ready. Canonical: [`GIT_DEPLOY.md`](GIT_DEPLOY.md#epic--milestone-ship-lane-opt-in).

**Tiny-fix fast path** (least process for trivial CEO-verified tweaks): when **all** of the following hold, PM may write an **abbreviated** Dev handoff (required fields only — see template):

- Verifier = `ceo`, Ship path = `direct-to-main`, Verify passes = `pass2` (defaults OK)
- Scope is one small change: CSS/copy/proxy tweak, one-file fix, or similar — **not** auth redesign, schema, or multi-surface UX
- Backlog item still exists with work ID + one clear Acceptance line

Developer still blocks on blank work ID and still must not invent `direct-to-main` for Verifier = `agent`.

### CEO Verifier Iteration

1. CEO notes issues after testing (chat is enough)  
2. PM appends **Iteration N** on the **same** backlog item; status stays `in-progress`  
3. PM overwrites `docs/handoffs/HANDOFF-DEV.md` with delta acceptance criteria  
4. Dev implements; PM asks CEO to verify again  
5. Repeat until CEO says **`verified`** → `completed` + FEATURES.md if needed  

### Self-evolve (CEO kickoff)

1. CEO: **kick off self-evolve** (optional scope hint)  
2. PM: create **new** `agent-os-{NNNN}` — Verifier/`Verify passes`=`n/a`, Ship path=**`feature-branch`**, status `in-progress`  
3. PM: branch `chore/agent-os-{NNNN}-self-evolve` from latest `main`; open PR when ready for review (or before asking CEO)  
4. **Loop** (PM decides; **no** mid-loop CEO approval):
   - Evaluate Agent OS vs Guiding principles in `AGENTS.md` (incl. **#9 Living docs = current state** — spot leftovers/contradictions); pick the **most valuable** improvement  
   - **Stop** if none remain, or further ideas are **insignificant**  
   - Otherwise implement, **prune** stale competing copy in the same change, **commit on the feature branch**, append to backlog **Overall**, repeat  
5. PM: push branch; one-line ask CEO to **review commit history** on the PR  
6. CEO **`verified`** / merge approve → PM marks `completed`, merges PR, deletes branch, updates FEATURES if needed  
7. CEO notes / hold → same work ID; PM continues loop or addresses notes  

No Dev/QA handoffs. Docs/process only. Canonical: [`COMMUNICATION.md`](COMMUNICATION.md#self-evolve-ceo-kickoff-os-improve-loop).

## Gates matrix (ready / done / verified)

One place for “what must be true” at each gate. Workflow index: [`COMMUNICATION.md`](COMMUNICATION.md). What CEO **`verified`** means (complete vs ship): [`COMMUNICATION.md`](COMMUNICATION.md#what-ceo-verified-means).

| Role | Gate | Must be true |
|------|------|----------------|
| **Dev** | **Ready** (start work) | Work ID on handoff; Verifier / Verify passes / Ship path set (or Verifier defaults); **Epic branch** + Merge gate when epic lane; Acceptance written (tiny-fix: Acceptance alone OK); blank ID or `agent`+`direct-to-main` without CEO approval → **block** |
| **Dev** | **Done → next verify** | Scope done; lint/typecheck clean; commit/push/PR/merge only as asked. **agent+pass1:** PR + Preview URL in `HANDOFF-QA-pass1.md`. **ceo+pass1:** Preview/PR to PM (no agent QA file). **Merge gate `epic`:** PR stays open after Pass 1. **agent+pass2 / post-merge:** Pass 2 handoff ready. **ceo+pass2:** Production live; tell PM CEO can verify |
| **Dev** | **Done → post-merge cleanup** | PR merged when asked (incl. **merge milestone**); local + remote feature/epic branch **deleted**; next verify cue ready (agent Pass 2 or CEO) |
| **QA** | **Pass 1 verified** | Only if Verifier=`agent` + pass1; checklist on **Preview URL from handoff** (Dev optional); work ID in report body; missing Preview → **block**; **Bugs found** listed; sign-off **merge** / **hold** / **retest** (**Merge gate `epic`:** **continue epic** instead of merge); flag FEATURES drift |
| **QA** | **Pass 2 verified** | Only if Verifier=`agent` + pass2; Production smoke on https://ccvaa-web.vercel.app/; work ID(s) in report (epic may list milestone IDs); **Bugs found** if needed; sign-off **ship confirmed** / **hotfix**; fail → Iteration + **new** branch from `main` (not revived merged branch); do **not** block on `ccvaa.ca` |
| **QA** | **Baseline verified** | Production audit (no Preview / no feature work ID); **Bugs found** + **baseline confirmed** / **issues found**; PM promotes (**Source:** `qa`); do **not** block on `ccvaa.ca` |
| **CEO** | **Product verified** (Verifier=`ceo`) | Smoked Verify-passes env(s); reply **`verified`** → PM marks `completed` (**no** auto-push/merge); or note issues → Iteration same ID; no agent QA files; `ccvaa.ca` optional/separate |
| **CEO** | **agent-os verified** | Skim/approve `agent-os-*`; reply **`verified`** → PM marks `completed` **and ships** same turn (`direct-to-main` → commit+push; `feature-branch` / **self-evolve** → merge+delete branch); or Iteration same ID |
| **PM** | **Self-evolve loop** | After CEO kickoff: new `agent-os-*` + feature branch; evaluate→improve→**prune**→commit (Guiding principle #9) without mid-loop CEO asks; stop when no/insignificant improvements; then ask CEO to review commits before merge |
| **PM** | **Close done** | Status `completed` / `closed`; FEATURES updated if behavior changed; delete matching `docs/handoffs` + `docs/reports`; strip dead file Links; on `agent-os-*` + **`verified`**, ship per Ship path in the same turn |

**Always Iteration on the same work ID** when verify fails or CEO notes issues; Ship path decides branch vs `main` (see [`GIT_DEPLOY.md`](GIT_DEPLOY.md)).
