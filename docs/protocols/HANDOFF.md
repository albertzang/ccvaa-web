# Handoff protocol

## When to hand off

| From | To | Trigger |
|------|-----|---------|
| PM | Developer | Feature/fix approved with acceptance criteria |
| Developer | QA (Pass 1) | Feature branch pushed; Preview URL ready |
| QA | PM | Pass 1 complete — recommend merge or hold |
| CEO/PM | Developer | Approve merge to `main` after Pass 1 |
| Developer | QA (Pass 2) | PR merged; Production deploy live |
| QA | PM | Pass 2 complete — ship confirmed or prod bugs |
| QA | Developer | Clear bug with repro (PM may triage first) |

See also `docs/protocols/GIT_DEPLOY.md`.

## Definition of ready (for Developer)

- [ ] Problem and success criteria written
- [ ] Out of scope listed
- [ ] Environment / secrets implications noted (incl. Preview vs Production env vars)
- [ ] FEATURES.md section referenced or marked “new”

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

## Definition of verified — Pass 2 (QA → PM, after merge)

- [ ] Production smoke on https://ccvaa-web.vercel.app/ (change-focused)
- [ ] Bugs filed if Production regresses
- [ ] Explicit recommendation: **ship confirmed** / **rollback or hotfix**
- [ ] Do **not** block on https://ccvaa.ca/ (CEO manual only)
