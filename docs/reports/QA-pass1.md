# QA report

**Pass:** 1 (pre-merge)  
**Backlog work ID:** `members-0003`  
**Environment(s) + exact URLs:** Preview https://ccvaa-web-git-feat-members-azang-projects.vercel.app (Deployment Protection bypass used via `.env.local`; bypass query omitted from URL)  
**Branch / PR / commit:** `feat/members` · PR https://github.com/albertzang/ccvaa-web/pull/8 · Preview tip at report time `3841026` (fail-closed fix `8fb76ba`)  
**Date:** 2026-07-14  
**Result:** pass-with-issues

**Save as:** `docs/reports/QA-pass1.md`

**Retest:** overwrite this same path. Do not create `-prior` / `-v2` / `-attemptN` files.

## Scope tested

Pass 1 retest for **members-0003** Iteration 2 (fail-closed 503). Contact `#contact` newsletter UI, Hero **Subscribe** → `#contact`, tokenized unsub landing, newsletter API fail-closed behavior, health smoke, lint/typecheck. Merge gate **epic** — sign-off **continue epic** (not merge to `main`).

## Checklist results

| Area | Result | Notes |
|------|--------|-------|
| Hero **Subscribe** → `#contact` | pass | Hero CTA `href="#contact"` label **Subscribe** (header Contact also anchors `#contact`) |
| Contact newsletter UI (subscribe / manage / confirm) | pass | Newsletter block with Subscribe + Manage preference tabs; CASL consent note; copy separates newsletter from paid membership |
| Subscribe / confirm fail-closed | pass | `POST /api/members/newsletter/subscribe` → **503** `MEMBERS_DB_UNAVAILABLE` — “Members database schema is missing or incomplete. Run migrations against this DATABASE_URL.” (clear fail-closed; no generic 500) |
| Manage preference lookup | pass | `POST …/preference` (`action: lookup`) → same **503** `MEMBERS_DB_UNAVAILABLE` with clear message |
| Confirm OTP | pass | `POST …/confirm` → **503** `MEMBERS_DB_UNAVAILABLE` (fail-closed) |
| Live double opt-in + Mailosaur | blocked | Preview `DATABASE_URL` + `RESEND_*` configured per health, but Neon schema not migrated — subscribe cannot complete; Mailosaur not configured |
| Token unsub invalid `/?unsub=bad-token#contact` | pass | **200**; Contact shows “This unsubscribe link is invalid or has expired.”; no crash |
| Token unsub seed `/?unsub=seed-unsub-newsletter-only#contact` | blocked | **200** with invalid landing (seed not run on Preview DB); idempotent reload stable. Success path not provable without `npm run db:seed` on Preview |
| `GET /api/members/health` | pass | **200** `{ ok: true, db: { ok: true }, email: { resend: "configured", mailosaur: "missing" }, stripe: "missing", session: "configured" }` |
| Admin smoke | pass | `GET /admin` → **200** |
| `npm run lint` + `typecheck` | pass | Clean locally. GitHub Actions `build` + Vercel deployment green on tip `3841026` |
| Do not merge (epic) | n/a | Confirmed — epic merge gate |

## Bugs found

- (none) — prior Pass 1 hold (generic **500** when Resend/schema unset) resolved in `8fb76ba`; retest confirms clear **503** fail-closed.

Known backlog IDs already under test: `members-0003` in [`docs/product/backlogs/members-BACKLOG.md`](../product/backlogs/members-BACKLOG.md).

## Suggestions (non-blocking)

- CEO: run migrations (`DATABASE_URL` on Preview Neon) and optional `npm run db:seed` before a future pass if live double opt-in or seed unsub success path should be verified on Preview.
- Browser client `fetch` to `/api/*` on protected Preview may need `x-vercel-set-bypass-cookie=true` on first navigation (curl/API checks used query bypass only).

## Sign-off

**Pass 1:** **continue epic** — Iteration 2 fail-closed fix verified; Hero/Contact UI and invalid unsub landing good. Live subscribe/confirm/seed-unsub E2E blocked by unmigrated Preview DB (acceptable fail-closed). Do **not** merge to `main` until epic milestone.
