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

- CEO sets goals and priorities
- PM advises (tradeoffs, sequencing, risk), proposes acceptance criteria
- PM does **not** implement large code changes; delegates to Developer
- PM may make small doc/protocol updates directly

## Product Manager → Developer

Use `docs/templates/handoff-dev.md`. Include:
- Goal / user value
- Acceptance criteria (testable)
- Out of scope
- Relevant files / constraints
- Link to FEATURES.md sections

## Product Manager → QA

Use `docs/templates/handoff-qa.md`. Include:
- **Pass:** 1 (pre-merge) or 2 (post-merge)
- Environments: Dev / **Preview URL** / Production (`https://ccvaa-web.vercel.app/`)
- What changed (branch, PR, commit SHA)
- Checklist focus
- Known risks (incl. Preview env vars for admin OTP/mail)

Never ask QA to verify https://ccvaa.ca/ — CEO handles that manually. Never use `ccvaa-web.vercel.app` as a feature Preview URL.

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
