# Handoff: Product Manager → Developer

**Date:**  
**Requested by:** CEO / PM  
**Backlog work ID:** `{feature-slug}-{NNNN}` (**required** — blank → Developer blocks)  
**Backlog link:** `docs/product/backlogs/{feature-slug}-BACKLOG.md`  
**Priority:** now | next | later  
**Iteration:** `1` | `2` | … (same work ID; bump when CEO/PM sends rework)

**Save as:** `docs/qa/handoffs/HANDOFF-DEV-{feature-slug}-{NNNN}.md`  
**Rework:** overwrite this same path — do not create `-v2` / `-iterN` siblings.

## Verifier & Ship path

**Verifier:** `agent` (default) | `ceo` | `n/a`  
**Verify passes:** `pass1+pass2` | `pass1` | `pass2` | `n/a`  
**Ship path:** `feature-branch` | `direct-to-main`

### Defaults (if blank on backlog / handoff)

| Verifier | Ship path | Verify passes |
|----------|-----------|----------------|
| `agent` | `feature-branch` | `pass1+pass2` |
| `ceo` | `direct-to-main` | `pass2` |
| `n/a` | `direct-to-main` (typical) | `n/a` |

- **Verifier = `agent`:** run agent QA for the listed Verify passes (`HANDOFF-QA-*` / `QA-*`).  
- **Verifier = `ceo`:** **do not** write agent QA handoffs. After Dev ships to the target env, PM asks CEO to verify. CEO says **verified** to complete the backlog item, or reports issues → Iteration on the **same** work ID.  
- **Verifier = `n/a`:** docs/process (`agent-os`); no Pass 1/2. PM may ask CEO to skim/approve; push when CEO asks.  
- **`direct-to-main`** requires CEO approval (stated here, or implied when Verifier = `ceo` / `n/a` and Ship path is `direct-to-main`).  
- If Ship path blank/ambiguous → apply Verifier defaults above (not always `feature-branch`).  
- See `docs/protocols/GIT_DEPLOY.md` and `docs/protocols/CEO.md`.

**CEO approved direct-to-main?** yes / no / n/a  

**Reason for direct-to-main (if any):**  

## Goal

(From backlog description; expand acceptance as needed. For Iteration > 1, summarize only the delta.)

## User value

## Acceptance criteria

- [ ]
- [ ]

## Out of scope

## Technical hints

- Relevant paths:
- Env / secrets impact:
- Related FEATURES.md section:
- Related backlog item:

## Design / UX constraints

Match existing coastal theme; prefer minimal scope.

## Git / deploy expectations

### If Ship path = `feature-branch`

- **You (Developer) own the feature branch name** — must include the work ID: `feat/{feature-slug}-{NNNN}-short-slug` or `fix/{feature-slug}-{NNNN}-…`.
- Suggested branch name: 
- PR title must include `{feature-slug}-{NNNN}`.
- Open a PR; wait for Vercel Preview.
- **If Verifier = `agent` and Verify passes includes `pass1`:** fill `HANDOFF-QA-{feature-slug}-{NNNN}-pass1.md` with the **exact Preview URL**; path continues merge → cleanup → Pass 2 if required.
- **If Verifier = `ceo` and Verify passes includes `pass1`:** paste Preview URL for **CEO** (via PM); no agent QA file. Merge when CEO asks after their Preview check (or skip Preview check if Verify passes is `pass2` only — unusual on feature-branch).
- **If Verify passes includes `pass2`:** after merge + branch delete → agent Pass 2 **or** CEO Production verify per Verifier.
- Pass 2 / CEO-verify fails → Iteration on same work ID (new branch from `main` if previous feature branch was merged); do not revive a deleted merged branch.

### If Ship path = `direct-to-main` (CEO-approved / Verifier = `ceo` default)

- Work on `main`; commit/push only when CEO asks.
- Skip Preview / agent Pass 1 unless Verify passes explicitly includes `pass1` (rare).
- After push: **Verifier = `agent`** → light QA Pass 2 for **code** if Verify passes includes `pass2`. **Verifier = `ceo`** → PM asks CEO to verify Production (no agent QA). Pure docs: usually no verify unless CEO asks.
- Still record the backlog work ID on commits/messages where practical.

## Done means

- **`feature-branch` (pre-merge):** lint/typecheck clean; PR open (work ID in title); Preview URL recorded for agent QA or CEO as required by Verifier / Verify passes.
- **`feature-branch` (post-merge):** PR merged; local + remote feature branch **deleted**; Pass 2 / CEO verify ready if required.
- **`direct-to-main`:** lint/typecheck clean; ready to commit/push when CEO asks; agent Pass 2 handoff **or** CEO verify cue per Verifier.
- **Iteration rework:** same Done means for the delta; backlog stays `in-progress` until CEO **verified** (CEO Verifier) or agent Pass 2 **ship confirmed** (agent Verifier).
