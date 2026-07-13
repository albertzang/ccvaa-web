# Backlog: Agent OS

**Feature:** Agent OS  
**Slug:** `agent-os`  
**Owner:** Product Manager  
**Next ID:** `0007`  

Canonical work IDs: `agent-os-NNNN`. Schema: [`../BACKLOG.md`](../BACKLOG.md).

**Note:** All `agent-os-*` items use **Verifier = `n/a`** and **Verify passes = `n/a`** (docs/process — not code Pass 1/2).

---

## agent-os-0006 — Drop baseline IDs

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `completed` |
| **Verifier** | `n/a` |
| **Verify passes** | `n/a` |
| **Ship path** | `direct-to-main` |

### Description

Remove **Baseline ID** / **Next baseline ID** from the OS. Baseline uses the same fixed ephemeral paths as other QA artifacts (`HANDOFF-QA-baseline.md` / `QA-baseline.md`); date in the body is enough. No auto-increment counter.

### Overall

- Dropped Next baseline ID table from `docs/reports/README.md`
- Templates / protocols / skills no longer assign or require Baseline ID

---

## agent-os-0005 — Iterative OS improvements (feature branch)

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `completed` |
| **Verifier** | `n/a` |
| **Verify passes** | `n/a` |
| **Ship path** | `feature-branch` |

### Description

Umbrella for Agent OS doc/process refinements on **`chore/agent-os-0005-iter`**. CEO verified 2026-07-12 → merge PR + delete branch.

### Overall

- **PM chat title:** always exactly `Product Manager` (rename on session start / if it drifts; no work-ID or topic titles; restore after any CEO one-off rename unless CEO says otherwise)
- **Handoff/report lifespan:** delete matching fixed files under `docs/handoffs/` + `docs/reports/` when the backlog item is `completed` / `closed` (or baseline triage closes); strip dead file Links; recover from git history if needed
- **Handoff/report paths:** `docs/handoffs/` + `docs/reports/` with **fixed filenames** (no feature slug / backlog ID in the name; work ID in body only)
- **Status values:** `canceled` → **`closed`**
- **`.env.example`:** Preview bypass + `ADMIN_EMAIL` / `ADMIN_PASS` for QA Hover sign-in (not read by the app)
- **agent-os ship paths:** `direct-to-main` → commit + push on `verified`; `feature-branch` → merge PR on `verified`
- **Backlog file order:** items listed by work ID **descending** (newest first)
- **Housekeeping:** closed obsolete OTP-era items `admin-console-0004` / `0005`

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
