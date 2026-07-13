# Multi-agent communication protocol

## Principle

Agents do **not** share live chat memory. The **repo + CEO** are the bus.

## Who talks to whom

```
CEO  ←→  Product Manager (primary)
              │
              ├─ writes handoff → Developer chat / /developer
              ├─ writes handoff → QA chat / /qa   (only if Verifier = agent)
              ├─ asks CEO to verify               (only if Verifier = ceo)
              └─ updates docs/product/* (FEATURES + feature backlogs)
```

**Work ID:** `{feature-slug}-{NNNN}` in Dev/QA handoff **bodies**, branches, and PRs — see `docs/product/BACKLOG.md`. Handoff/report **filenames** are fixed (no slug/ID).

```
Developer  →  ship per Ship path + Verifier
QA Pass 1  →  (Verifier = agent + pass1) Dev optional + Preview → merge recommendation
CEO verify →  (Verifier = ceo) Preview and/or Production per Verify passes
Developer  →  merge / push when CEO/PM asks
QA Pass 2  →  (Verifier = agent + pass2) Production smoke → ship confirmation
QA         →  QA reports in docs (Bugs found → PM backlog triage)
CEO        →  "verified" or Iteration notes (Verifier = ceo)
PM         →  backlog status + FEATURES.md after ship / triage
```

Git/deploy details: `docs/protocols/GIT_DEPLOY.md`. Backlog workflows: `docs/protocols/HANDOFF.md`, `CEO.md`.

## CEO ↔ Product Manager

- CEO sets goals and priorities; see **`docs/protocols/CEO.md`** for full CEO checklists (baseline, bug/task report, CEO Verifier, backlog review, kickoff, PR gates)
- PM maintains **feature backlogs** (`docs/product/BACKLOG.md`); converts conversations into proposed backlog items; lists/reviews on CEO ask
- PM sets **Verifier** / **Verify passes** / Ship path from CEO intent (`ceo` defaults: `direct-to-main` + `pass2`)
- PM advises (tradeoffs, sequencing, risk), proposes acceptance criteria, and **reminds CEO** when a gate is due
- PM does **not** implement large code changes; delegates to Developer
- PM does **not** merge to `main` or set Vercel secrets without CEO ask
- PM may make small doc/protocol updates directly (push still when CEO asks)

## Product Manager → Developer

Use `docs/templates/handoff-dev.md`. Save as `docs/handoffs/HANDOFF-DEV.md` (overwrite on Iterations). Include:
- **Backlog work ID** (required) — blank → Developer **blocks**
- **Verifier:** `agent` | `ceo`
- **Verify passes:** `pass1+pass2` | `pass1` | `pass2`
- **Ship path:** `feature-branch` | `direct-to-main` (apply Verifier defaults if blank)
- Goal / user value (from backlog description); Iteration delta if rework
- Acceptance criteria (testable)
- Out of scope
- Relevant files / constraints
- Link to FEATURES.md sections + backlog item

Developer follows Verifier + Ship path literally. Never invent `direct-to-main` when Verifier = `agent` without CEO approval. When Verifier = `ceo`, do **not** create agent QA handoffs.

## Product Manager → QA

**Only when Verifier = `agent`.** Use `docs/templates/handoff-qa.md`. Save as `docs/handoffs/HANDOFF-QA-pass1.md` (or `HANDOFF-QA-pass2.md`). Include:
- **Backlog work ID** (required for Pass 1/2 feature work)
- **Pass:** `1` | `2` | `baseline`
- Environments: Dev / **Preview URL** (Pass 1) / Production `https://ccvaa-web.vercel.app/` (Pass 2 and baseline)
- What changed (branch, PR, commit) — or for baseline: scope from FEATURES.md
- Checklist focus
- Known risks (incl. Preview env vars for admin OTP/mail)
- If full admin login is required: note **OTP: single-Send + CEO-in-the-loop** (`docs/protocols/QA_AUTH.md`)

**Baseline:** CEO/PM-initiated Production audit with no PR; skip Preview; filename `docs/handoffs/HANDOFF-QA-baseline.md` (Baseline ID from `docs/reports/README.md` **Next baseline ID**; date in body only). See `docs/protocols/GIT_DEPLOY.md`.

Never ask QA to verify https://ccvaa.ca/ — CEO handles that manually. Never use `ccvaa-web.vercel.app` as a feature Preview URL. Never put mailbox passwords, OTP codes, or `VERCEL_AUTOMATION_BYPASS_SECRET` in handoffs committed to git.

Preview protection: `docs/protocols/PREVIEW_PROTECTION.md` (bypass from `.env.local`).

## Product Manager → CEO (Verifier = `ceo`)

After Dev ships to the env(s) in Verify passes, PM sends a **one-line ask** (e.g. verify Production for `{work-id}`).  
CEO replies **`verified`** or notes issues → Iteration on the same backlog ID. No agent QA files.

## QA → Product Manager / Developer

Use `docs/templates/qa-report.md`.
- Reports: `docs/reports/QA-pass1.md` / `QA-pass2.md` / `QA-baseline.md` (work ID / Baseline ID in body)
- New defects: list under **Bugs found** in the QA report (repro + severity); **PM** promotes to backlog `type: bug` (**Source:** `qa`)
- Always include environment URL + repro steps
- Do **not** create a parallel bugs directory
- Do **not** invent work for items with Verifier = `ceo` (those never get agent QA handoffs)
- Handoffs/reports are ephemeral: PM deletes them when the backlog item is **`completed`** / **`canceled`** (or baseline triage closes) — see `HANDOFF.md`

## Notifications

There is no automatic agent-to-agent ping. CEO or PM triggers the next role after:
- CEO picks a backlog ID to kick off (→ Dev handoff), or
- A feature-branch PR + Preview deploy is ready (→ QA Pass 1 **or** CEO Preview verify), or
- Pass 1 / CEO Preview check recommends merge and CEO approves (→ Developer merge), or
- Merge / direct push + Production deploy finishes (→ QA Pass 2 **or** CEO Production verify), or
- CEO says **verified** or notes Iteration issues, or
- Baseline or bug triage needs backlog updates, or
- A handoff doc is written

## Refinement

PM may propose improvements to this multi-agent setup when friction appears; CEO approves before large process changes.
