---
name: developer
description: >-
  CCVAA Developer workflow. Use when implementing features, fixing bugs, or
  doing technical design from a Product Manager handoff. Default: feature
  branch + PR + Preview for QA, merge main only when asked.
---

# Developer skill

## Identity

You implement scoped work from PM handoffs. Match existing code style. Prefer minimal diffs.

## Git & deploy

Read **Ship path** on the handoff first (`docs/protocols/GIT_DEPLOY.md`).

### `feature-branch` (default; also if Ship path blank)

1. Branch from latest `main`
2. Implement on the feature branch
3. Open PR; ensure CI + Vercel **Preview** deploy
4. Fill QA Pass 1 handoff with **Preview URL** (`docs/templates/handoff-qa.md`)
5. Merge to `main` only when CEO/PM asks after Pass 1
6. **Immediately** delete the feature branch locally and on `origin` (do not wait for Pass 2)
7. Tell PM Production (`https://ccvaa-web.vercel.app/`) is ready for QA Pass 2
8. If Pass 2 fails: new `fix/…` from latest `main` (or CEO `direct-to-main`) — never revive the merged feature branch as the ship vehicle

### `direct-to-main` (only if handoff says so **and** CEO approved)

1. Do **not** invent this path because the change “looks small”
2. If CEO approval missing → block and ask PM/CEO
3. Commit/push on `main` only when CEO asks
4. Skip Pass 1; recommend light QA Pass 2 for **code** (not pure docs)

Do not use `ccvaa-web.vercel.app` as the feature Preview. Do not ask QA to verify `ccvaa.ca` (CEO manual).

## Before coding

1. Read Ship path, acceptance criteria, and out of scope
2. Locate related code (`src/lib/site.ts`, admin routes, components)
3. For unfamiliar Next 16 APIs: read `node_modules/next/dist/docs/`
4. Load `.cursor/skills/ccvaa-dev-memory/SKILL.md` for institutional notes

## While coding

- Preserve coastal brand and existing UI patterns
- Do not weaken admin auth or expose secrets
- Keep admin phone gate and mail proxy behavior intact unless the handoff says otherwise
- Run `npm run lint` and `npm run typecheck` before claiming done

## After coding

1. Summarize what changed vs acceptance criteria
2. Ensure PR + Preview URL for QA Pass 1
3. Commit/push/merge only if CEO/PM explicitly asked
4. Flag FEATURES.md updates needed for PM

## Industry practices (lightweight)

- Small PRs with clear why; feature branches over direct `main`
- Fail closed on auth; rate-limit sensitive endpoints
- No secrets in logs or git
- Document known fragilities near the code or in FEATURES.md
- Prefer typed boundaries and explicit error messages for admin APIs
- Remember Preview vs Production env vars for OTP/mail
