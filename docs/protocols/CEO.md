# CEO responsibilities (human)

The CEO is the decision-maker and the only person who authorizes shipping to `main`, secrets, and public-domain checks. The Product Manager advises and orchestrates agents; **PM does not replace CEO approval gates.**

PM should remind the CEO of the relevant checklist whenever an action is due.

**Product backlog:** [`docs/product/BACKLOG.md`](../product/BACKLOG.md) — work IDs `{feature-slug}-{NNNN}`.

## Always CEO

| Responsibility | Notes |
|----------------|--------|
| Goals & priorities | What to build next; accept/reject PM advice; backlog priorities |
| Choose **Verifier** | `agent` (default) or `ceo` (you verify; bypass agent QA) — see below |
| Approve **Ship path: `direct-to-main`** | Explicit yes required — **or** implied when Verifier = `ceo` and Ship path stays the default `direct-to-main`, or for typical `agent-os` docs (`n/a`) |
| Approve **kickoff** of Developer / QA / baseline | Until further automation is approved |
| Approve **merge to `main`** (or direct push) | After Pass 1 (agent or your Preview check), or for approved direct-to-main |
| Approve **process/OS changes** | Multi-agent protocol refinements; for `agent-os-*`, **`verified`** authorizes PM to mark completed **and ship** (`direct-to-main` → commit + push; `feature-branch` → merge PR) |
| **Vercel / Hover secrets & env** | e.g. `SMTP_PASS`, SMTP_*, `ADMIN_SESSION_SECRET`, `KV_REST_API_*` — never ask agents to store these in git |
| **OTP readout** | **Single-Send** only: QA Sends once → you paste newest code → QA verifies once (`docs/protocols/QA_AUTH.md`). Do not Send yourself on the same env during the attempt. When **you** are Verifier, you run login yourself (no agent OTP loop) |
| **Manual check of https://ccvaa.ca/** | Out of agent Dev/QA flow (DNS/cache) |
| `gh auth login` / GitHub access on this device | One-time (or refresh); needed for agent `gh pr` flows |

## Usually not CEO (agents / PM)

| Work | Who |
|------|-----|
| Implementation, feature branches, PRs | Developer |
| Pass 1 / Pass 2 / baseline testing | QA agent — **unless** backlog **Verifier = `ceo`** (then you verify) |
| Handoffs, FEATURES / feature backlogs, triage | PM |
| Delete feature branch after merge | Developer |

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

Use for `agent-os-*` items (protocols, templates, skills — not product code Pass 1/2).

- [ ] Confirm **Ship path** with PM: usually `direct-to-main`; use `feature-branch` for multi-iteration OS work
- [ ] PM implements (on `main` or the feature branch)
- [ ] PM asks you to skim / approve
- [ ] Reply **`verified`** → PM marks **`completed`**, then ships in the same turn:
  - **`direct-to-main`:** commit + push `main`
  - **`feature-branch`:** merge the PR + delete the feature branch
- [ ] **Or** note issues → PM Iterates on the same `agent-os-*` ID until you say **`verified`**

Saying **`verified`** on an `agent-os-*` item is standing authorization to ship that work ID (no separate “please commit/merge” ask).

---

## Checklist: baseline kickoff

- [ ] Tell PM: **kick off baseline** (full FEATURES.md or a named subset)
- [ ] No merge step — Production audit only on https://ccvaa-web.vercel.app/
- [ ] After QA report: triage with PM — promote findings into feature backlog items (`task` / `bug`); set priorities (and Verifier if you will self-verify fixes)
- [ ] Ops findings (env/secrets) → you; code findings → kickoff a backlog ID when ready

Handoff/report names: `HANDOFF-QA-baseline.md` / `QA-baseline.md` (Baseline ID + date in body only). No feature backlog ID until findings are promoted.

---

## Checklist: backlog review

- [ ] Ask PM to **list** a feature backlog (or all): open items by priority
- [ ] Re-prioritize, cancel, or add items with PM (incl. Verifier / Verify passes)
- [ ] Pick one work ID to kick off when ready

---

## Checklist: pick backlog item + kickoff

- [ ] Choose a work ID from PM’s list (e.g. `admin-console-0001`)
- [ ] Confirm Verifier (`agent` vs `ceo`) and Verify passes if not already set
- [ ] Tell PM: **kick off `{feature-slug}-{NNNN}`**
- [ ] PM sets status `in-progress`, writes Dev handoff, suggests branch with that ID
- [ ] Continue with feature-branch PR happy path **or** CEO Verifier path above

---

## Checklist: feature-branch PR (happy path — Verifier = `agent`)

Use this whenever a PR is open for a kicked-off backlog item with **agent** QA.

### 1. PR is open + Preview is ready

- [ ] Confirm PR link, Preview URL, and backlog work ID on the handoff
- [ ] Optional: skim the diff for intent (not required for every change)
- [ ] Tell PM: **kick off QA Pass 1** (do **not** merge yet) — skip if Verify passes is `pass2` only

### 2. After QA Pass 1

| QA sign-off | CEO action |
|-------------|------------|
| **merge** | Tell PM/Developer: **merge the PR** (then branch cleanup + Pass 2 if required) |
| **hold** / **retest** | Wait; do not merge; PM routes fixes back to Developer |
| **fail** | Do not merge; PM opens fix handoff (same work ID Iteration or new ID as needed) |

### 3. After merge (Developer cleans up branch)

- [ ] Tell PM: **kick off QA Pass 2** on https://ccvaa-web.vercel.app/ (if Verify passes includes `pass2`)
- [ ] Optional later: manual smoke on https://ccvaa.ca/

### 4. After Pass 2

| QA sign-off | CEO action |
|-------------|------------|
| **ship confirmed** | Done — PM marks backlog item `completed` and updates FEATURES.md if needed |
| **hotfix** | Approve next Ship path (`feature-branch` or `direct-to-main`); often Iteration on same ID or a new backlog ID |

---

## Checklist: ops / secrets (no PR)

When QA/PM report env gaps (e.g. missing `SMTP_PASS`):

- [ ] Set the variable in **Vercel** for the right environment (Production and/or Preview)
- [ ] Redeploy if required
- [ ] Tell PM to retest (Pass 2, baseline slice, CEO Verifier, or CEO-in-the-loop OTP login)

Agents cannot securely hold Production mailbox passwords.

---

## Checklist: OTP when QA needs full admin login

- [ ] Ensure SMTP (+ Redis/KV for shared OTP store) env works on that environment
- [ ] Wait for QA to **Send once** — do **not** click Send yourself on Preview/Production during the attempt
- [ ] Open Hover for `info@ccvaa.ca`; paste the **newest** 6-digit code into the **PM/QA chat** for that session
- [ ] Do not commit the code or put it in docs
- [ ] If verify fails with a fresh code → stop (do not spam Send); PM/QA escalate (flush Redis rate keys or wait)

---

## What “done” looks like

### Agent Verifier (typical feature-branch)

```
you: pick ID + kick off
     → PM: in-progress + Dev handoff
     → Developer: branch feat/{feature-slug}-{NNNN}-… + PR
     → you: kick QA Pass 1
     → QA: merge recommended
     → you: approve merge
     → Developer: merge + delete branch
     → you: kick QA Pass 2
     → QA: ship confirmed
     → PM: backlog completed + FEATURES.md
     → you (optional): check ccvaa.ca
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
