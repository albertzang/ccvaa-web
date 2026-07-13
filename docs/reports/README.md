# Reports & baseline IDs

| Artifact | Pattern |
|----------|---------|
| QA report | `docs/reports/QA-{feature-slug}-{NNNN}-passN.md` |
| Baseline report | `docs/reports/QA-baseline-{NNNN}.md` |
| Dev / QA handoffs | `docs/handoffs/HANDOFF-DEV|QA-{feature-slug}-{NNNN}….md` |
| Baseline handoff | `docs/handoffs/HANDOFF-QA-baseline-{NNNN}.md` |

**Retest:** overwrite the same report/handoff path. Never create `-prior`, `-v2`, or `-attemptN` files (git history keeps earlier attempts).

**Lifespan:** these files exist only while the matching backlog item is open (`not-started` / `in-progress`), or while a baseline is still being triaged. When the item is **`completed`** or **`canceled`** (or baseline triage is done), PM **deletes** the matching handoff(s) and report(s). Recover from git history if needed. Canonical shipped behavior lives in `docs/product/FEATURES.md` and the feature backlogs.

**Baseline IDs** are global auto-increment integers (`0001`, `0002`, …), independent of feature backlog IDs. Put the calendar **Date** inside the handoff/report body — not in the filename — so multiple baselines can run the same day.

| | |
|--|--|
| **Next baseline ID** | `0002` |
| **Owner** | Product Manager (assign on kickoff; increment after creating the handoff pair) |

**Bugs** are feature backlog items (`type: bug`, **Source:** `qa` | `ceo`) — see `docs/product/BACKLOG.md`. Do not create a parallel bugs directory. QA lists new findings in the QA report; PM promotes them to the backlog.
