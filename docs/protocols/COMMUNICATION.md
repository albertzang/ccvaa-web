# Multi-agent communication protocol

## Principle

Agents do **not** share live chat memory. The **repo + CEO** are the bus.

## Who talks to whom

```
CEO  ←→  Product Manager (primary)
              │
              ├─ writes handoff → Developer chat / /developer
              ├─ writes handoff → QA chat / /qa
              └─ updates docs/product/*

Developer  →  feature branch + PR + Preview URL + handoff for QA
QA Pass 1  →  Dev (optional) + Preview → merge recommendation
Developer  →  merge to main when CEO/PM asks
QA Pass 2  →  Production smoke → ship confirmation
QA         →  bug reports / QA reports in docs or GitHub Issues
```

Git/deploy details: `docs/protocols/GIT_DEPLOY.md`.

## CEO ↔ Product Manager

- CEO sets goals and priorities; see **`docs/protocols/CEO.md`** for full CEO checklists
- PM advises (tradeoffs, sequencing, risk), proposes acceptance criteria, and **reminds CEO** when a gate is due (Pass 1 kickoff, merge, Pass 2, secrets, OTP paste)
- PM does **not** implement large code changes; delegates to Developer
- PM does **not** merge to `main` or set Vercel secrets without CEO ask
- PM may make small doc/protocol updates directly (push still when CEO asks)

## Product Manager → Developer

Use `docs/templates/handoff-dev.md`. Include:
- **Ship path:** `feature-branch` (default) or `direct-to-main` (CEO-approved only)
- Goal / user value
- Acceptance criteria (testable)
- Out of scope
- Relevant files / constraints
- Link to FEATURES.md sections

Developer follows Ship path literally. Blank/ambiguous → `feature-branch`. Never invent `direct-to-main`.

## Product Manager → QA

Use `docs/templates/handoff-qa.md`. Include:
- **Pass:** `1` | `2` | `baseline`
- Environments: Dev / **Preview URL** (Pass 1) / Production `https://ccvaa-web.vercel.app/` (Pass 2 and baseline)
- What changed (branch, PR, commit) — or for baseline: scope from FEATURES.md
- Checklist focus
- Known risks (incl. Preview env vars for admin OTP/mail)
- If full admin login is required: note **OTP: single-Send + CEO-in-the-loop** (`docs/protocols/QA_AUTH.md`)

**Baseline:** PM-initiated Production audit with no PR; skip Preview. See `docs/protocols/GIT_DEPLOY.md`.

Never ask QA to verify https://ccvaa.ca/ — CEO handles that manually. Never use `ccvaa-web.vercel.app` as a feature Preview URL. Never put mailbox passwords, OTP codes, or `VERCEL_AUTOMATION_BYPASS_SECRET` in handoffs committed to git.

Preview protection: `docs/protocols/PREVIEW_PROTECTION.md` (bypass from `.env.local`).

## QA → Product Manager / Developer

Use `docs/templates/bug-report.md` or `docs/templates/qa-report.md`.
- File under `docs/qa/reports/` or open a GitHub Issue
- Severity: blocker / high / medium / low
- Always include environment URL + repro steps

## Notifications

There is no automatic agent-to-agent ping. CEO or PM triggers the next role after:
- A feature-branch PR + Preview deploy is ready (→ QA Pass 1), or
- Pass 1 recommends merge and CEO approves (→ Developer merge), or
- Merge to `main` + Production deploy finishes (→ QA Pass 2), or
- A handoff doc is written

## Refinement

PM may propose improvements to this multi-agent setup when friction appears; CEO approves before large process changes.
