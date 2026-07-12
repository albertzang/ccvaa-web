# Backlog: Agent OS

**Feature:** Agent OS  
**Slug:** `agent-os`  
**Owner:** Product Manager  
**Next ID:** `0004`  

Canonical work IDs: `agent-os-NNNN`. Schema: [`../BACKLOG.md`](../BACKLOG.md).

---

## agent-os-0001 — Feature backlog OS (replace ROADMAP)

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `completed` |

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

### Description

Optional CI or scheduled smoke against Preview/Production deploy (beyond current manual agent QA). Scope and tooling TBD with CEO.

---

## agent-os-0003 — Optional long-lived staging branch/domain

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `later` |
| **Status** | `not-started` |

### Description

If Preview-per-PR is not enough, add a long-lived `staging` branch + dedicated domain. Until then Preview = staging (`docs/protocols/GIT_DEPLOY.md`).
