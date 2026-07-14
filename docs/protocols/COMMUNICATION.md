# Multi-agent communication protocol

## Principle

Agents do **not** share live chat memory. The **repo + CEO** are the bus. See guiding principles in [`AGENTS.md`](../../AGENTS.md).

## Workflow map (canonical index)

One pipeline for product work; specialized lanes branch off it. **Mechanics** live in the linked docs — do not retell full checklists here.

```
Intake → Prioritize → Kickoff → Ship → Verify → Close
```

| Stage | What happens | Canonical doc |
|-------|----------------|---------------|
| **Intake** | CEO bug/task / chat goal, or QA **Bugs found** → backlog item (`{feature-slug}-{NNNN}`) | [`BACKLOG.md`](../product/BACKLOG.md), [`CEO.md`](CEO.md) report checklist |
| **Prioritize** | Backlog review: `now` / `next` / `later`, `closed`, Verifier | [`CEO.md`](CEO.md) backlog review |
| **Kickoff** | CEO picks ID → `in-progress` + Dev handoff (or **self-evolve** → new `agent-os-*` + feature branch) | [`BACKLOG.md`](../product/BACKLOG.md), [`HANDOFF.md`](HANDOFF.md), [`CEO.md`](CEO.md) |
| **Ship** | Per **Ship path** + Verifier defaults | [`GIT_DEPLOY.md`](GIT_DEPLOY.md) |
| **Verify** | Agent Pass 1/2, CEO smoke, baseline, or agent-os skim | [`GIT_DEPLOY.md`](GIT_DEPLOY.md), [`HANDOFF.md`](HANDOFF.md#gates-matrix-ready--done--verified), [`CEO.md`](CEO.md) |
| **Close** | `completed` / `closed` → delete handoffs/reports; FEATURES if needed | [`HANDOFF.md`](HANDOFF.md) lifespan |

### Common lanes (use defaults unless CEO overrides)

| Lane | Verifier | Ship path | Verify | When |
|------|----------|-----------|--------|------|
| **Happy path** | `agent` | `feature-branch` | `pass1+pass2` | Normal product/code — **merge after each item’s Pass 1** |
| **Epic / milestone** | `agent` | `feature-branch` + **Epic branch** + **Merge gate `epic`** | `pass1+pass2` (Pass 2 after **milestone** merge) | Large features; merge only when CEO/PM says **merge milestone** — [`GIT_DEPLOY.md`](GIT_DEPLOY.md#epic--milestone-ship-lane-opt-in) |
| **CEO Verifier** | `ceo` | `direct-to-main` | `pass2` | CEO self-verifies; no agent QA |
| **Tiny-fix** | `ceo` | `direct-to-main` | `pass2` | Trivial CSS/copy/proxy; abbreviated handoff |
| **agent-os** | `n/a` | `direct-to-main` | `n/a` | Docs/process; `verified` **ships** |
| **Self-evolve** | `n/a` | **`feature-branch`** (required) | CEO reviews commits | CEO kickoff; PM loops improve→commit; merge only with CEO approval |
| **Baseline** | (no feature ID yet) | — | Production audit | Same env as Pass 2; no PR / no feature work ID — then promote findings |

**Unusual overrides** (CEO must say so explicitly): see [Rare paths](#rare-paths-overrides) below.

### Self-evolve (CEO-kickoff OS improve loop)

CEO-authorized PM autonomy for refining the Agent OS. Kickoff = standing approval for PM to **decide and commit** on the feature branch without per-change CEO yes. **Merge to `main` stays CEO-only.**

```
CEO: kick off self-evolve
  → PM: create new agent-os-{NNNN} (Ship path feature-branch) + branch chore/agent-os-{NNNN}-self-evolve
  → loop until stop:
       1. Evaluate OS vs Guiding principles (AGENTS.md); pick most valuable improvement
          — include spotting leftovers / contradictions vs current state (principle #9)
          — stop if none, or remaining ideas are insignificant
       2. Implement; **prune** stale competing copy in the same change; commit on the feature branch; update backlog Overall
       3. back to 1
  → PM: push branch + open PR; ask CEO to review commit history
  → CEO: approve merge (or note changes) → PM merges + deletes branch + marks completed
```

| Rule | Detail |
|------|--------|
| **Who decides mid-loop** | **PM** — no CEO approval per improvement |
| **Who merges** | **CEO** only (explicit merge ask / **`verified`** on that work ID) |
| **Backlog** | One **new** `agent-os-*` item per run; Verifier/`Verify passes` = `n/a`; Ship path = **`feature-branch`** |
| **Branch** | `chore/agent-os-{NNNN}-self-evolve` (work ID required) |
| **Stop** | No valuable opportunity left, **or** PM judges further changes insignificant |
| **Prune** | Required with each improvement (Guiding principle #9) — living docs must match current state before the next loop |
| **Out of scope** | Product code, secrets, Verifier=`agent`/`ceo` product lanes — docs/process OS only |

Mechanics: [`CEO.md`](CEO.md) self-evolve checklists · [`HANDOFF.md`](HANDOFF.md) · PM skill.

### What CEO **`verified`** means

| Context | Completes backlog? | Also authorizes ship? |
|---------|--------------------|------------------------|
| **Verifier = `ceo`** (product code) | Yes → `completed` | **No** — push/merge already happened (or still needs a separate CEO push/merge ask per Ship path) |
| **`agent-os-*`** + `direct-to-main` | Yes → `completed` | **Yes** — same turn: commit + push `main` |
| **`agent-os-*`** + `feature-branch` (self-evolve or CEO-explicit umbrella) | Yes → `completed` | **Yes** — same turn: **merge PR** + delete branch (after CEO reviewed commit history) |
| Issues / hold instead | No — stay `in-progress` | No — PM Iterates on the **same** work ID (self-evolve: more loop commits, or address CEO notes) |

Full checklists: [`CEO.md`](CEO.md). Definitions: [`HANDOFF.md`](HANDOFF.md).

### Rare paths (overrides)

Prefer the common lanes. These are **allowed only when CEO explicitly overrides** defaults:

| Combo | Why unusual | Prefer instead |
|-------|-------------|----------------|
| Verifier=`agent` + Ship path=`direct-to-main` | Agent QA without a Preview is awkward for pass1 | Keep `feature-branch`, or switch Verifier to `ceo` |
| Verifier=`ceo` + Ship path=`feature-branch` | CEO wants Preview before merge | OK as override; not the default story |
| Verify passes=`pass1` or `pass2` alone (agent) | Skips half the safety net | Default `pass1+pass2`; use alone only for scoped exceptions |
| `agent-os` + `feature-branch` | Extra PR ceremony vs default docs path | Default `direct-to-main` for ordinary OS docs; **required** for **self-evolve**; otherwise only if **CEO asks** for umbrella PR |

Developer still **blocks** inventing `direct-to-main` when Verifier=`agent` without CEO approval on the handoff.

---

## Who talks to whom

```
CEO  ←→  Product Manager (primary)
              │
              ├─ writes handoff → Developer chat / /developer
              ├─ writes handoff → QA chat / /qa   (only if Verifier = agent)
              ├─ asks CEO to verify               (only if Verifier = ceo)
              └─ updates docs/product/* (FEATURES + feature backlogs)
```

**Chat titles (fixed):** `Product Manager` · `Developer` · `QA` — rename on session start; no work-ID/topic titles.

**Work ID:** `{feature-slug}-{NNNN}` in Dev/QA handoff **bodies**, branches, and PRs — see `docs/product/BACKLOG.md`. Handoff/report **filenames** are fixed (no slug/ID).

```
Developer  →  ship per Ship path + Verifier
QA Pass 1  →  (Verifier = agent + pass1) Dev optional + Preview → merge recommendation *(epic Merge gate → continue epic)*
CEO verify →  (Verifier = ceo) Preview and/or Production per Verify passes
Developer  →  merge / push when CEO/PM asks
QA Pass 2  →  (Verifier = agent + pass2) Production smoke → ship confirmation
QA         →  QA reports in docs (Bugs found → PM backlog triage)
CEO        →  "verified" or Iteration notes (Verifier = ceo / agent-os)
PM         →  backlog status + FEATURES.md after ship / triage
```

Git/deploy: [`GIT_DEPLOY.md`](GIT_DEPLOY.md). Handoff mechanics: [`HANDOFF.md`](HANDOFF.md). CEO checklists: [`CEO.md`](CEO.md).

## CEO ↔ Product Manager

- CEO sets goals and priorities; see **`docs/protocols/CEO.md`** for CEO-facing checklists (do not duplicate the [workflow map](#workflow-map-canonical-index) there)
- PM maintains **feature backlogs** (`docs/product/BACKLOG.md`); converts conversations into proposed backlog items; lists/reviews on CEO ask
- PM sets **Verifier** / **Verify passes** / Ship path from CEO intent (prefer [common lanes](#common-lanes-use-defaults-unless-ceo-overrides))
- PM advises (tradeoffs, sequencing, risk), proposes acceptance criteria, and **reminds CEO** when a gate is due
- PM does **not** implement large code changes; delegates to Developer
- PM does **not** merge to `main` or set Vercel secrets without CEO ask
- PM may make small doc/protocol updates directly (push still when CEO asks — except `agent-os-*` after **`verified`**)

## Product Manager → Developer

Use `docs/templates/handoff-dev.md`. Save as `docs/handoffs/HANDOFF-DEV.md` (overwrite on Iterations). Include:
- **Backlog work ID** (required) — blank → Developer **blocks**
- **Verifier:** `agent` | `ceo` | `n/a`
- **Verify passes:** `pass1+pass2` | `pass1` | `pass2` | `n/a`
- **Ship path:** `feature-branch` | `direct-to-main` (apply Verifier defaults if blank)
- **Epic branch** / **Merge gate** (optional — epic/milestone lane)
- Goal / user value (from backlog description); Iteration delta if rework
- Acceptance criteria (testable)
- Out of scope
- Relevant files / constraints
- Link to FEATURES.md sections + backlog item

**Tiny-fix:** when Verifier = `ceo` + `direct-to-main` + trivial CSS/copy/proxy scope, abbreviated handoff is enough (work ID + Verifier/Ship path + Acceptance) — see `HANDOFF.md`.

Developer follows Verifier + Ship path literally. Never invent `direct-to-main` when Verifier = `agent` without CEO approval. When Verifier = `ceo`, do **not** create agent QA handoffs.

## Product Manager → QA

**Only when Verifier = `agent`.** Use `docs/templates/handoff-qa.md`. Save as `docs/handoffs/HANDOFF-QA-pass1.md` (or `HANDOFF-QA-pass2.md`). Include:
- **Backlog work ID** (required for Pass 1/2 feature work)
- **Pass:** `1` | `2` | `baseline`
- **Merge gate** / **Epic branch** when epic lane (Pass 1 → **continue epic** instead of merge)
- Environments: Dev / **Preview URL** (Pass 1) / Production `https://ccvaa-web.vercel.app/` (Pass 2 and baseline)
- What changed (branch, PR, commit) — or for baseline: scope from FEATURES.md
- Checklist focus
- Known risks (incl. Preview Deployment Protection bypass; mail proxy quirks)
- If full admin login is required: note mailbox sign-in via `.env.local` `ADMIN_EMAIL` / `ADMIN_PASS` (`docs/protocols/QA_AUTH.md`)

**Baseline:** CEO/PM-initiated Production audit with no PR; skip Preview; filename `docs/handoffs/HANDOFF-QA-baseline.md` (date in body only). See `docs/protocols/GIT_DEPLOY.md`.

Never ask QA to verify https://ccvaa.ca/ — CEO handles that manually. Never use `ccvaa-web.vercel.app` as a feature Preview URL. Never put mailbox passwords or `VERCEL_AUTOMATION_BYPASS_SECRET` in handoffs committed to git.

Preview protection: `docs/protocols/PREVIEW_PROTECTION.md` (bypass from `.env.local`).

## Product Manager → CEO (Verifier = `ceo`)

After Dev ships to the env(s) in Verify passes, PM sends a **one-line ask** (e.g. verify Production for `{work-id}`).  
CEO replies **`verified`** or notes issues → Iteration on the same backlog ID. No agent QA files. See [What CEO `verified` means](#what-ceo-verified-means).

## QA → Product Manager / Developer

Use `docs/templates/qa-report.md`.
- Reports: `docs/reports/QA-pass1.md` / `QA-pass2.md` / `QA-baseline.md` (feature work ID in body when applicable)
- New defects: list under **Bugs found** in the QA report (repro + severity); **PM** promotes to backlog `type: bug` (**Source:** `qa`)
- Always include environment URL + repro steps
- Do **not** create a parallel bugs directory
- Do **not** invent work for items with Verifier = `ceo` (those never get agent QA handoffs)
- Handoffs/reports are ephemeral: PM deletes them when the backlog item is **`completed`** / **`closed`** (or baseline triage closes) — see `HANDOFF.md`

## Notifications

There is no automatic agent-to-agent ping. CEO or PM triggers the next role when blocked — except on the **agent happy path** after kickoff: PM/Dev may start Pass 1 when Preview is ready, and Pass 2 after merge, without a separate CEO “kick off QA” ask (CEO still owns merge / hold / secrets). See [`CEO.md`](CEO.md) feature-branch checklist.

Typical triggers: kickoff, Preview ready → Pass 1, Pass 1 merge ask (or **continue epic** / **merge milestone**), Production ready → Pass 2, `verified`, baseline triage, handoff written, self-evolve commit-history review.

## Refinement

PM may propose improvements to this multi-agent setup when friction appears; CEO approves before large process changes (`agent-os-*`).
