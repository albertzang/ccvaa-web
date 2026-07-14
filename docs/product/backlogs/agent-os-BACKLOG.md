# Backlog: Agent OS

**Feature:** Agent OS  
**Slug:** `agent-os`  
**Owner:** Product Manager  
**Next ID:** `0012`  

Canonical work IDs: `agent-os-NNNN`. Schema: [`../BACKLOG.md`](../BACKLOG.md).

**Note:** All `agent-os-*` items use **Verifier = `n/a`**, **Verify passes = `n/a`**. Default **Ship path = `direct-to-main`**. Use **`feature-branch`** only when (1) **self-evolve** (required) or (2) CEO explicitly asks for an umbrella PR / commit-history review before merge. Do **not** set `feature-branch` merely because the OS change is large or multi-file — ordinary protocol/skill/doc encoding stays `direct-to-main`.

---

## agent-os-0011 — Long-lived epic branch + milestone merge

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `not-started` |
| **Verifier** | `n/a` |
| **Verify passes** | `n/a` |
| **Ship path** | `direct-to-main` |

### Description

**Problem:** Today every backlog item on Ship path `feature-branch` is expected to merge to `main` after its own Pass 1 (then Pass 2). That fits small ships. Large features (e.g. **Members**) need several tickets on one long-lived branch and only merge when a **milestone** is ready — otherwise `main` gets half-built platforms (DB without UI, stubs, broken public flows).

**Goal:** Upgrade the Agent OS so PM/Dev/QA can run an **epic / milestone** lane:

1. One long-lived branch (e.g. `feat/members` or `feat/{feature-slug}-{milestone}`) for N work IDs
2. Kickoff / Dev / Preview QA per **ticket** still works (Pass 1 against that branch’s Preview)
3. **Merge to `main`** only when PM/CEO declares the **milestone** complete (aggregate Pass 1 / CEO gate) — not after every ticket
4. After milestone merge: delete epic branch; Pass 2 on Production; later tickets start a **new** epic branch (or continue a named follow-on milestone branch cut from latest `main`)
5. Default per-item merge path remains for ordinary tickets; epic/milestone is opt-in and CEO/PM-declared

**Encode in:** `GIT_DEPLOY.md`, `COMMUNICATION.md` (workflow map + lanes), `HANDOFF.md` / gates matrix, `BACKLOG.md` (+ template — e.g. optional **Milestone** / **Epic branch** fields), PM + Dev + QA skills/rules/agents, `CEO.md` merge ask wording. Align with Members kickoff sequencing after this OS lands (or document interim exception if Members starts first).

**Acceptance:**
- [ ] Protocols document both lanes: **per-item merge** (default) vs **epic/milestone merge**
- [ ] Clear rules: when to open epic branch, how work IDs share it, when Pass 1 runs, when merge is allowed, branch cleanup, Pass 2 / fix policy
- [ ] Backlog schema supports declaring Milestone / epic branch (or equivalent) without breaking existing items
- [ ] Handoffs show epic branch + Preview URL + whether this ticket merges or not
- [ ] FEATURES / AGENTS / skills mention the lane; changelog row
- [ ] CEO **verified** → commit + push `main` (Ship path `direct-to-main`)

**Out of scope:** Implementing Members code; inventing a permanent staging env beyond Vercel Preview; changing Verifier defaults for tiny tickets.

### Links

- Motivated by: Members initiate plan (`members-0001`+)
- Touches: `docs/protocols/GIT_DEPLOY.md`, `COMMUNICATION.md`, `HANDOFF.md`, `CEO.md`, `docs/product/BACKLOG.md`

---

## agent-os-0010 — FEATURES changelog descending by date

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `completed` |
| **Verifier** | `n/a` |
| **Verify passes** | `n/a` |
| **Ship path** | `direct-to-main` |

### Description

Make `docs/product/FEATURES.md` changelog **required** descending by date (`YYYY-MM-DD`; same-day newest first; month-only folds after that month’s dated rows). Encode in PM skill / rule / agent. Resort existing changelog table.

**Acceptance:**
- [x] FEATURES Changelog section states the rule as required
- [x] Table sorted date-desc
- [x] PM skill, rule, and agent reference date-desc changelog

### Links

- FEATURES.md: Changelog

---

