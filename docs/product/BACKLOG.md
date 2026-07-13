# Product backlog (index)

> **Owner:** Product Manager (with CEO).  
> **Shipped behavior** lives in [`FEATURES.md`](FEATURES.md).  
> **Work-to-do** lives in the feature backlog files below.  
> **Bugs** are backlog items (`type: bug`) — no parallel bugs directory.

## Features

| Feature | Slug | Backlog file |
|---------|------|----------------|
| Public Homepage | `public-homepage` | [`backlogs/public-homepage-BACKLOG.md`](backlogs/public-homepage-BACKLOG.md) |
| Admin Console | `admin-console` | [`backlogs/admin-console-BACKLOG.md`](backlogs/admin-console-BACKLOG.md) |
| Agent OS | `agent-os` | [`backlogs/agent-os-BACKLOG.md`](backlogs/agent-os-BACKLOG.md) |

## Item schema (required)

| Field | Values |
|-------|--------|
| **ID** | Per-feature `0001`, `0002`, … — canonical work ID is **`{feature-slug}-{NNNN}`** |
| **Title** | Short label |
| **Type** | `task` \| `bug` |
| **Priority** | `now` \| `next` \| `later` |
| **Status** | `not-started` \| `in-progress` \| `completed` \| `closed` |
| **Source** | **Bugs only:** `ceo` \| `qa` (baseline findings = `qa`; link the baseline QA report) |
| **Verifier** | `agent` (default) \| `ceo` \| **`n/a`** — who verifies Dev’s work. **`n/a` for `agent-os`** (docs/process; no Pass 1/2) |
| **Verify passes** | `pass1+pass2` \| `pass1` \| `pass2` \| **`n/a`** — **`n/a` for `agent-os`** |
| **Ship path** | Optional on the item; **required** on the Dev handoff when code ships. Docs-only / `agent-os` usually `direct-to-main` |
| **Description** | Enough for Dev (and agent QA if Verifier = `agent`); bugs include repro / expected / actual |

### Verifier defaults

| Verifier | Default Ship path | Default Verify passes | Agent QA? |
|----------|-------------------|------------------------|-----------|
| **`agent`** | `feature-branch` | `pass1+pass2` | Yes — Pass 1 Preview / Pass 2 Production per handoff |
| **`ceo`** | `direct-to-main` | `pass2` | **No** — CEO verifies manually; no `HANDOFF-QA-*` / `QA-*` reports |
| **`n/a`** | `direct-to-main` (typical; CEO may set `feature-branch`) | `n/a` | **No** — used for **`agent-os`** (and other docs/process-only work). CEO reviews via chat / repo skim; say **`verified`** to complete when PM asks. On **`verified`** for `agent-os-*`, PM marks **`completed`** and ships without a further ask: **`direct-to-main`** → commit + push; **`feature-branch`** → merge PR (see [`CEO.md`](../protocols/CEO.md)) |

CEO may override Ship path and Verify passes when Verifier is `agent` or `ceo`. **Verifier = `ceo`** implies CEO owns verification and (for the default Ship path) approves `direct-to-main`.

**Do not** set Verifier / Verify passes to `agent` or `ceo` on **`agent-os-*`** items — always **`n/a`**.

**CEO Verifier loop** (Verifier = `ceo` only): stay `in-progress` until CEO says **verified** → `completed`. If CEO finds issues, append an **Iteration** on the same backlog item, overwrite the Dev handoff, and kick Dev again — do not invent a new work ID unless scope is deliberately split. Details: [`docs/protocols/CEO.md`](../protocols/CEO.md).

Copy shape from [`docs/templates/backlog-item.md`](../templates/backlog-item.md).

## Item order in feature backlog files

List work items **by ID descending** (highest / newest first). When adding a new item, insert it **immediately after the file header** (above older IDs). Do not sort by priority or status in the file — priority lives in the item fields; PM **list/review** answers can filter/sort in chat.

## Naming (handoffs, branches, reports)

| Artifact | Pattern |
|----------|---------|
| Dev handoff | `docs/handoffs/HANDOFF-DEV.md` (work ID in body) |
| QA handoff | `docs/handoffs/HANDOFF-QA-pass1.md` / `HANDOFF-QA-pass2.md` / `HANDOFF-QA-baseline.md` |
| QA report | `docs/reports/QA-pass1.md` / `QA-pass2.md` / `QA-baseline.md` |
| Branch | `feat/{feature-slug}-{NNNN}-short-slug` or `fix/{feature-slug}-{NNNN}-…` |
| PR title | Include `{feature-slug}-{NNNN}` |

**Retest / Iteration:** overwrite the same fixed path. Never create `-prior`, `-v2`, or `-attemptN` siblings — earlier content lives in git history.

**Close:** when the backlog item is **`completed`** or **`closed`**, PM deletes the matching fixed handoff/report files under `docs/handoffs/` and `docs/reports/` (same turn). See [`HANDOFF.md`](../protocols/HANDOFF.md) lifespan.

**Verifier = `ceo`:** no agent QA handoff/report files for that work ID.

**Baseline** (no feature backlog item yet): `HANDOFF-QA-baseline.md` / `QA-baseline.md` — Baseline ID from `docs/reports/README.md` (**Next baseline ID**) goes in the **body** only; date only in file body. PM promotes findings into backlog items (`type: bug` or `task`, **Source:** `qa`).

Blank backlog ID on feature Dev/QA work → **block**.

## Bug / task intake

| Finder | Flow |
|--------|------|
| **CEO** | Chat → PM creates backlog `bug` or `task` (**Source:** `ceo` for bugs) → set **Verifier** / **Verify passes** (CEO may choose `ceo` to self-verify) → priority → kickoff when ready |
| **QA** | Note finding in the QA report → PM promotes to backlog `bug` (**Source:** `qa`, Verifier usually `agent`) → priority → kickoff |

Do **not** create parallel bug files. Dev may notice issues while coding; they tell PM (or fix inside the current work ID) — Dev is not a backlog intake Source.

## PM workflows (summary)

1. **Baseline kickoff** — CEO asks → Pass `baseline` handoff → triage findings into feature backlogs  
2. **CEO reports bug/task** — create item → set Verifier (default `agent`; or `ceo` + defaults `direct-to-main` / `pass2`) → kickoff → Dev; agent QA only if Verifier = `agent`  
3. **Backlog review** — list/prioritize/edit with CEO  
4. **Pick + kickoff** — CEO chooses ID → set `in-progress` → Dev handoff (include Verifier + Verify passes + Ship path)  
5. **Conversation → backlog** — PM proposes/adds items as chats imply; keep statuses current  
6. **CEO Verifier** — after Dev push: one-line ask for CEO to verify; **verified** → `completed`; issues → Iteration on same ID → Dev again  
7. **`agent-os` verified** — CEO says **`verified`** → PM marks `completed` + ships per Ship path (no second ask); delete any handoffs for that ID if present  
8. **Close cleanup** — on `completed` / `closed`, delete that work ID’s `docs/handoffs` + `docs/reports` (git history retains them)  

Full checklists: [`docs/protocols/CEO.md`](../protocols/CEO.md), [`HANDOFF.md`](../protocols/HANDOFF.md).

## Assigning IDs

1. Open the feature backlog file  
2. Use **Next ID** in the header (zero-padded four digits)  
3. Insert the new item **at the top** of the item list (ID descending order)  
4. After adding the item, increment **Next ID**  
