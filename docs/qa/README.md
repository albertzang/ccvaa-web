# QA reports index

| Artifact | Pattern |
|----------|---------|
| QA report | `docs/qa/reports/QA-{feature-slug}-{NNNN}-passN.md` |
| Baseline report | `docs/qa/reports/QA-baseline-{NNNN}.md` |
| Dev / QA handoffs | `docs/qa/handoffs/HANDOFF-DEV|QA-{feature-slug}-{NNNN}….md` |
| Baseline handoff | `docs/qa/handoffs/HANDOFF-QA-baseline-{NNNN}.md` |

**Retest:** overwrite the same report/handoff path. Never create `-prior`, `-v2`, or `-attemptN` files (git history keeps earlier attempts).

**Baseline IDs** are global auto-increment integers (`0001`, `0002`, …), independent of feature backlog IDs. Put the calendar **Date** inside the handoff/report body — not in the filename — so multiple baselines can run the same day.

| | |
|--|--|
| **Next baseline ID** | `0002` |
| **Owner** | Product Manager (assign on kickoff; increment after creating the handoff pair) |

**Bugs** are feature backlog items (`type: bug`, **Source:** `ceo` | `qa`) — see `docs/product/BACKLOG.md`. Do not create `docs/qa/bugs/` files. QA lists new findings in the QA report; PM promotes them to the backlog.
