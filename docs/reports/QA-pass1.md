# QA report

**Pass:** 1 (pre-merge)  
**Backlog work ID:** `members-0003`  
**Environment(s) + exact URLs:** Preview https://ccvaa-web-git-feat-members-azang-projects.vercel.app (Deployment Protection bypass used via `.env.local`; bypass query omitted from URL; browser flows also need `x-vercel-set-bypass-cookie=true` so client `fetch` keeps the session)  
**Branch / PR / commit:** `feat/members` · PR https://github.com/albertzang/ccvaa-web/pull/8 · Preview tip at report time `5f40bbf` (newsletter impl `cf1c3bb`; handoff had noted `dbc0681`)  
**Date:** 2026-07-14  
**Result:** fail

**Save as:** `docs/reports/QA-pass1.md`

**Retest:** overwrite this same path. Do not create `-prior` / `-v2` / `-attemptN` files.

## Scope tested

Contact `#contact` newsletter UI (subscribe / manage / confirm), Hero **Subscribe** → `#contact`, tokenized unsub landing, fail-closed API behavior, health smoke, lint/typecheck. Merge gate **epic** — sign-off is **hold** / **continue epic** / **retest** (not merge to `main`).

## Checklist results

| Area | Result | Notes |
|------|--------|-------|
| Hero **Subscribe** → `#contact` | pass | `href="#contact"`; with bypass cookie, click scrolls to Contact. Header Contact also works |
| Contact newsletter UI (subscribe / manage / confirm forms) | pass | Subscribe + Manage preference tabs present; CASL consent + “separate from paid membership” copy present |
| Subscribe / confirm fail-closed (no `RESEND_*`) | fail | Preview has `DATABASE_URL` (`GET /api/members/health` → `db.ok: true`) but `email.resend: "missing"`. `POST /api/members/newsletter/subscribe` → **500** `MEMBERS_INTERNAL_ERROR` / “Something went wrong…” — not a clear **503** fail-closed message as required |
| Manage preference lookup | fail | Same: `POST …/preference` (`action: lookup`) → **500** `MEMBERS_INTERNAL_ERROR` (generic). UI surfaces that alert |
| Live double opt-in + Mailosaur | blocked | `RESEND_*` missing on Preview; full OTP round-trip not possible |
| Token unsub invalid `/?unsub=bad-token#contact` | pass | Status: “This unsubscribe link is invalid or has expired.”; no crash |
| Token unsub seed `/?unsub=seed-unsub-newsletter-only#contact` | blocked | Needs seeded Preview DB (`npm run db:seed`); without seed / with env gaps, landing does not prove success path. Not counted as pass |
| `GET /api/members/health` | pass | **200** `{ ok: true, db: { ok: true }, email: { resend: "missing", mailosaur: "missing" }, stripe: "missing" }` — no secrets in body |
| Admin smoke | pass | `GET /admin` → **200** |
| `npm run lint` + `typecheck` | pass | Clean locally on workstation. Vercel Preview deployment was green for the epic branch during this pass; GitHub Actions tip runs may cancel on rapid pushes — confirm green CI on tip before continue if desired |
| Do not merge (epic) | n/a | Confirmed — epic merge gate |

## Bugs found

List new defects for PM triage (do **not** invent work IDs). Include severity + short repro.  
PM promotes each to a backlog `bug` (**Source:** `qa`).

1. **Newsletter APIs return generic 500 when Resend is unset (severity with DB present)** — **severity: high**  
   - **URL:** https://ccvaa-web-git-feat-members-azang-projects.vercel.app  
   - **Repro:** With Preview Deployment Protection bypass, `POST /api/members/newsletter/subscribe` with `{"email":"qa-pass1@example.com"}` → **500** `{"ok":false,"code":"MEMBERS_INTERNAL_ERROR","message":"Something went wrong. Please try again later."}`. Same for preference lookup. Health reports `email.resend: "missing"`. Expected clear **503** fail-closed (handoff: without `RESEND_*` → clear API error).  
   - Also investigate whether Preview Neon is migrated (`select 1` can succeed while `members` queries throw unhandled errors).

Known backlog IDs already under test: `members-0003` in [`docs/product/backlogs/members-BACKLOG.md`](../product/backlogs/members-BACKLOG.md).

## Suggestions (non-blocking)

- Document Pass 1 browser tip: open Preview with `x-vercel-protection-bypass` **and** `x-vercel-set-bypass-cookie=true` so same-origin `fetch` to `/api/*` keeps the bypass cookie (query-only is enough for curl; not for client forms).
- CEO: set `RESEND_API_KEY` + `RESEND_FROM_EMAIL` on Vercel Preview (and confirm migrate + optional `db:seed`) before retest of live subscribe / seed unsub.
- Tip CI was cancelled on `a4942a4` — optional re-run Actions for a green check on the exact tip before epic continue.

## Sign-off

**Pass 1:** **hold** — Hero Subscribe + Contact UI/copy + invalid unsub landing look good, but newsletter subscribe/preference fail closed with a generic **500** while Resend is missing (and live OTP / seed unsub remain blocked). Epic branch `feat/members` stays open; do **not** merge to `main`. Retest after clear 503 fail-closed (and ideally Resend + seed for full paths).
