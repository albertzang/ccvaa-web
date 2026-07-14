# CEO responsibilities (human)

The CEO is the decision-maker and the only person who authorizes shipping to `main`, secrets, and public-domain checks. The Product Manager advises and orchestrates agents; **PM does not replace CEO approval gates.**

PM should remind the CEO of the relevant checklist whenever an action is due.

**Product backlog:** [`docs/product/BACKLOG.md`](../product/BACKLOG.md) — work IDs `{feature-slug}-{NNNN}`.  
**Workflow map (index):** [`COMMUNICATION.md`](COMMUNICATION.md) — Intake → Prioritize → Kickoff → Ship → Verify → Close. This file stays **CEO-facing checklists**; do not duplicate the full map here.

### What **`verified`** means (CEO word)

| Context | Completes backlog? | Also authorizes ship? |
|---------|--------------------|------------------------|
| **Verifier = `ceo`** (product) | Yes → PM marks `completed` | **No** — you already approved (or still must approve) push/merge separately |
| **`agent-os-*`** + `direct-to-main` | Yes → PM marks `completed` | **Yes** — PM commit + push `main` same turn |
| **`agent-os-*`** + `feature-branch` (self-evolve or CEO-explicit umbrella) | Yes → PM marks `completed` | **Yes** — PM **merges PR** + deletes branch same turn (after you reviewed commits) |
| You note issues / hold instead | No — Iteration on same ID | No |

