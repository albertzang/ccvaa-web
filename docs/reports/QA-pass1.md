# QA report

**Pass:** 1 (pre-merge)  
**Backlog work ID:** `members-0003`  
**Environment(s) + exact URLs:** Preview https://ccvaa-web-git-feat-members-azang-projects.vercel.app (Deployment Protection bypass used via `.env.local`; bypass query omitted from URL)  
**Branch / PR / commit:** `feat/members` · PR https://github.com/albertzang/ccvaa-web/pull/8 · Preview deploy from epic branch (handoff tip `dbc0681` / main work `cf1c3bb`)  
**Merge gate:** `epic`  
**Date:** 2026-07-14  
**Result:** pass

**Save as:** `docs/reports/QA-pass1.md`

**Retest:** overwrite this same path. Do not create `-prior` / `-v2` / `-attemptN` files.

## Scope tested

Contact `#contact` newsletter axis on Members epic Preview: Hero **Subscribe** → `#contact`, newsletter subscribe / manage / confirm UI structure, CASL + membership-separate copy, invalid + seed unsub landings, fail-closed newsletter APIs without `DATABASE_URL` / `RESEND_*`, health + admin smoke, local lint/typecheck, PR Vercel check.

## Checklist results

| Area | Result | Notes |
|------|--------|-------|
| Public homepage | pass | **200**; hero **Subscribe** is `<a href="#contact">`; `#contact` section present |
| Board / Purposes | pass | Still rendered on Preview homepage |
| Contact newsletter UI | pass | Newsletter title, consent note, **Subscribe** + **Manage preference** toggles, email/optional name fields, subscribe submit |
| Admin layout (smoke) | pass | `GET /admin` → **200** |
| Admin mail / auth / scaffolds | n/a | Optional; not required for this ticket |
| Hero Subscribe → `#contact` | pass | Anchor present on Preview HTML |
| Manage preference structure | pass | Manage control present; lookup/unsubscribe/resubscribe flows implemented in client (live lookup blocked by env — see below) |
| Confirm (6-digit) structure | pass | Confirm view + `pattern=\d{6}` / placeholder “6-digit code” in form component; live OTP blocked by env |
| CASL + membership-separate copy | pass | Consent: “consent to receive email… not a membership plan.” Description: “separate from paid CCVAA membership” |
| Invalid token `/?unsub=bad-token` | pass | **200**; message “This unsubscribe link is invalid or has expired.”; `unsubLanding.kind=invalid`; no crash |
| Seed token `/?unsub=seed-unsub-newsletter-only` | blocked | Same invalid landing (no Preview DB / seed) — expected; not a hold |
| Live double opt-in | blocked | Needs Preview `DATABASE_URL` + `RESEND_*` (+ Mailosaur optional) — expected; not a hold |
| `GET /api/members/health` | pass | **503** `MEMBERS_ENV_MISSING`; `email.resend`/`mailosaur` `"missing"` — clear fail-closed diagnostic |
| Subscribe / confirm / preference APIs | pass | POST subscribe + confirm + preference lookup/unsubscribe → **503** clear messages without `DATABASE_URL` |
| `npm run lint` + `typecheck` | pass | Both exit **0** locally |
| PR CI / Preview deploy | pass | PR #8: Vercel **pass**, Preview Comments **pass** |
| Do not merge (`epic`) | pass | Sign-off is **continue epic** only |

## Bugs found

- (none)

Known backlog IDs already under test: `members-0003` in [`docs/product/backlogs/members-BACKLOG.md`](../product/backlogs/members-BACKLOG.md).

## Suggestions (non-blocking)

- CEO: set Preview `DATABASE_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (and Mailosaur if desired) so a later Pass can exercise live subscribe → OTP → confirm and seed unsub tokens.
- Optional Dev retest after env: full double opt-in per `docs/members/mailosaur-qa.md` (`newsletter_confirm`) and `npm run db:seed` unsub tokens.

## Sign-off

**Pass 1:** **continue epic** — structural/UI and fail-closed checks for `members-0003` pass on Preview. Live double opt-in and seed unsub redemption blocked by missing Preview `DATABASE_URL` / Resend (expected; not a hold). Do **not** merge to `main` (epic merge gate).
