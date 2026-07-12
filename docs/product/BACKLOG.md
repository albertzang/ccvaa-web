# Product backlog (index)

> **Owner:** Product Manager (with CEO).  
> **Shipped behavior** lives in [`FEATURES.md`](FEATURES.md).  
> **Work-to-do** lives in the feature backlog files below.  
> **Bugs** are backlog items (`type: bug`) — no separate `docs/qa/bugs/` files.

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
| **Status** | `not-started` \| `in-progress` \| `canceled` \| `completed` |
| **Source** | **Bugs only:** `ceo` \| `qa` (baseline findings = `qa`; link the baseline QA report) |
| **Description** | Enough for Dev/QA handoffs; bugs include repro / expected / actual |

Copy shape from [`docs/templates/backlog-item.md`](../templates/backlog-item.md).

## Naming (handoffs, branches, reports)

| Artifact | Pattern |
|----------|---------|
| Dev handoff | `docs/qa/handoffs/HANDOFF-DEV-{feature-slug}-{NNNN}.md` |
| QA handoff | `docs/qa/handoffs/HANDOFF-QA-{feature-slug}-{NNNN}-pass1.md` (also `-pass2`) |
| QA report | `docs/qa/reports/QA-{feature-slug}-{NNNN}-pass1.md` |
| Branch | `feat/{feature-slug}-{NNNN}-short-slug` or `fix/{feature-slug}-{NNNN}-…` |
| PR title | Include `{feature-slug}-{NNNN}` |

**Retest:** overwrite the same `…-passN.md` / handoff path. Never create `-prior`, `-v2`, or `-attemptN` siblings — earlier content lives in git history.

**Baseline** (no feature backlog item yet): `HANDOFF-QA-baseline-{NNNN}.md` / `QA-baseline-{NNNN}.md` — IDs from `docs/qa/README.md` (**Next baseline ID**); date only in file body. PM promotes findings into backlog items (`type: bug` or `task`, **Source:** `qa`).

Blank backlog ID on feature Dev/QA work → **block**.

## Bug intake

| Finder | Flow |
|--------|------|
| **CEO** | Chat → PM creates backlog `bug` (**Source:** `ceo`) → priority → kickoff when ready |
| **QA** | Note finding in the QA report → PM promotes to backlog `bug` (**Source:** `qa`) → priority → kickoff |

Do **not** create parallel bug files. Dev may notice issues while coding; they tell PM (or fix inside the current work ID) — Dev is not a backlog intake Source.

## PM workflows (summary)

1. **Baseline kickoff** — CEO asks → Pass `baseline` handoff → triage findings into feature backlogs  
2. **CEO reports bug** — create `type: bug` (**Source:** `ceo`) → kickoff → Dev/QA with work ID  
3. **Backlog review** — list/prioritize/edit with CEO  
4. **Pick + kickoff** — CEO chooses ID → set `in-progress` → Dev handoff  
5. **Conversation → backlog** — PM proposes/adds items as chats imply; keep statuses current  

Full checklists: [`docs/protocols/CEO.md`](../protocols/CEO.md), [`HANDOFF.md`](../protocols/HANDOFF.md).

## Assigning IDs

1. Open the feature backlog file  
2. Use **Next ID** in the header (zero-padded four digits)  
3. After adding the item, increment **Next ID**  
