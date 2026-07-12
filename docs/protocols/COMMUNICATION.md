# Multi-agent communication protocol

## Principle

Agents do **not** share live chat memory. The **repo + CEO** are the bus.

## Who talks to whom

```
CEO  ←→  Product Manager (primary)
              │
              ├─ writes handoff → Developer chat / /developer
              ├─ writes handoff → QA chat / /qa
              └─ updates docs/product/* (FEATURES + feature backlogs)
```

**Work ID:** `{feature-slug}-{NNNN}` on Dev/QA handoffs, branches, PRs, reports — see `docs/product/BACKLOG.md`.

```
Developer  →  feature branch + PR + Preview URL + handoff for QA (named with work ID)
QA Pass 1  →  Dev (optional) + Preview → merge recommendation
Developer  →  merge to main when CEO/PM asks
QA Pass 2  →  Production smoke → ship confirmation
QA         →  QA reports in docs (Bugs found → PM backlog triage)
PM         →  backlog status + FEATURES.md after ship / triage
```

Git/deploy details: `docs/protocols/GIT_DEPLOY.md`. Backlog workflows: `docs/protocols/HANDOFF.md`, `CEO.md`.

## CEO ↔ Product Manager

- CEO sets goals and priorities; see **`docs/protocols/CEO.md`** for full CEO checklists (baseline, bug report, backlog review, kickoff, PR gates)
- PM maintains **feature backlogs** (`docs/product/BACKLOG.md`); converts conversations into proposed backlog items; lists/reviews on CEO ask
- PM advises (tradeoffs, sequencing, risk), proposes acceptance criteria, and **reminds CEO** when a gate is due
- PM does **not** implement large code changes; delegates to Developer
- PM does **not** merge to `main` or set Vercel secrets without CEO ask
- PM may make small doc/protocol updates directly (push still when CEO asks)

## Product Manager → Developer

Use `docs/templates/handoff-dev.md`. Save as `HANDOFF-DEV-{feature-slug}-{NNNN}.md`. Include:
- **Backlog work ID** (required) — blank → Developer **blocks**
- **Ship path:** `feature-branch` (default) or `direct-to-main` (CEO-approved only)
- Goal / user value (from backlog description)
- Acceptance criteria (testable)
- Out of scope
- Relevant files / constraints
- Link to FEATURES.md sections + backlog item

Developer follows Ship path literally. Blank/ambiguous Ship path → `feature-branch`. Never invent `direct-to-main`.

## Product Manager → QA

Use `docs/templates/handoff-qa.md`. Save as `HANDOFF-QA-{feature-slug}-{NNNN}-pass1.md` (or `-pass2`). Include:
- **Backlog work ID** (required for Pass 1/2 feature work)
- **Pass:** `1` | `2` | `baseline`
- Environments: Dev / **Preview URL** (Pass 1) / Production `https://ccvaa-web.vercel.app/` (Pass 2 and baseline)
- What changed (branch, PR, commit) — or for baseline: scope from FEATURES.md
- Checklist focus
- Known risks (incl. Preview env vars for admin OTP/mail)
- If full admin login is required: note **OTP: single-Send + CEO-in-the-loop** (`docs/protocols/QA_AUTH.md`)

**Baseline:** CEO/PM-initiated Production audit with no PR; skip Preview; filename `HANDOFF-QA-baseline-{NNNN}.md` (Next ID in `docs/qa/README.md`; date in body only). See `docs/protocols/GIT_DEPLOY.md`.

Never ask QA to verify https://ccvaa.ca/ — CEO handles that manually. Never use `ccvaa-web.vercel.app` as a feature Preview URL. Never put mailbox passwords, OTP codes, or `VERCEL_AUTOMATION_BYPASS_SECRET` in handoffs committed to git.

Preview protection: `docs/protocols/PREVIEW_PROTECTION.md` (bypass from `.env.local`).

## QA → Product Manager / Developer

Use `docs/templates/qa-report.md`.
- Reports: `docs/qa/reports/QA-{feature-slug}-{NNNN}-passN.md` (or `QA-baseline-{NNNN}.md`)
- New defects: list under **Bugs found** in the QA report (repro + severity); **PM** promotes to backlog `type: bug` (**Source:** `qa`)
- Always include environment URL + repro steps
- Do **not** create files under `docs/qa/bugs/`

## Notifications

There is no automatic agent-to-agent ping. CEO or PM triggers the next role after:
- CEO picks a backlog ID to kick off (→ Dev handoff), or
- A feature-branch PR + Preview deploy is ready (→ QA Pass 1), or
- Pass 1 recommends merge and CEO approves (→ Developer merge), or
- Merge to `main` + Production deploy finishes (→ QA Pass 2), or
- Baseline or bug triage needs backlog updates, or
- A handoff doc is written

## Refinement

PM may propose improvements to this multi-agent setup when friction appears; CEO approves before large process changes.