## agent-os-0009 — Self-evolve run

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `completed` |
| **Verifier** | `n/a` |
| **Verify passes** | `n/a` |
| **Ship path** | `feature-branch` |

### Description

CEO-kickoff **self-evolve** run on `chore/agent-os-0009-self-evolve`. PM evaluates OS vs Guiding principles, implements the most valuable improvements in a loop (no mid-loop CEO approval), then asks CEO to review commit history before merge. CEO **verified** 2026-07-12 → merge PR.

### Overall

- Opened self-evolve run on `chore/agent-os-0009-self-evolve`
- **Principles ↔ self-evolve:** Guiding principle #2 notes bounded CEO-granted autonomy; AGENTS refine line covers ordinary `verified` vs self-evolve merge gate; workflow-map Kickoff row formatting fixed
- **Least process / encode friction:** PM session start notes open `now`/`in-progress`; agent happy path — Pass 1/Pass 2 proceed without separate CEO “kick off QA” asks (merge still CEO)
- **Baseline:** framed as Production QA mode (same env as Pass 2; no feature work ID); FEATURES changelog hygiene rule (~30-row fold)
- **Loop stopped:** further polish judged insignificant; CEO **verified** → merge

---

## agent-os-0008 — Add OS self-evolve workflow

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `completed` |
| **Verifier** | `n/a` |
| **Verify passes** | `n/a` |
| **Ship path** | `direct-to-main` |

### Description

Encode a CEO-kickoff **self-evolve** workflow: PM drives an evaluate→improve→commit loop on a feature branch without per-change CEO approval; CEO reviews commit history and alone authorizes merge. CEO **verified** 2026-07-12 → completed; shipped `direct-to-main`.

**Acceptance:**
- [x] Workflow map lists **Self-evolve** as a common lane
- [x] CEO checklist: kick off + review/merge
- [x] PM skill/agent: loop rules, branch + backlog item per run, no CEO ask mid-loop, stop when no/insignificant improvements
- [x] Clear vs default `agent-os` `direct-to-main` + **`verified`** ship
- [x] FEATURES changelog updated

### Overall

- Encoded **self-evolve** common lane: CEO kickoff → PM creates `agent-os-*` + `chore/agent-os-{NNNN}-self-evolve` → evaluate vs Guiding principles → improve → commit loop (PM decides mid-loop) → stop when no/insignificant improvements → CEO reviews commit history → merge only with CEO **`verified`** / merge approve
- Wired into `COMMUNICATION.md`, `CEO.md` (kickoff checklist), `HANDOFF.md`, gates matrix, `BACKLOG.md`, PM skill/agent, templates

---

## agent-os-0007 — Refine Agent OS (CEO-led)

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `completed` |
| **Verifier** | `n/a` |
| **Verify passes** | `n/a` |
| **Ship path** | `direct-to-main` |

### Description

CEO-led refinement of the multi-agent OS (principles → concrete doc/protocol changes). CEO **verified** 2026-07-12 → completed; shipped `direct-to-main`.

### Overall

- Guiding principles encoded in `AGENTS.md` (repo-as-brain, CEO as decision-maker, thin roles, defaults, same-ID loops, encode friction, least process, observable done)
- **Stale-doc sweep:** removed OTP-era copy from CEO/COMMUNICATION/QA_AUTH/PREVIEW_PROTECTION, handoff-qa template, and Dev/QA/PM rules·agents·skills; left historical backlog + FEATURES changelog rows intact
- **Role chat titles:** `Product Manager` / `Developer` / `QA` (fixed; rename on session start)
- **agent-os Ship path default:** `direct-to-main` (no `tbd`); `feature-branch` only for multi-iteration umbrellas
- **Tiny-fix fast path:** trivial CEO-verified CSS/copy/proxy tweaks may use abbreviated Dev handoff (see `HANDOFF.md`)
- **Workflow map:** canonical index in `COMMUNICATION.md` (Intake → Prioritize → Kickoff → Ship → Verify → Close); CEO.md stays checklists-only
- **`verified` table:** product CEO Verifier completes but does not auto-ship; `agent-os-*` completes and ships same turn
- **Rare paths:** soft-narrowed (`agent`+`direct-to-main`, ceo+feature-branch, partial Verify passes) — CEO must override explicitly
- **Gates matrix:** collapsed ready/done/verified lists in `HANDOFF.md` into one role×gate table

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
