# Handoff protocol

## When to hand off

| From | To | Trigger |
|------|-----|---------|
| PM | Developer | Feature/fix approved with acceptance criteria |
| Developer | QA (Pass 1) | Feature branch pushed; Preview URL ready |
| QA | PM | Pass 1 complete — recommend merge or hold |
| CEO/PM | Developer | Approve merge to `main` after Pass 1 |
| Developer | (self) | After merge: delete feature branch local + remote |
| Developer | QA (Pass 2) | PR merged; branch cleaned up; Production deploy live |
| PM | QA (baseline) | CEO/PM requests Production audit of already-on-main (or regression) scope |
| QA | PM | Pass 2 or baseline complete — confirmed or issues found |
| QA | Developer | Clear bug with repro (PM may triage first) |
| PM | Developer | Pass 2 / baseline fail → new fix handoff (new branch from `main`, not old feature branch) |

See also `docs/protocols/GIT_DEPLOY.md`.

## Definition of ready (for Developer)

- [ ] **Ship path** set: `feature-branch` (default) or `direct-to-main` (CEO-approved, stated)
- [ ] Problem and success criteria written
- [ ] Out of scope listed
- [ ] Environment / secrets implications noted (incl. Preview vs Production env vars)
- [ ] FEATURES.md section referenced or marked “new”
- [ ] If Ship path blank/ambiguous → treat as `feature-branch`; if `direct-to-main` without CEO approval → block

## Definition of done (for Developer → QA Pass 1)

- [ ] Code complete for agreed scope on a **feature branch** (Developer named it)
- [ ] PR open; CI green (or noted)
- [ ] **Exact Preview URL** (from Vercel/GitHub PR) recorded in `docs/templates/handoff-qa.md` — not guessed from branch name
- [ ] `npm run lint` and `npm run typecheck` (and build if relevant) pass
- [ ] Commit/push/PR only as CEO/PM asked

## Definition of verified — Pass 1 (QA → PM, before merge)

- [ ] Checklist run on **Preview URL from handoff** (required) and **Dev** if requested
- [ ] If Preview URL missing → blocked; asked Developer/PM (do not invent URL)
- [ ] Bugs filed with severity + repro + Preview URL
- [ ] Explicit recommendation: **merge** / **hold** / **retest**
- [ ] FEATURES.md accuracy flagged if docs drift

## Definition of verified — Baseline (QA → PM, no PR)

- [ ] Checklist run on https://ccvaa-web.vercel.app/ for handoff scope (often full FEATURES.md)
- [ ] No Pass 1 / Preview required
- [ ] Bugs filed with severity + repro + Production URL
- [ ] Explicit recommendation: **baseline confirmed** / **issues found**
- [ ] FEATURES.md drift flagged
- [ ] Do **not** block on https://ccvaa.ca/

## Definition of verified — Pass 2 (QA → PM, after merge)

- [ ] Production smoke on https://ccvaa-web.vercel.app/ (change-focused)
- [ ] Bugs filed if Production regresses
- [ ] Explicit recommendation: **ship confirmed** / **rollback or hotfix**
- [ ] Do **not** block on https://ccvaa.ca/ (CEO manual only)
- [ ] If fail: expect a **new** fix branch from `main` (or CEO `direct-to-main`) — not the old feature branch

## Definition of done (Developer, post-merge cleanup)

- [ ] PR merged to `main` when CEO/PM asked
- [ ] Local feature branch deleted
- [ ] Remote feature branch deleted (`git push origin --delete …` or GitHub UI + prune)
- [ ] Pass 2 handoff written (cleanup boxes checked)
