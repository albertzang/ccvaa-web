# QA report

**Pass:** 1 (pre-merge)  
**Backlog work ID:** `members-0003`  
**Environment(s) + exact URLs:** Preview https://ccvaa-web-git-feat-members-azang-projects.vercel.app (Deployment Protection bypass via `.env.local` `VERCEL_AUTOMATION_BYPASS_SECRET`; query + `x-vercel-set-bypass-cookie=true`; bypass value omitted from report). API checks used header `x-vercel-protection-bypass`.  
**Branch / PR / commit:** `feat/members` · PR https://github.com/albertzang/ccvaa-web/pull/8 · tip at report time `afb0f19`  
**Date:** 2026-07-14  
**Result:** fail

**Save as:** `docs/reports/QA-pass1.md`

**Retest:** overwrite this same path. Do not create `-prior` / `-v2` / `-attemptN` files.

## Scope tested

Part A — `members-0003` Iteration 2 / live Resend retest on epic Preview. Confirmed past Vercel auth wall (CCVAA title + site chrome). Health, newsletter subscribe/preference/confirm/unsub APIs, Contact UI markers, Hero Subscribe → `#contact`, invalid unsub landing, local lint/typecheck. Merge gate **epic** — sign-off is **continue epic** / **hold** / **retest** (not merge to `main`).

## Checklist results

| Area | Result | Notes |
|------|--------|-------|
| Preview protection bypass | pass | Both query params required; `_vercel_jwt` set; HTML title **Coast to Coast Visual Arts Association**; not Vercel login wall. Health **200** with bypass header |
| `GET /api/members/health` | pass | `{ ok: true, db: { ok: true }, email: { resend: "configured", mailosaur: "missing" }, stripe: "missing", session: "configured" }` — informational only; ping does not prove `members` tables exist |
| Subscribe success / OTP send (live Resend) | fail | `POST /api/members/newsletter/subscribe` → **503** `MEMBERS_DB_UNAVAILABLE` — “Members database schema is missing or incomplete. Run migrations against this DATABASE_URL.” Resend is configured but schema blocks the send path |
| Confirm OTP (if capturable) | blocked | Confirm also **503** schema missing; no OTP accepted. Mailosaur **missing** on Preview anyway |
| Preference `lookup` (seed email) | fail | `annual@ccvaa-seed.test` / `newsletter-only@ccvaa-seed.test` → **503** same schema message (not generic 500) |
| Preference validation | pass | Invalid email → **400** `MEMBERS_VALIDATION_ERROR` / “Invalid email address” |
| Hero **Subscribe** → `#contact` | pass | `href="#contact"` + Subscribe present in Preview HTML |
| Contact newsletter UI | pass | `#contact`, Subscribe, Manage preference, consent / “unsubscribe anytime” / separate-from-membership copy present (`NewsletterForm` in payload) |
| Invalid unsub `/?unsub=bad-token#contact` | pass | Landing includes “This unsubscribe link is invalid or has expired.” |
| Seed unsub token redeem | fail | `POST …/unsub` with `seed-unsub-newsletter-only` → **503** schema missing (seed path not proven on this Preview DB) |
| Fail-closed when Resend missing | n/a (spot-check) | Resend now **configured**; prior Iteration 2 fail-closed not re-proven by unsetting env. Live path is green for Resend status but blocked on schema |
| Admin smoke | pass | `GET /admin` → HTML **200** |
| `npm run lint` + `typecheck` | pass | Clean on workstation |
| Do not merge (epic) | n/a | Confirmed |

## Bugs found

List new defects for PM triage (do **not** invent work IDs). Include severity + short repro.  
PM promotes each to a backlog `bug` (**Source:** `qa`).

1. **Preview Neon schema incomplete despite health `db.ok`** — **severity: high**  
   - **URL:** https://ccvaa-web-git-feat-members-azang-projects.vercel.app  
   - **Repro:** With Deployment Protection bypass, `GET /api/members/health` → **200** `db.ok: true`, `email.resend: "configured"`. Then `POST /api/members/newsletter/subscribe` with a valid email → **503** `MEMBERS_DB_UNAVAILABLE` (“schema is missing or incomplete…”). Same for preference lookup and seed unsub.  
   - **Expected:** Migrated + seeded Preview DB so subscribe can hit Resend success path (or, if unmigrated, health should not imply members tables are ready).  
   - **Note:** Contradicts CEO/PM note that schema was migrated + seed applied on this Preview.

Known backlog IDs already under test: `members-0003` in [`docs/product/backlogs/members-BACKLOG.md`](../product/backlogs/members-BACKLOG.md).

## Suggestions (non-blocking)

- Health could report schema readiness (e.g. `select` against `members`) so `db.ok` is not misleading.
- After migrate + `npm run db:seed` on the **same** `DATABASE_URL` Preview uses, retest live subscribe + seed preference/unsub.
- Optional Mailosaur on Preview for OTP capture (`docs/members/mailosaur-qa.md`).
- Cursor browser MCP could not open a tab this session; UI evidence is from curl HTML + cookie bypass (same protection path).

## FEATURES.md drift

None product-copy. Platform note for PM: health `db.ok` only pings connectivity — does not assert migrations.

## Sign-off

**Pass 1:** **hold** — UI + invalid unsub + validation + Resend/session health look good, but live newsletter APIs are blocked by missing/incomplete schema on Preview. Epic branch stays open; do **not** merge to `main`. Retest after Preview `DATABASE_URL` is migrated (and preferably seeded).
