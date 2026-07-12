# CEO responsibilities (human)

The CEO is the decision-maker and the only person who authorizes shipping to `main`, secrets, and public-domain checks. The Product Manager advises and orchestrates agents; **PM does not replace CEO approval gates.**

PM should remind the CEO of the relevant checklist whenever an action is due.

**Product backlog:** [`docs/product/BACKLOG.md`](../product/BACKLOG.md) — work IDs `{feature-slug}-{NNNN}`.

## Always CEO

| Responsibility | Notes |
|----------------|--------|
| Goals & priorities | What to build next; accept/reject PM advice; backlog priorities |
| Approve **Ship path: `direct-to-main`** | Explicit yes required on the Dev handoff |
| Approve **kickoff** of Developer / QA / baseline | Until further automation is approved |
| Approve **merge to `main`** (or direct push) | After Pass 1 pass, or for approved direct-to-main |
| Approve **process/OS changes** | Multi-agent protocol refinements |
| **Vercel / Hover secrets & env** | e.g. `SMTP_PASS`, SMTP_*, `ADMIN_SESSION_SECRET`, `KV_REST_API_*` — never ask agents to store these in git |
| **OTP readout** | **Single-Send** only: QA Sends once → you paste newest code → QA verifies once (`docs/protocols/QA_AUTH.md`). Do not Send yourself on the same env during the attempt |
| **Manual check of https://ccvaa.ca/** | Out of agent Dev/QA flow (DNS/cache) |
| `gh auth login` / GitHub access on this device | One-time (or refresh); needed for agent `gh pr` flows |

## Usually not CEO (agents / PM)

| Work | Who |
|------|-----|
| Implementation, feature branches, PRs | Developer |
| Pass 1 / Pass 2 / baseline testing | QA |
| Handoffs, FEATURES / feature backlogs, triage | PM |
| Delete feature branch after merge | Developer |

CEO may still skim a PR; deep code review is optional unless PM flags risk.

---

## Checklist: baseline kickoff

- [ ] Tell PM: **kick off baseline** (full FEATURES.md or a named subset)
- [ ] No merge step — Production audit only on https://ccvaa-web.vercel.app/
- [ ] After QA report: triage with PM — promote findings into feature backlog items (`task` / `bug`); set priorities
- [ ] Ops findings (env/secrets) → you; code findings → kickoff a backlog ID when ready

Handoff/report names: `HANDOFF-QA-baseline-{NNNN}.md` / `QA-baseline-{NNNN}.md` (auto-increment; date only inside the files). No feature backlog ID until findings are promoted.

---

## Checklist: report a bug to PM

- [ ] Describe symptom, environment (Production / Preview / local), repro
- [ ] PM creates a backlog item (`type: bug`, **Source:** `ceo`) in the right feature file and shares the **work ID**
- [ ] Agree **priority** (`now` / `next` / `later`)
- [ ] When ready: tell PM to **kick off `{feature-slug}-{NNNN}`** (Dev → Pass 1 → merge → Pass 2)

Bugs live on the feature backlog only (no separate bug files). QA findings are promoted the same way with **Source:** `qa`.

---

## Checklist: backlog review

- [ ] Ask PM to **list** a feature backlog (or all): open items by priority
- [ ] Re-prioritize, cancel, or add items with PM
- [ ] Pick one work ID to kick off when ready

---

## Checklist: pick backlog item + kickoff

- [ ] Choose a work ID from PM’s list (e.g. `admin-console-0001`)
- [ ] Tell PM: **kick off `{feature-slug}-{NNNN}`**
- [ ] PM sets status `in-progress`, writes Dev handoff, suggests branch with that ID
- [ ] Continue with feature-branch PR happy path below

---

## Checklist: feature-branch PR (happy path)

Use this whenever a PR is open for a kicked-off backlog item.

### 1. PR is open + Preview is ready

- [ ] Confirm PR link, Preview URL, and backlog work ID on the handoff
- [ ] Optional: skim the diff for intent (not required for every change)
- [ ] Tell PM: **kick off QA Pass 1** (do **not** merge yet)

### 2. After QA Pass 1

| QA sign-off | CEO action |
|-------------|------------|
| **merge** | Tell PM/Developer: **merge the PR** (then branch cleanup + Pass 2) |
| **hold** / **retest** | Wait; do not merge; PM routes fixes back to Developer |
| **fail** | Do not merge; PM opens fix handoff (same or new backlog ID as needed) |

### 3. After merge (Developer cleans up branch)

- [ ] Tell PM: **kick off QA Pass 2** on https://ccvaa-web.vercel.app/
- [ ] Optional later: manual smoke on https://ccvaa.ca/

### 4. After Pass 2

| QA sign-off | CEO action |
|-------------|------------|
| **ship confirmed** | Done — PM marks backlog item `completed` and updates FEATURES.md if needed |
| **hotfix** | Approve next Ship path (`feature-branch` or `direct-to-main`); often a new backlog ID |

---

## Checklist: ops / secrets (no PR)

When QA/PM report env gaps (e.g. missing `SMTP_PASS`):

- [ ] Set the variable in **Vercel** for the right environment (Production and/or Preview)
- [ ] Redeploy if required
- [ ] Tell PM to retest (Pass 2, baseline slice, or CEO-in-the-loop OTP login)

Agents cannot securely hold Production mailbox passwords.

---

## Checklist: OTP when QA needs full admin login

- [ ] Ensure SMTP (+ Redis/KV for shared OTP store) env works on that environment
- [ ] Wait for QA to **Send once** — do **not** click Send yourself on Preview/Production during the attempt
- [ ] Open Hover for `info@ccvaa.ca`; paste the **newest** 6-digit code into the **PM/QA chat** for that session
- [ ] Do not commit the code or put it in docs
- [ ] If verify fails with a fresh code → stop (do not spam Send); PM/QA escalate (flush Redis rate keys or wait)

---

## What “done” looks like for a typical backlog kickoff

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

PM will prompt you at each gate with a one-line ask.
