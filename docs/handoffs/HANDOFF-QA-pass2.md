# Handoff: Developer / PM → QA

**Date:** 2026-07-18  
**Pass:** `2`  
**Backlog work ID:** `members-0001`–`0008`, `members-0010`, `members-0014`–`0023` (Members epic milestone)  
**Ship path that led here:** `feature-branch`  
**Epic branch:** `feat/members` (deleted after milestone merge)  
**Merge gate:** `epic` — this is **post-milestone-merge** Pass 2  
**Filled by:** Developer  

**Save as:** `docs/handoffs/HANDOFF-QA-pass2.md`

**Branch name:** n/a (epic `feat/members` deleted after merge)  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/8  
**Commit:** `0f12b0dbbd8b12ca7fbb2d7a74e4ffb3c674e3a2` (`Merge pull request #8 from albertzang/feat/members`)  
**Preview URL:** n/a (Pass 2)  
**Preview protection:** n/a  
**Production URL:** https://ccvaa-web.vercel.app/  

**Post-merge cleanup (Pass 2 only):**  
- [x] Feature/epic branch deleted **locally**  
- [x] Feature/epic branch deleted **on origin**  
Cleanup happens **right after merge**, before Pass 2 testing — see `docs/protocols/GIT_DEPLOY.md`.  
**Epic milestone:** one cleanup after **merge milestone** (done).  
**Out of scope for QA:** https://ccvaa.ca/ — CEO manual only (DNS/cache). Do not test or block on it.

## Environments to test this pass

- [ ] Dev — http://localhost:3000/ (optional on Pass 1 only)
- [ ] Preview — n/a
- [x] Production — https://ccvaa-web.vercel.app/ (required on Pass 2)

## What changed

Members epic milestone merged to `main` via PR #8. Shipped work IDs (Merge gate `epic`, Pass 1 continue epic on `feat/members`):

- `members-0001`–`0008` — platform foundation through admin roster
- `members-0010` — admin email ops links
- `members-0014`–`0023` — Join auto-login through Edge Config public feature switch

Excluded from this Pass 2 ID list: `members-0009` (go-live / flag flip — CEO ops), `members-0011`–`0013` (unstarted / not shipped on this epic).

## Focus checklist

Milestone smoke on Production. Edge Config **`production.members` is Off by default** — do **not** treat “feature fully On” as Pass 2 depth unless the flag is already true.

**Fail-closed Off (expected default):**
- [ ] Homepage has **no** Membership nav / `#membership` portal / Hero Subscribe·Join CTAs + counter badges
- [ ] Gated public Members APIs return **404** `MEMBERS_FEATURE_UNAVAILABLE` (e.g. `POST /api/members/verify/start`, join/newsletter preference under session)
- [ ] Do **not** flip Edge Config `production` bucket — CEO owns go-live (`members-0009`)

**Always-live paths (must work even when Off):**
- [ ] Admin roster: `/admin` → Members (mailbox auth via `.env.local`; see QA_AUTH)
- [ ] Stripe webhook: `POST /api/members/webhooks/stripe` remains reachable (signature/config may fail closed; route not feature-gated)
- [ ] Unsub redeem/landing: `/api/members/newsletter/unsub` (+ landing) remain reachable
- [ ] Health / logout: `GET /api/members/health`, `POST /api/members/login/logout` remain reachable

**If `production.members` is somehow already true:**
- [ ] Brief portal smoke only (`#membership` verify gate + Hero CTAs visible) — note in report; do not deepen into full Pass 1 retest unless PM asks

## Known risks / flaky areas

- Production deploy may lag merge by a few minutes — confirm `main` tip `0f12b0d` is live on https://ccvaa-web.vercel.app/ before scoring fails
- Fail-closed Off is success for public UI; do not file “Members missing on homepage” as a bug when flag is Off
- Admin mailbox login + Preview-style bypass do not apply to Production public pages; admin still needs `ADMIN_EMAIL` / `ADMIN_PASS` from `.env.local`
- Never commit secrets; do not mutate Edge Config `production` bucket

## Production / baseline / Pass 2 auth notes

- Admin auth = Hover mailbox login in Mail iframe — see `docs/protocols/QA_AUTH.md`
- QA reads `ADMIN_EMAIL` / `ADMIN_PASS` from `.env.local` to sign in — **do not** paste into handoffs or reports
- Never commit mailbox passwords or give them standing share outside `.env.local`

## Report back with

`docs/templates/qa-report.md` → save as `docs/reports/QA-pass2.md`  
Bugs found → list in this QA report for PM triage (backlog `type: bug`, **Source:** `qa`). No separate bug files.

- Pass 2: **ship confirmed** / **hotfix** *(covers milestone work IDs above)*
