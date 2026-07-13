# Reports & baseline IDs

| Artifact | Filename (fixed) |
|----------|------------------|
| QA report | `docs/reports/QA-pass1.md` / `QA-pass2.md` |
| Baseline report | `docs/reports/QA-baseline.md` |
| Dev handoff | `docs/handoffs/HANDOFF-DEV.md` |
| QA handoff | `docs/handoffs/HANDOFF-QA-pass1.md` / `HANDOFF-QA-pass2.md` |
| Baseline handoff | `docs/handoffs/HANDOFF-QA-baseline.md` |

**Work ID** (`{feature-slug}-{NNNN}`) and **Baseline ID** (`{NNNN}`) live in the **file body**, not the filename.

**Retest:** overwrite the same path. Never create `-prior`, `-v2`, or `-attemptN` files (git history keeps earlier attempts).

**Concurrency:** shared fixed paths — prefer one active feature handoff/report set at a time; a new kickoff overwrites.

**Lifespan:** these files exist only while the matching backlog item is open, or while a baseline is still being triaged. When the item is **`completed`** or **`closed`** (or baseline triage is done), PM **deletes** them. Recover from git history if needed. Canonical shipped behavior lives in `docs/product/FEATURES.md` and the feature backlogs.

**Baseline IDs** are global auto-increment integers (`0001`, `0002`, …), independent of feature backlog IDs. Put Baseline ID and calendar **Date** inside the handoff/report body only.

| | |
|--|--|
| **Next baseline ID** | `0002` |
| **Owner** | Product Manager (assign on kickoff; increment after creating the handoff pair) |

**Bugs** are feature backlog items (`type: bug`, **Source:** `qa` | `ceo`) — see `docs/product/BACKLOG.md`. Do not create a parallel bugs directory. QA lists new findings in the QA report; PM promotes them to the backlog.
