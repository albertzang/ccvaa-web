# QA report

**Pass:** 1 (pre-merge)  
**Backlog work ID:** `members-0006` + `members-0008`  
**Environment(s) + exact URLs:** Preview https://ccvaa-web-git-feat-members-azang-projects.vercel.app (Deployment Protection bypass via `.env.local`; both `x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie=true`; bypass value omitted). API checks used header `x-vercel-protection-bypass`. Mailosaur OTP via `MAILOSAUR_*`; admin Hover mail-session via `ADMIN_EMAIL` / `ADMIN_PASS` (values omitted).  
**Branch / PR / commit:** `feat/members` · PR https://github.com/albertzang/ccvaa-web/pull/8 · tip at report commit  
**Date:** 2026-07-15  
**Result:** pass

**Save as:** `docs/reports/QA-pass1.md`

**Retest:** overwrite this same path. Do not create `-prior` / `-v2` / `-attemptN` files.

## Scope tested

1. **Part A `members-0006`** — logged-in `#membership` profile E2E (Mailosaur login after temporary annual promote; name edit; email re-verify; Annual dates; perks placeholder; no newsletter controls)
2. **Part B `members-0008`** — admin Members roster (list/search/filter plan ⊥ newsletter; Annual dates; edit/delete confirmation; Zod reject; mail-session gate)

**Explicitly stopped before** live Stripe Join Checkout (`members-0004`). Health `stripe: "missing"` expected — no Stripe secrets requested.

## Checklist results — Part A (`members-0006`)

| Area | Result | Notes |
|------|--------|-------|
| Health sanity | pass | `db.ok`, resend/session configured; `stripe: missing` (expected) |
| Login → profile | pass | Mailosaur login; profile returns name + annual plan |
| Annual anniversary / next renewal | pass | Both present on profile after annual promote |
| Name edit | pass | PATCH name OK; empty/whitespace name rejected (Zod) |
| Email change re-verify | pass | OTP to new Mailosaur address required before email update |
| Perks placeholder | pass | “Member perks” placeholder visible in `#membership` |
| No newsletter UI in profile | pass | No subscribe/opt-in controls in profile face |

## Checklist results — Part B (`members-0008`)

| Area | Result | Notes |
|------|--------|-------|
| Preview + bypass | pass | No Vercel wall with both bypass params |
| Mail-session gate | pass | Unauth GET/PATCH → 401; after Hover login, Members/Events/Financial + Log out |
| Roster list | pass | 10 rows loaded |
| Search | pass | `annual@ccvaa-seed` narrows rows |
| Plan filter ⊥ newsletter filter | pass | Plan=`annual` and newsletter=`on` each return rows |
| Annual anniversary / next renewal | pass | Annual row shows both date columns (not —) |
| Edit / delete confirmation | pass | Edit dialog + “Delete member?” cancel path |
| Zod on mutations | pass | founding + anniversary/renewal PATCH rejected |
| Unauth cannot mutate | pass | PATCH without mail-session → 401 |

## Bugs found

- (none)

## Suggestions (non-blocking)

- Seed one Preview active member on `@<MAILOSAUR_SERVER_ID>.mailosaur.net` so profile/login E2E does not need temporary admin promote.

## FEATURES.md drift

None observed for profile or admin roster behavior exercised this run.

## Sign-off

**Pass 1:** **continue epic** — Parts A (`members-0006`) and B (`members-0008`) pass on Preview. Epic stays open; do **not** merge to `main`.

**Stopped before Stripe** per handoff — no Join Checkout testing; no Stripe secrets requested. PM/CEO pause for Stripe setup (`members-0004`) is next.
