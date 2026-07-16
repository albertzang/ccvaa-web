# QA report

**Pass:** 1 (pre-merge)  
**Backlog work ID:** `members-0003` + `members-0005`  
**Environment(s) + exact URLs:** Preview https://ccvaa-web-git-feat-members-azang-projects.vercel.app (Deployment Protection bypass via `.env.local`; both `x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie=true`; bypass value omitted). API checks used header `x-vercel-protection-bypass`. Mailosaur OTP fetch via `MAILOSAUR_*` in `.env.local`.  
**Branch / PR / commit:** `feat/members` · PR https://github.com/albertzang/ccvaa-web/pull/8 · tip at report commit  
**Date:** 2026-07-15  
**Result:** pass

**Save as:** `docs/reports/QA-pass1.md`

**Retest:** overwrite this same path. Do not create `-prior` / `-v2` / `-attemptN` files.

## Scope tested

Epic Preview live Pass 1 retest after CEO fixed Preview `RESEND_FROM_EMAIL` + redeploy:

1. **Part A `members-0003`** — health, newsletter subscribe + Mailosaur OTP confirm, preference lookup, hero Subscribe → `#contact`, invalid unsub landing  
2. **Part B `members-0005`** — live member login OTP (Mailosaur) → session stub → logout; `grantsAdmin: false`; non-member rejection  

**Explicitly stopped before** live Stripe Join Checkout (`members-0004`). Health `stripe: "missing"` expected — no Stripe secrets requested.

## Checklist results — Part A (`members-0003`)

| Area | Result | Notes |
|------|--------|-------|
| Health sanity | pass | `db.ok`, `resend/mailosaur/session: configured`, `stripe: missing` (expected) |
| Schema / Neon | pass | No 503 schema errors |
| Subscribe → Mailosaur OTP → confirm | pass | Resend send + Mailosaur OTP + confirm OK (prior 502 `MEMBERS_EMAIL_SEND_FAILED` cleared) |
| Preference lookup | pass | Live confirmed + seed newsletter preference readable |
| Hero Subscribe → `#contact` | pass | Homepage HTML |
| Invalid unsub landing | pass | Invalid/expired copy shown |

## Checklist results — Part B (`members-0005`)

| Area | Result | Notes |
|------|--------|-------|
| Seeded annual login OTP (`123456`) | fail (non-blocking) | Still `MEMBERS_OTP_INVALID` — seed challenge stale on Preview Neon; local `db:seed` hits parent Neon ≠ Preview deploy DB |
| Live Mailosaur login OTP | pass | Temporary admin roster promote of Mailosaur address → founding/active → `login/start` + Mailosaur OTP → verify; roster restored to newsletter-only after |
| Session stub + logout | pass | Session authenticated; logout cleared member session |
| `grantsAdmin: false` | pass | Session/profile report `grantsAdmin: false` |
| Non-member rejected clearly | pass | Mailosaur non-member → clear “No active membership…” messaging |
| Login UI (`#membership`) | pass | Homepage includes membership / login surface |

## Bugs found

- (none blocking)

Known residual (non-blocking for this pass): Preview seed OTP `123456` for `annual@ccvaa-seed.test` remains unusable until Preview Neon is re-seeded. Live path covered via Mailosaur + temporary admin promote (restored).

## Suggestions (non-blocking)

- Re-seed Preview Neon OTP for `annual@ccvaa-seed.test`, **or** seed one active member whose email is `@<MAILOSAUR_SERVER_ID>.mailosaur.net`, so future Pass 1 login E2E does not need admin promote.
- Health could validate `RESEND_FROM_EMAIL` format so “configured” does not mask Resend `from` rejections.

## FEATURES.md drift

None observed for newsletter / member login behavior exercised this run.

## Sign-off

**Pass 1:** **continue epic** — Parts A (`members-0003`) and B (`members-0005`) live OTP paths pass on Preview after Resend `from` fix. Epic stays open; do **not** merge to `main`.

**Stopped before Stripe** per CEO/PM pause — no Join Checkout testing; no Stripe secrets requested.

**Next (PM):** Decide non-Stripe tickets (`0006` / `0008` if needed) or pause for Stripe setup (`members-0004`).
