# QA report

**Pass:** 1 (pre-merge)  
**Backlog work ID:** `members-0003`  
**Environment(s) + exact URLs:** Preview https://ccvaa-web-git-feat-members-azang-projects.vercel.app (Deployment Protection bypass used via `.env.local`; bypass query/header omitted from written URL; interactive forms still need `x-vercel-set-bypass-cookie=true`)  
**Branch / PR / commit:** `feat/members` · PR https://github.com/albertzang/ccvaa-web/pull/8 · fail-closed fix `8fb76ba` (in tip ancestry) · Preview tip at report time `3841026` (handoff noted `8fb76ba` / `62d4b16`)  
**Date:** 2026-07-14  
**Result:** pass

**Save as:** `docs/reports/QA-pass1.md`

**Retest:** overwrite this same path. Do not create `-prior` / `-v2` / `-attemptN` files.

## Scope tested

**members-0003 Iteration 2** fail-closed retest (epic Merge gate): newsletter/API **503** clarity when Resend and/or schema are missing, health smoke, Hero/Contact + invalid unsub landing, lint/typecheck. Sign-off is **continue epic** / **hold** / **retest** — not merge to `main`.

## Checklist results

| Area | Result | Notes |
|------|--------|-------|
| `GET /api/members/health` | pass | **200** throughout. Early sample this pass: `email.resend: "missing"` (db ok). Later on same Preview alias: `email.resend: "configured"`, `session: "configured"` (env drift mid-pass). No secrets in body |
| Subscribe fail-closed (Resend missing) | pass | First API sample (Resend **missing**): `POST /api/members/newsletter/subscribe` → **503** `MEMBERS_EMAIL_UNAVAILABLE` with clear message — **not** **500** `MEMBERS_INTERNAL_ERROR` |
| Subscribe / confirm (Resend present, schema missing) | pass | Later env: Resend configured, Neon schema incomplete → subscribe & confirm **503** `MEMBERS_DB_UNAVAILABLE` (clear fail-closed; no generic 500) |
| Preference lookup | pass | `POST …/preference` `action=lookup` → **503** `MEMBERS_DB_UNAVAILABLE` (unmigrated) — allowed per handoff; never generic **500** |
| Hero **Subscribe** → `#contact` | pass | Preview HTML: `href="#contact"` + Subscribe CTA; no Vercel login wall with bypass |
| Contact newsletter UI | pass | Preview HTML includes newsletter form markers; Subscribe + Manage preference UI/copy present (CASL + separate from paid membership) |
| Invalid `/?unsub=bad-token` | pass | **200**; page includes “This unsubscribe link is invalid or has expired.” |
| Live double opt-in + Mailosaur | blocked | Schema still unmigrated (`MEMBERS_DB_UNAVAILABLE`); Mailosaur missing on health. Not blocking Iteration 2 fail-closed acceptance |
| Seed unsub success path | blocked | Needs Preview `db:seed`; without seed, landing stays invalid — not counted as fail |
| `npm run lint` + `typecheck` | pass | Clean locally on workstation |
| Do not merge (epic) | n/a | Confirmed — epic merge gate |

## Bugs found

- (none) — prior hold (generic **500** when Resend/schema unset) resolved in `8fb76ba`; retest confirms clear **503** fail-closed (`MEMBERS_EMAIL_UNAVAILABLE` and/or `MEMBERS_DB_UNAVAILABLE`).

Known backlog IDs already under test: `members-0003` in [`docs/product/backlogs/members-BACKLOG.md`](../product/backlogs/members-BACKLOG.md).

## Suggestions (non-blocking)

- Run Preview Neon migrations (+ optional `npm run db:seed`) before a later pass if live double opt-in / seed unsub success should be verified.
- Tip includes later `members-0005` OTP login WIP (`3841026`); this retest only judged the Iteration 2 fail-closed delta.

## Sign-off

**Pass 1:** **continue epic** — Iteration 2 fail-closed verified on Preview (clear **503** codes; no generic **500** `MEMBERS_INTERNAL_ERROR`). Epic branch `feat/members` stays open; do **not** merge to `main`.
