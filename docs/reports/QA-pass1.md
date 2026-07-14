# QA report

**Pass:** 1 (pre-merge)  
**Backlog work ID:** `members-0003`  
**Environment(s) + exact URLs:** Preview https://ccvaa-web-git-feat-members-azang-projects.vercel.app (bypass used; secret not recorded)  
**Branch / PR / commit:** `feat/members` / PR #8 / tip at Pass 1  
**Date:** 2026-07-14  
**Result:** pass

**Save as:** `docs/reports/QA-pass1.md`

## Scope tested

Contact newsletter axis on Members epic Preview: hero Subscribe → `#contact`, newsletter UI presence, fail-closed APIs without env, invalid unsub token landing, regression smoke, lint/typecheck.

## Checklist results

| Area | Result | Notes |
|------|--------|-------|
| Public homepage | pass | **200**; hero **Subscribe** → `#contact` |
| Board / Purposes | pass | Still present |
| Contact | pass | Newsletter form mounted; bad `?unsub=` → `unsubLanding.kind=invalid` |
| Admin layout (incl. phone) | pass | `/admin` **200** |
| Admin mail | n/a | Not re-tested in depth |
| Admin auth (mail session) | n/a | |
| Admin scaffolds | n/a | |

| Focus | Result | Notes |
|-------|--------|-------|
| Health fail-closed | pass | **503** `MEMBERS_ENV_MISSING`; Resend/Mailosaur `"missing"` |
| Subscribe API fail-closed | pass | POST `/api/members/newsletter/subscribe` → **503** without `DATABASE_URL` |
| Live double opt-in / seed unsub | blocked | Needs Preview `DATABASE_URL` + Resend (+ seed) — expected |
| lint + typecheck | pass | Clean locally |

## Bugs found

- (none)

Known backlog IDs under test: `members-0003` (epic with `members-0001`/`0002`).

## Suggestions (non-blocking)

CEO should still set Preview `DATABASE_URL` / `RESEND_*` for live newsletter + OTP retest before merge milestone.

## Sign-off

**Pass 1:** **continue epic** (do not merge to `main`)
