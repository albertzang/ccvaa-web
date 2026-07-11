# Handoff: Product Manager → Developer

**Date:**  
**Requested by:** CEO / PM  
**Priority:** now | next

## Ship path

**Ship path:** `feature-branch` (default) | `direct-to-main`

- Default is **`feature-branch`**. Developer must not choose `direct-to-main` on their own.
- **`direct-to-main` requires CEO approval** (state it here). Allowed only for docs-only (usually PM), emergency hotfix, or trivial one-liner.
- If this field is blank/ambiguous → Developer treats as **`feature-branch`**.
- See `docs/protocols/GIT_DEPLOY.md` (Ship path section).

**CEO approved direct-to-main?** yes / no / n/a  

**Reason for direct-to-main (if any):**  

## Goal

## User value

## Acceptance criteria

- [ ]
- [ ]

## Out of scope

## Technical hints

- Relevant paths:
- Env / secrets impact:
- Related FEATURES.md section:

## Design / UX constraints

Match existing coastal theme; prefer minimal scope.

## Git / deploy expectations

### If Ship path = `feature-branch` (default)

- **You (Developer) own the feature branch name** — create `feat/…` / `fix/…` / `chore/…` from `main`.
- Suggested branch name (optional): 
- Open a PR; wait for Vercel Preview; fill `docs/templates/handoff-qa.md` with the **exact Preview URL**.
- Path: Preview QA Pass 1 → merge when CEO asks → **delete feature branch local+remote** → QA Pass 2 on https://ccvaa-web.vercel.app/
- Pass 2 bugs → new `fix/…` from `main` (or CEO `direct-to-main`); do not revive the merged feature branch.

### If Ship path = `direct-to-main` (CEO-approved only)

- Work on `main`; commit/push only when CEO asks.
- Skip Preview / QA Pass 1.
- After push: recommend light QA Pass 2 on https://ccvaa-web.vercel.app/ for **code** changes (skip QA for pure docs unless CEO asks).

## Done means

- **`feature-branch` (pre-merge):** lint/typecheck clean; PR open; exact Preview URL in QA Pass 1 handoff.
- **`feature-branch` (post-merge):** PR merged; local + remote feature branch **deleted**; Pass 2 handoff ready.
- **`direct-to-main`:** lint/typecheck clean; ready to commit/push when CEO asks; Pass 2 handoff if code.
