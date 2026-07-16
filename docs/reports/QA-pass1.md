# QA report

**Pass:** 1 (pre-merge)  
**Backlog work ID:** `members-0014`, `members-0015`, `members-0016`, `members-0017`, `members-0018`  
**Environment(s) + exact URLs:** Preview https://ccvaa-web-git-feat-members-azang-projects.vercel.app (Deployment Protection bypass via `.env.local`; both `x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie=true`; bypass value omitted). Mailosaur OTP via `MAILOSAUR_*` (values omitted). Stripe Test mode card `4242…` (full PAN omitted).  
**Branch / PR / commit:** `feat/members` · PR https://github.com/albertzang/ccvaa-web/pull/8 · tip `a64bf11` (Preview deploy Ready, aliased to branch URL; feature SHAs through `8ab184d` / `5f2050a`)  
**Date:** 2026-07-16  
**Result:** pass  
**Merge gate:** `epic` → **continue epic** (do **not** merge)

**Save as:** `docs/reports/QA-pass1.md`

**Retest:** overwrite this same path. Do not create `-prior` / `-v2` / `-attemptN` files.

## Scope tested

CEO feedback batch on epic `feat/members` (handoff `HANDOFF-QA-pass1.md`):

1. **members-0017** — Newsletter Name required (UI + API); international-friendly names on newsletter + Join  
2. **members-0015** — Join + newsletter opt-in → one OTP only; newsletter `on` after Checkout without second confirm; Contact-only still double opt-in  
3. **members-0014** — Checkout success return → auto member session → signed-in `#membership` profile; session does not grant `/admin`  
4. **members-0016** — Hero counts as annotations beside Subscribe / Join (desktop + mobile)  
5. **members-0018** — Notes trimmed; CASL + newsletter≠membership still clear  

## Checklist results

| Area | Result | Notes |
|------|--------|-------|
| Preview bypass | pass | No Vercel wall with both bypass params |
| Health | pass | `db.ok`; Resend / Mailosaur / Stripe / session `configured` |
| **0017** Newsletter empty/whitespace name | pass | API `400` / `MEMBERS_VALIDATION_ERROR` — “Name is required.” |
| **0017** Unicode newsletter name | pass | Diacritics + CJK accepted; subscribe → pending confirm |
| **0017** Unicode Join name | pass | `join/start` accepted international name |
| **0017** Name required UI | pass | Newsletter name input `required` in `#contact` |
| **0015** Join+newsletter one OTP | pass | Mailosaur: **1** mail, subject “Verify your CCVAA email” (not newsletter confirm) |
| **0015** No second confirm after Checkout | pass | Still 1 mail after Checkout; no newsletter confirm subject |
| **0015** Newsletter on after Checkout | pass | `preference.status=on` via lookup for Join email |
| **0015** Contact-only double opt-in | pass | Subscribe sends “Confirm your CCVAA newsletter subscription” |
| **0014** Checkout + return | pass | Test card paid; return `joined=1` + `session_id` |
| **0014** Auto signed-in profile | pass | `POST /api/members/join/session` → `ready`; `#membership` shows “Your membership” / Sign out (not Join form) |
| **0014** Session ≠ admin | pass | `grantsAdmin: false`; `/admin` without Hover does not unlock scaffolds |
| **0016** Hero annotations | pass | Counts beside Subscribe / Join; labels present; mobile 390×844 readable |
| **0018** CASL / ≠membership | pass | Contact CASL + “Not a membership.”; Join “Membership is separate from the newsletter (CASL)…” |
| **0018** Notes trimmed | pass | Consent kept short; no heavy stacked notes in panels |
| Lint / typecheck | pass | `tsc --noEmit` clean |

## Bugs found

- (none)

Known backlog IDs under test: `docs/product/backlogs/members-BACKLOG.md` — `members-0014` … `members-0018`.

## Suggestions (non-blocking)

- After Stripe return, Preview still needs bypass cookie for client `fetch` (`join/session`). Production Pass 2 will not have this constraint.

## Sign-off

**Pass 1:** **continue epic**  
**Pass 2:** n/a (pre-merge)  
**Baseline:** n/a  

Epic merge gate — do **not** merge to `main`.
