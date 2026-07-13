# Backlog: Agent OS

**Feature:** Agent OS  
**Slug:** `agent-os`  
**Owner:** Product Manager  
**Next ID:** `0006`  

Canonical work IDs: `agent-os-NNNN`. Schema: [`../BACKLOG.md`](../BACKLOG.md).

**Note:** All `agent-os-*` items use **Verifier = `n/a`** and **Verify passes = `n/a`** (docs/process — not code Pass 1/2).

---

## agent-os-0005 — Iterative OS improvements (feature branch)

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `in-progress` |
| **Verifier** | `n/a` |
| **Verify passes** | `n/a` |
| **Ship path** | `feature-branch` |

### Description

Umbrella for Agent OS doc/process refinements shipped on a feature branch with Iterations until CEO says **`verified`**, then merge the PR (not push each iteration to `main`).

**Branch:** `chore/agent-os-0005-iter`  
**On `verified`:** mark `completed` → merge PR → delete feature branch (local + remote). Standing commit+push-to-`main` from `agent-os-0004` applies only when Ship path is `direct-to-main`.

### Iteration 1 — PM must not rename the chat

Product Manager must **not** rename the Cursor chat (no `rename_chat` / equivalent) on their own initiative. Leave the title alone for the whole session, including after topic changes or backlog kickoffs.

**Exception:** CEO may explicitly ask PM to rename the chat.

---

## agent-os-0004 — CEO as optional Verifier (bypass agent QA)

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `completed` |
| **Verifier** | `n/a` |
| **Verify passes** | `n/a` |
| **Ship path** | `direct-to-main` |

### Description

Allow **product** backlog items (`public-homepage`, `admin-console`, …) to set **Verifier:** `agent` \| `ceo` and **Verify passes:** `pass1+pass2` \| `pass1` \| `pass2`. When Verifier = `ceo`, skip agent QA; CEO verifies manually. Defaults for Verifier = `ceo`: Ship path `direct-to-main`, Verify passes `pass2`. Same work ID stays `in-progress` until CEO says **verified**; issues → Iteration on the item + Dev handoff overwrite.

**`agent-os` itself** keeps Verifier / Verify passes as **`n/a`** (docs/protocol/templates only).

CEO verified 2026-07-11.

### Iteration 2 — agent-os verified ⇒ ship

On CEO **`verified`** for any `agent-os-*` item, PM marks `completed` and ships in the same turn (no second ask). Default Ship path was `direct-to-main` (commit + push). **`agent-os-0005`** adds `feature-branch` (merge PR). Encoded in `CEO.md`, `HANDOFF.md`, `BACKLOG.md`, PM skill.
---

## agent-os-0001 — Feature backlog OS (replace ROADMAP)

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `completed` |
| **Verifier** | `n/a` |
| **Verify passes** | `n/a` |
| **Ship path** | `direct-to-main` |

### Description

Replace flat `ROADMAP.md` with feature backlogs (`public-homepage`, `admin-console`, `agent-os`), work IDs `{feature-slug}-{NNNN}`, and PM workflows (baseline, bug report, review, kickoff, conversation→backlog). Docs/protocol only.

### Links

- [`../BACKLOG.md`](../BACKLOG.md)

---

## agent-os-0002 — Automated QA smoke on Preview/Production

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `later` |
| **Status** | `not-started` |
| **Verifier** | `n/a` |
| **Verify passes** | `n/a` |
| **Ship path** | `tbd` |

### Description

Optional CI or scheduled smoke against Preview/Production deploy (beyond current manual agent QA). Scope and tooling TBD with CEO. Remains under `agent-os` until kickoff; if it becomes product code, PM may split or re-home — Verifier fields stay `n/a` while the ID is `agent-os-*`.

---

## agent-os-0003 — Optional long-lived staging branch/domain

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `later` |
| **Status** | `not-started` |
| **Verifier** | `n/a` |
| **Verify passes** | `n/a` |
| **Ship path** | `tbd` |

### Description

If Preview-per-PR is not enough, add a long-lived `staging` branch + dedicated domain. Until then Preview = staging (`docs/protocols/GIT_DEPLOY.md`).