Canonical detail: [`COMMUNICATION.md`](COMMUNICATION.md#what-ceo-verified-means).

---

## Always CEO

| Responsibility | Notes |
|----------------|--------|
| Goals & priorities | What to build next; accept/reject PM advice; backlog priorities |
| Choose **Verifier** | `agent` (default) or `ceo` (you verify; bypass agent QA) — see below |
| Approve **Ship path: `direct-to-main`** | Explicit yes required — **or** implied when Verifier = `ceo` and Ship path stays the default `direct-to-main`, or for ordinary **`agent-os-*`** docs (`n/a`, default `direct-to-main`) |
| Approve **kickoff** of Developer / baseline / **self-evolve** | Product kickoff still required; agent **Pass 1/2** after kickoff do **not** need a second CEO “kick off QA” ask (see happy-path checklist) |
| Approve **merge to `main`** (or direct push) | After Pass 1 (agent or your Preview check), approved direct-to-main, **merge milestone** (epic lane), or **self-evolve** PR after commit-history review |
| Approve **process/OS changes** | Multi-agent protocol refinements; for `agent-os-*`, **`verified`** (or explicit merge ask) authorizes PM to mark completed **and ship** per Ship path |
| **Vercel / Hover secrets & env** | e.g. `ADMIN_EMAIL` / `ADMIN_PASS` in local `.env.local`, `VERCEL_AUTOMATION_BYPASS_SECRET`, any future Vercel secrets — never ask agents to store these in git |
| **Admin mailbox for QA** | Keep `.env.local` `ADMIN_EMAIL` / `ADMIN_PASS` current for Hover sign-in (`docs/protocols/QA_AUTH.md`). When **you** are Verifier, you run login yourself |
| **Manual check of https://ccvaa.ca/** | Out of agent Dev/QA flow (DNS/cache) |
| `gh auth login` / GitHub access on this device | One-time (or refresh); needed for agent `gh pr` flows |

## Usually not CEO (agents / PM)

| Work | Who |
|------|-----|
| Implementation, feature branches, PRs | Developer |
| Pass 1 / Pass 2 / baseline testing | QA agent — **unless** backlog **Verifier = `ceo`** (then you verify) |
| Handoffs, FEATURES / feature backlogs, triage | PM |
| **Self-evolve mid-loop OS edits + commits** | **PM** (after you kick off self-evolve — no per-change ask) |
| Delete feature branch after merge | Developer (or PM for `agent-os` self-evolve / feature-branch ship) |

CEO may still skim a PR; deep code review is optional unless PM flags risk.

---

## Checklist: report a bug or task to PM

- [ ] Describe symptom or goal; for bugs: environment (Production / Preview / local), repro
- [ ] Say if you want **Verifier: `ceo`** (you will verify) or leave default **`agent`**
- [ ] PM creates a backlog item in the right feature file and shares the **work ID**
- [ ] Agree **priority** (`now` / `next` / `later`)
- [ ] When Verifier = `ceo`, defaults apply unless you override: **Ship path `direct-to-main`**, **Verify passes `pass2`**
- [ ] When ready: tell PM to **kick off `{feature-slug}-{NNNN}`**

Bugs/tasks live on the feature backlog only (no separate bug files). QA findings are promoted the same way with **Source:** `qa` (Verifier usually stays `agent`).

---

## Checklist: CEO as Verifier (bypass agent QA)

Use when the backlog item has **Verifier: `ceo`**.

### Defaults (unless you override on the item)

| Field | Default |
|-------|---------|
| Ship path | `direct-to-main` |
| Verify passes | `pass2` (Production https://ccvaa-web.vercel.app/) |

You may instead choose **Verify passes `pass1`** (Preview only), **`pass2`**, or **`pass1+pass2`**, and/or **Ship path `feature-branch`**.

### Flow (typical: direct-to-main + pass2)

- [ ] Kick off work ID → Dev implements on `main` → you approve **push** when ready
- [ ] PM one-line ask: verify on https://ccvaa-web.vercel.app/ (and/or Preview if you chose pass1)
- [ ] Smoke the change yourself
- [ ] Reply **`verified`** → PM marks backlog **`completed`** (+ FEATURES.md if needed)
- [ ] **Or** note issues in chat → PM appends an **Iteration** on the **same** backlog item (keep `in-progress`), overwrites Dev handoff, Dev fixes, repeat until you say **`verified`**
- [ ] Optional later: manual check on https://ccvaa.ca/

No agent `HANDOFF-QA-*` / `QA-*` files for this path. Do not mint a new work ID for the same bug/task unless you deliberately split scope.

---

## Checklist: agent-os docs / process (`Verifier = n/a`)

Use for ordinary `agent-os-*` items (protocols, templates, skills — not product code Pass 1/2). **Not** the self-evolve loop — see below.

- [ ] Ship path defaults to **`direct-to-main`** (PM should not leave `tbd`); use `feature-branch` for **self-evolve**, or when you explicitly want an umbrella PR before merge
- [ ] PM implements (on `main` or the feature branch)
- [ ] PM asks you to skim / approve
- [ ] Reply **`verified`** → PM marks **`completed`**, then ships in the same turn:
  - **`direct-to-main`:** commit + push `main`
  - **`feature-branch`:** merge the PR + delete the feature branch
- [ ] **Or** note issues → PM Iterates on the same `agent-os-*` ID until you say **`verified`**

Saying **`verified`** on an `agent-os-*` item is standing authorization to ship that work ID (no separate “please commit/merge” ask).

---

## Checklist: kick off OS self-evolve

Use when you want PM to improve the Agent OS in a bounded loop **without** asking you for each change.

- [ ] Tell PM: **kick off self-evolve** (optional scope hint, e.g. “protocols only”)
- [ ] PM creates a **new** `agent-os-{NNNN}` with Ship path **`feature-branch`**, opens `chore/agent-os-{NNNN}-self-evolve`, and runs the evaluate→improve→**prune**→commit loop (Guiding principle #9)
- [ ] You do **not** need to approve mid-loop commits — kickoff authorized that
- [ ] When PM stops the loop: review the **commit history** on the PR/branch
- [ ] Reply **`verified`** or **merge** → PM merges + deletes branch + marks `completed`
- [ ] **Or** note issues / hold → PM continues on the **same** work ID until you approve

Full flow: [`COMMUNICATION.md`](COMMUNICATION.md#self-evolve-ceo-kickoff-os-improve-loop).

---

## Checklist: baseline kickoff

- [ ] Tell PM: **kick off baseline** (full FEATURES.md or a named subset)
- [ ] No merge step — Production audit only on https://ccvaa-web.vercel.app/
- [ ] After QA report: triage with PM — promote findings into feature backlog items (`task` / `bug`); set priorities (and Verifier if you will self-verify fixes)
- [ ] Ops findings (env/secrets) → you; code findings → kickoff a backlog ID when ready

Handoff/report names: `HANDOFF-QA-baseline.md` / `QA-baseline.md` (date in body only). No feature backlog ID until findings are promoted.

---

## Checklist: backlog review

- [ ] Ask PM to **list** a feature backlog (or all): open items by priority
- [ ] Re-prioritize, set **`closed`**, or add items with PM (incl. Verifier / Verify passes)
- [ ] Pick one work ID to kick off when ready

---

## Checklist: pick backlog item + kickoff

- [ ] Choose a work ID from PM’s list (e.g. `admin-console-0001`)
- [ ] Confirm Verifier (`agent` vs `ceo`) and Verify passes if not already set
- [ ] For **trivial** CSS/copy/proxy tweaks you will self-verify: Verifier `ceo` + defaults is fine; PM may use an **abbreviated** Dev handoff (`HANDOFF.md` tiny-fix path)
- [ ] Tell PM: **kick off `{feature-slug}-{NNNN}`**
- [ ] PM sets status `in-progress`, writes Dev handoff, suggests branch with that ID (when feature-branch)
- [ ] Continue with feature-branch PR happy path **or** CEO Verifier path above

---

## Checklist: feature-branch PR (happy path — Verifier = `agent`)

Use this whenever a PR is open for a kicked-off backlog item with **agent** QA and **Merge gate `item`** (default — merge after this ticket’s Pass 1).

**Standing after kickoff:** Once you kicked off the work ID, PM/Developer may advance **Pass 1** (and after your merge, **Pass 2**) without a separate “kick off QA” ask from you. You still own **merge to `main`** (and secrets / holds).

### 1. PR is open + Preview is ready

- [ ] Optional: confirm PR link / Preview URL / work ID (skim diff only if you want)
- [ ] PM starts QA Pass 1 when Preview is ready (**do not** merge yet) — skip if Verify passes is `pass2` only
- [ ] Hold / intervene only if you want to pause before Pass 1

### 2. After QA Pass 1

| QA sign-off | CEO action |
|-------------|------------|
| **merge** | Tell PM/Developer: **merge the PR** (then branch cleanup; Pass 2 follows if required — no second QA kickoff ask) |
| **hold** / **retest** | Wait; do not merge; PM routes fixes back to Developer |
| **fail** | Do not merge; PM opens fix handoff (same work ID Iteration or new ID as needed) |

### 3. After merge + branch cleanup

- [ ] Production deploy live on https://ccvaa-web.vercel.app/
- [ ] PM starts QA Pass 2 if Verify passes includes `pass2` (no separate kickoff ask unless you held)
- [ ] Optional later: manual check on https://ccvaa.ca/

### 4. After Pass 2

| QA sign-off | CEO action |
|-------------|------------|
| **ship confirmed** | Done — PM marks backlog item `completed` and updates FEATURES.md if needed |
| **hotfix** | Approve next Ship path (`feature-branch` or `direct-to-main`); often Iteration on same ID or a new backlog ID |

---

## Checklist: epic / milestone (Verifier = `agent` + Merge gate `epic`)

Use when PM sets **Epic branch** (e.g. `feat/members`) and **Merge gate `epic`** on a set of tickets. Full rules: [`GIT_DEPLOY.md`](GIT_DEPLOY.md#epic--milestone-ship-lane-opt-in).

**Standing after kickoff:** Pass 1 may run per ticket without a second QA kickoff ask. You still own **merge milestone** (not per-ticket merge).

### 1. Epic PR open + Preview ready (each ticket)

- [ ] Confirm Epic branch / PR / Preview URL / work ID
- [ ] PM starts QA Pass 1 on Preview when ready — **do not** merge to `main` yet

### 2. After each ticket’s Pass 1

| QA sign-off | CEO action |
|-------------|------------|
| **continue epic** (or **pass**) | Do **not** merge; PM kicks next epic ticket on the same branch when ready |
| **hold** / **retest** | Wait; fixes on the same Epic branch |
| **fail** | Do not merge; PM opens Iteration on same work ID (still on Epic branch) |

### 3. When the milestone is ready

- [ ] Optional: short Preview recheck if last Pass 1 is stale
- [ ] Tell PM/Developer: **merge milestone** (list work IDs) → merge PR → delete epic branch
- [ ] PM starts **one** Pass 2 covering the milestone IDs if Verify passes need `pass2`

### 4. After Pass 2

| QA sign-off | CEO action |
|-------------|------------|
| **ship confirmed** | PM marks milestone items `completed` + FEATURES as needed |
| **hotfix** | Iteration / new fix branch from `main` (do not revive deleted epic branch) |

---

## Checklist: ops / secrets (no PR)

When QA/PM report env gaps (e.g. missing Preview bypass, bad mailbox password):

- [ ] Set the variable in **Vercel** and/or local `.env.local` for the right environment
- [ ] Redeploy if required
- [ ] Tell PM to retest (Pass 2, baseline, or CEO Verifier)

Agents cannot securely hold Production mailbox passwords in git.

---

## Checklist: admin login when QA needs full `/admin`

- [ ] Ensure local `.env.local` has working `ADMIN_EMAIL` / `ADMIN_PASS` (Hover mailbox)
- [ ] QA signs into the Mail iframe using those credentials — do **not** paste passwords into chat/docs
- [ ] If login fails → check Hover credentials / mail proxy; do not invent alternate auth flows

---

## What “done” looks like

### Agent Verifier (typical feature-branch)

```
you: pick ID + kick off
     → PM: in-progress + Dev handoff
     → Developer: branch feat/{feature-slug}-{NNNN}-… + PR + Preview
     → PM: QA Pass 1 (no second kickoff ask from you)
     → QA: merge recommended
     → you: approve merge
     → Developer: merge + delete branch
     → PM: QA Pass 2 if required (no second kickoff ask)
     → QA: ship confirmed
     → PM: backlog completed + FEATURES.md
     → you (optional): check ccvaa.ca
```

### Agent Verifier (epic / milestone)

```
you: declare epic (e.g. feat/members) + kick off first ID
     → PM: Epic branch + Merge gate epic on participating tickets
     → Developer: shared epic branch + one PR + Preview
     → per ticket: Pass 1 → continue epic (no merge)
     → you: merge milestone (list IDs)
     → Developer: merge + delete epic branch
     → Pass 2 once for the milestone
     → PM: complete milestone items + FEATURES.md
```

### CEO Verifier (typical direct-to-main + pass2)

```
you: report bug/task + Verifier ceo (or PM sets defaults)
     → PM: backlog item + kickoff + Dev handoff
     → Developer: implement on main
     → you: approve push
     → PM: ask you to verify Production
     → you: "verified"  OR  note issues → Iteration → Dev again
     → PM: completed + FEATURES.md when verified
     → you (optional): check ccvaa.ca
```

### agent-os (Verifier = n/a)

```
you: kick off / approve agent-os scope (+ Ship path)
     → PM: docs/protocol changes (main or feature branch)
     → PM: ask you to verify (repo skim)
     → you: "verified"
     → PM: mark completed + ship same turn
        (direct-to-main → commit+push; feature-branch → merge PR)
```

PM will prompt you at each gate with a one-line ask.
