# Backlog item (copy into a feature backlog file)

**Place in file:** Insert new items at the **top** of the feature backlog (ID descending — newest first). See `docs/product/BACKLOG.md`.

**ID:** `{feature-slug}-{NNNN}` (e.g. `admin-console-0001`)  
**Title:**  
**Type:** `task` | `bug`  
**Priority:** `now` | `next` | `later`  
**Status:** `not-started` | `in-progress` | `completed` | `closed`  
**Source:** _(bugs only)_ `ceo` | `qa`  
**Verifier:** `agent` (default) | `ceo` | `n/a`  
**Verify passes:** `pass1+pass2` | `pass1` | `pass2` | `n/a`  
**Ship path:** `feature-branch` | `direct-to-main` _(optional on the item; required on Dev handoff when code ships)_  
**Epic branch:** _(optional)_ e.g. `feat/members` — epic/milestone lane  
**Merge gate:** `item` (default) | `epic` _(optional; required `epic` when sharing an Epic branch mid-milestone)_  

### Defaults

| Verifier | Default Ship path | Default Verify passes |
|----------|-------------------|------------------------|
| `agent` | `feature-branch` | `pass1+pass2` |
| `ceo` | `direct-to-main` | `pass2` |
| `n/a` | `direct-to-main` (default for `agent-os-*`) | `n/a` |

**`agent-os-*` items:** always **Verifier = `n/a`** and **Verify passes = `n/a`** (docs/process OS work — not Pass 1/2). Default Ship path **`direct-to-main`**; set `feature-branch` only for **self-evolve** (required) or when CEO asks for an umbrella PR. Never leave Ship path `tbd`. Other product features use `agent` or `ceo`.

**Epic / milestone:** see [`GIT_DEPLOY.md`](../protocols/GIT_DEPLOY.md#epic--milestone-ship-lane-opt-in). Default Merge gate is **`item`** (per-ticket merge after Pass 1).

CEO may override Ship path / Verify passes when Verifier is `agent` or `ceo` — prefer [common lanes](../protocols/COMMUNICATION.md#common-lanes-use-defaults-unless-ceo-overrides); mark [rare paths](../protocols/COMMUNICATION.md#rare-paths-overrides) only with explicit CEO intent. **Verifier = `ceo`** means no agent QA; CEO verifies manually (`docs/protocols/CEO.md`). What **`verified`** means: [`COMMUNICATION.md`](../protocols/COMMUNICATION.md#what-ceo-verified-means). **Self-evolve:** [`COMMUNICATION.md`](../protocols/COMMUNICATION.md#self-evolve-ceo-kickoff-os-improve-loop).

## Description

Enough detail for Dev (and agent QA if Verifier = `agent`) handoffs: problem/goal, acceptance hints, out of scope, related FEATURES.md section.

For **`type: bug`**, include in Description (or subsections):

- Summary  
- Environment (Dev / Preview URL / Production)  
- Steps to reproduce  
- Expected vs actual  
- Severity: blocker | high | medium | low  

## Iterations (Verifier = `ceo`, or any rework on the same ID)

Keep **Status:** `in-progress` until CEO says **verified** (or agent Pass 2 ship confirmed). If CEO finds issues after a Dev push:

1. Append an **Iteration N** subsection here (what failed, what to change)
2. Overwrite `docs/handoffs/HANDOFF-DEV.md` for the next Dev pass
3. Repeat until CEO says **verified** → Status `completed`

Do **not** mint a new work ID for the same bug/task unless CEO/PM explicitly splits scope.

## Links (optional)

- QA report (pass that found or verified it) — agent Verifier only:
- Dev handoff:
- PR:
