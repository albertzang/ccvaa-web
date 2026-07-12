# Handoff: Product Manager → Developer

**Date:**  
**Requested by:** CEO / PM  
**Backlog work ID:** `{feature-slug}-{NNNN}` (**required** — blank → Developer blocks)  
**Backlog link:** `docs/product/backlogs/{feature-slug}-BACKLOG.md`  
**Priority:** now | next | later  

**Save as:** `docs/qa/handoffs/HANDOFF-DEV-{feature-slug}-{NNNN}.md`

## Ship path

**Ship path:** `feature-branch` (default) | `direct-to-main`

- Default is **`feature-branch`**. Developer must not choose `direct-to-main` on their own.
- **`direct-to-main` requires CEO approval** (state it here). Allowed only for docs-only (usually PM), emergency hotfix, or trivial one-liner.
- If this field is blank/ambiguous → Developer treats as **`feature-branch`**.
- See `docs/protocols/GIT_DEPLOY.md` (Ship path section).

**CEO approved direct-to-main?** yes / no / n/a  

**Reason for direct-to-main (if any):**  

## Goal

(From backlog description; expand acceptance as needed.)

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

### If Ship path = `feature-branch` (default)

- **You (Developer) own the feature branch name** — must include the work ID: `feat/{feature-slug}-{NNNN}-short-slug` or `fix/{feature-slug}-{NNNN}-…`.
- Suggested branch name: 
- PR title must include `{feature-slug}-{NNNN}`.
- Open a PR; wait for Vercel Preview; fill QA Pass 1 handoff as `HANDOFF-QA-{feature-slug}-{NNNN}-pass1.md` with the **exact Preview URL**.
- Path: Preview QA Pass 1 → merge when CEO asks → **delete feature branch local+remote** → QA Pass 2 on https://ccvaa-web.vercel.app/
- Pass 2 bugs → new branch from `main` (same or new work ID per PM); do not revive the merged feature branch.

### If Ship path = `direct-to-main` (CEO-approved only)

- Work on `main`; commit/push only when CEO asks.
- Skip Preview / QA Pass 1.
- After push: recommend light QA Pass 2 on https://ccvaa-web.vercel.app/ for **code** changes (skip QA for pure docs unless CEO asks).
- Still record the backlog work ID on commits/messages where practical.

## Done means

- **`feature-branch` (pre-merge):** lint/typecheck clean; PR open (work ID in title); exact Preview URL in QA Pass 1 handoff.
- **`feature-branch` (post-merge):** PR merged; local + remote feature branch **deleted**; Pass 2 handoff ready.
- **`direct-to-main`:** lint/typecheck clean; ready to commit/push when CEO asks; Pass 2 handoff if code.
