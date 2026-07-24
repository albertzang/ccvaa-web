# Product backlog (index)

> **Owner:** Product Manager (with CEO).  
> **Shipped behavior** lives in [`FEATURES.md`](FEATURES.md) (changelog **descending by date**).  
> **Work-to-do** lives in the feature backlog files below.  
> **Bugs** are backlog items (`type: bug`) — no parallel bugs directory.

## Features

| Feature | Slug | Backlog file |
|---------|------|----------------|
| Public Homepage | `public-homepage` | [`backlogs/public-homepage-BACKLOG.md`](backlogs/public-homepage-BACKLOG.md) |
| Admin Console | `admin-console` | [`backlogs/admin-console-BACKLOG.md`](backlogs/admin-console-BACKLOG.md) |
| Members | `members` | [`backlogs/members-BACKLOG.md`](backlogs/members-BACKLOG.md) |
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
| **Ship path** | Optional on the item; **required** on the Dev handoff when code ships. **`agent-os-*` defaults to `direct-to-main`** |
| **Description** | Enough for Dev (and agent QA if Verifier = `agent`); bugs include repro / expected / actual |

### Verifier defaults

| Verifier | Default Ship path | Default Verify passes | Agent QA? |
|----------|-------------------|------------------------|-----------|
| **`agent`** | `feature-branch` | `pass1+pass2` | Yes — Pass 1 Preview / Pass 2 Production per handoff |
| **`ceo`** | `direct-to-main` | `pass2` | **No** — CEO verifies manually; no `HANDOFF-QA-*` / `QA-*` reports |
| **`n/a`** | **`direct-to-main`** (default for `agent-os-*`) | `n/a` | **No** — used for **`agent-os`** (and other docs/process-only work). CEO reviews via chat / repo skim; say **`verified`** to complete when PM asks. On **`verified`** for `agent-os-*`, PM marks **`completed`** and ships without a further ask: **`direct-to-main`** → commit + push; **`feature-branch`** → merge PR (see [`CEO.md`](../protocols/CEO.md)) |

CEO may override Ship path and Verify passes when Verifier is `agent` or `ceo`. **Verifier = `ceo`** implies CEO owns verification and (for the default Ship path) approves `direct-to-main`. Prefer **common lanes** in [`COMMUNICATION.md`](../protocols/COMMUNICATION.md) (happy path / CEO Verifier / tiny-fix / agent-os / self-evolve / baseline).

**Do not** set Verifier / Verify passes to `agent` or `ceo` on **`agent-os-*`** items — always **`n/a`**. **Ship path for `agent-os-*`:** default **`direct-to-main`**; use **`feature-branch`** only for **self-evolve** (required) or when **CEO explicitly** asks for an umbrella PR / commit-history review before merge. Do not pick `feature-branch` just because an OS docs change is large. Never leave Ship path as `tbd`.

### Rare paths (CEO must override explicitly)

| Combo | Prefer instead |
|-------|----------------|
| `agent` + `direct-to-main` | `agent` + `feature-branch`, or Verifier `ceo` |
| `ceo` + `feature-branch` | OK when CEO wants Preview; not the default |
| Agent Verify passes = `pass1` or `pass2` alone | Default `pass1+pass2` unless CEO scopes an exception |
| Ordinary `agent-os` docs on `feature-branch` | Default `direct-to-main` unless **self-evolve** or CEO asks for umbrella PR |

**Self-evolve:** CEO kickoff → PM creates a new `agent-os-*` + feature branch and loops improve→commit without mid-loop CEO asks; merge only with CEO approval. See [`COMMUNICATION.md`](../protocols/COMMUNICATION.md#self-evolve-ceo-kickoff-os-improve-loop).

**Main-safe increments:** every item merged to `main` must be safe alone — PM splits work; public go-live uses Edge Config (or equivalent). See [`GIT_DEPLOY.md`](../protocols/GIT_DEPLOY.md#main-safe-increments-required).

**CEO Verifier loop** (Verifier = `ceo` only): stay `in-progress` until CEO says **verified** → `completed`. If CEO finds issues, append an **Iteration** on the same backlog item, overwrite the Dev handoff, and kick Dev again — do not invent a new work ID unless scope is deliberately split. **`verified`** on product code does **not** auto-push — see [`COMMUNICATION.md`](../protocols/COMMUNICATION.md). Details: [`CEO.md`](../protocols/CEO.md).

Copy shape from [`docs/templates/backlog-item.md`](../templates/backlog-item.md).

## Item order in feature backlog files

List work items **by ID descending** (highest / newest first). When adding a new item, insert it **immediately after the file header** (above older IDs). Do not sort by priority or status in the file — priority lives in the item fields; PM **list/review** answers can filter/sort in chat.

## Naming (handoffs, branches, reports)

| Artifact | Pattern |
|----------|---------|
| Dev handoff | `docs/handoffs/HANDOFF-DEV.md` (work ID in body) |
| QA handoff | `docs/handoffs/HANDOFF-QA-pass1.md` / `HANDOFF-QA-pass2.md` / `HANDOFF-QA-baseline.md` |
| QA report | `docs/reports/QA-pass1.md` / `QA-pass2.md` / `QA-baseline.md` |
| Branch | `feat/{feature-slug}-{NNNN}-short-slug` or `fix/…` |
| PR title | Include `{feature-slug}-{NNNN}` |

**Retest / Iteration:** overwrite the same fixed path. Never create `-prior`, `-v2`, or `-attemptN` siblings — earlier content lives in git history.

**Close:** when the backlog item is **`completed`** or **`closed`**, PM deletes the matching fixed handoff/report files under `docs/handoffs/` and `docs/reports/` (same turn). See [`HANDOFF.md`](../protocols/HANDOFF.md) lifespan.

**Verifier = `ceo`:** no agent QA handoff/report files for that work ID.

**Baseline** (no feature backlog item yet): `HANDOFF-QA-baseline.md` / `QA-baseline.md` — date only in file body. PM promotes findings into backlog items (`type: bug` or `task`, **Source:** `qa`).

Blank backlog ID on feature Dev/QA work → **block**.

## Bug / task intake

| Finder | Flow |
|--------|------|
| **CEO** | Chat → PM creates backlog `bug` or `task` (**Source:** `ceo` for bugs) → set **Verifier** / **Verify passes** (CEO may choose `ceo` to self-verify) → priority → kickoff when ready |
| **QA** | Note finding in the QA report → PM promotes to backlog `bug` (**Source:** `qa`, Verifier usually `agent`) → priority → kickoff |

Do **not** create parallel bug files. Dev may notice issues while coding; they tell PM (or fix inside the current work ID) — Dev is not a backlog intake Source.

## PM workflows (summary)

Canonical index: **[workflow map](../protocols/COMMUNICATION.md#workflow-map-canonical-index)** (Intake → Prioritize → Kickoff → Ship → Verify → Close).

| Step | Notes |
|------|--------|
| Intake / promote | CEO chat or QA Bugs found → backlog item |
| Prioritize | Backlog review with CEO |
| Kickoff | `in-progress` + Dev handoff (tiny-fix abbrev OK) |
| Ship / Verify | Common lanes + defaults; agent-os `verified` ships |
| Close | `completed` / `closed` → delete handoffs/reports |

CEO checklists: [`CEO.md`](../protocols/CEO.md). Mechanics: [`HANDOFF.md`](../protocols/HANDOFF.md).

## Assigning IDs

1. Open the feature backlog file  
2. Use **Next ID** in the header (zero-padded four digits)  
3. Insert the new item **at the top** of the item list (ID descending order)  
4. After adding the item, increment **Next ID**  
