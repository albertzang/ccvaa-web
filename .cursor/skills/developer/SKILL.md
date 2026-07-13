---
name: developer
description: >-
  CCVAA Developer workflow. Use when implementing features, fixing bugs, or
  doing technical design from a Product Manager handoff. Read Verifier + Ship
  path; default agent path is feature branch + PR + Preview for QA.
---

# Developer skill

## Identity

You implement scoped work from PM handoffs. Match existing code style. Prefer minimal diffs.

## Git & deploy

Read **Verifier**, **Verify passes**, and **Ship path** on the handoff first (`docs/protocols/GIT_DEPLOY.md`).

### Defaults if Ship path blank

| Verifier | Ship path | Verify passes |
|----------|-----------|----------------|
| `agent` (default) | `feature-branch` | `pass1+pass2` |
| `ceo` | `direct-to-main` | `pass2` |

### `feature-branch`

1. Confirm **Backlog work ID** on the handoff (`{feature-slug}-{NNNN}`). Blank → **block** and ask PM.
2. Branch from latest `main` as `feat/{feature-slug}-{NNNN}-short-slug` or `fix/{feature-slug}-{NNNN}-…`
3. Implement on the feature branch
4. Open PR (title includes work ID); ensure CI + Vercel **Preview** deploy
5. **If Verifier = `agent` and Verify passes includes `pass1`:** fill `HANDOFF-QA-{feature-slug}-{NNNN}-pass1.md` with **Preview URL**
6. **If Verifier = `ceo` and Verify passes includes `pass1`:** give Preview URL to PM for CEO — **do not** write agent QA files
7. Merge to `main` only when CEO/PM asks
8. **Immediately** delete the feature branch locally and on `origin` (do not wait for Pass 2 / CEO verify)
9. **If Verify passes includes `pass2`:** tell PM Production is ready (agent Pass 2 **or** CEO verify per Verifier)
10. Failures after merge: Iteration same work ID; new `fix/{feature-slug}-{NNNN}-…` from latest `main` (or CEO `direct-to-main`) — never revive the merged feature branch

### `direct-to-main` (handoff says so **and** CEO approved, **or** Verifier = `ceo`)

1. Do **not** invent this path because the change “looks small”
2. If CEO approval missing and Verifier ≠ `ceo` → block and ask PM/CEO
3. Commit/push on `main` only when CEO asks
4. Skip agent Pass 1 unless Verify passes explicitly includes `pass1`
5. **Verifier = `agent`:** recommend light QA Pass 2 for **code** if pass2
6. **Verifier = `ceo`:** notify PM that CEO can verify — **no** agent QA files

Do not use `ccvaa-web.vercel.app` as the feature Preview. Do not ask QA to verify `ccvaa.ca` (CEO manual).

## Before coding

1. Read Verifier, Verify passes, Ship path, **Backlog work ID**, acceptance criteria, and out of scope
2. Locate related code (`src/lib/site.ts`, admin routes, components)
3. For unfamiliar Next 16 APIs: read `node_modules/next/dist/docs/`
4. Load `.cursor/skills/ccvaa-dev-memory/SKILL.md` for institutional notes

## While coding

- Preserve coastal brand and existing UI patterns
- Do not weaken admin auth or expose secrets
- Preserve mail proxy behavior unless the handoff says otherwise
- Run `npm run lint` and `npm run typecheck` before claiming done

## After coding

1. Summarize what changed vs acceptance criteria
2. Hand off for the next verify step per Verifier (agent QA file **or** PM → CEO)
3. Commit/push/merge only if CEO/PM explicitly asked
4. Flag FEATURES.md updates needed for PM

## Industry practices (lightweight)

- Small PRs with clear why; feature branches over direct `main` unless handoff says otherwise
- Fail closed on auth; rate-limit sensitive endpoints
- No secrets in logs or git
- Document known fragilities near the code or in FEATURES.md
- Prefer typed boundaries and explicit error messages for admin APIs
- Remember Preview vs Production differences for mail proxy / Deployment Protection
