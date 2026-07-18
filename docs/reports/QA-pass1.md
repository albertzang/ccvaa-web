# QA report

**Pass:** 1 (pre-merge)  
**Backlog work ID:** `members-0022`  
**Environment(s) + exact URLs:**  
- Preview (tested): https://ccvaa-16d35ea02-azang-projects.vercel.app — tip deploy Ready ~21:45 PDT with `members-0022` UI (`Verify your email…` gate, Contact inquiry-only, Hero both → `#membership`). Deployment Protection bypass via `.env.local` (header and/or both `x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie=true`; bypass value omitted).  
- Handoff branch alias https://ccvaa-web-git-feat-members-azang-projects.vercel.app remained on a **pre-0022** deploy (Sign in/Join tabs + Contact `NewsletterForm` / Manage preference; `/api/members/verify/start` → 404). Same lag pattern as `members-0021`.  
**Branch / PR / commit:** `feat/members` · PR https://github.com/albertzang/ccvaa-web/pull/8 · impl tip expected `f264db1` · docs tip `9e0a2ab` · **tested deploy** `ccvaa-16d35ea02` / `dpl_4rh2XG1jg7nbmZzN7oB16V9L86k1` (verify APIs + 0022 markers present)  
**Date:** 2026-07-16  
**Result:** fail  
**Merge gate:** `epic` → **hold** (do **not** continue epic / merge)

**Save as:** `docs/reports/QA-pass1.md`

**Retest:** overwrite this same path. Do not create `-prior` / `-v2` / `-attemptN` files.

## Scope tested

`members-0022` on epic `feat/members` (handoff `HANDOFF-QA-pass1.md`):

1. Contact inquiry-only (no newsletter UI); email + mailing address  
2. Unverified `#membership` identity strip + glass gate; no toggle/Join until verified  
3. Verified portal: OTP verify (Mailosaur), newsletter default off, toggle on/off without OTP, name save, email change (Member ID stable), non-member Stripe Checkout  
4. Unsub token landing `/?unsub=<token>#membership` (valid + invalid)  
5. Hero Subscribe/Join → `#membership` + cohesive CTA/badge styling; desktop + mobile layout  

## Checklist results

| Area | Result | Notes |
|------|--------|-------|
| Preview bypass | pass | No Vercel wall with protection bypass |
| Preview deploy (tip) | pass-with-note | Branch alias stale; tested tip deploy URL with 0022 markers + `/api/members/verify/start` 200 |
| Contact inquiry-only | pass | No newsletter form / Manage preference; `info@ccvaa.ca` + Hazelbridge address present |
| Unverified identity strip | pass | Name + Email + Send code; `flex-col` / `lg:flex-row`; mobile stacked full-width (Playwright 390px) |
| Unverified glass gate | pass | Exact gate headline + “One code…” copy; no newsletter switch / Choose a plan until verified |
| Verify OTP (Mailosaur) | pass | `verify/start` + `verify/verify`; session cookie set; Member ID UUID; `plan=none` |
| Newsletter default off | pass | API `newsletterStatus=off`; browser `role=switch` `aria-checked=false` after verify |
| Newsletter toggle no OTP | pass | API on/off + `membershipUnchanged`; browser toggle on without second OTP |
| Name auto-save | pass | `PATCH /api/members/profile/name` 200 |
| Email change keeps Member ID | pass | `profile/email/start` + verify via Mailosaur; `sameId=true` |
| Non-member → Checkout | pass | `POST /api/members/join/checkout` `{plan:"annual"}` → Stripe `checkoutUrl` |
| Paid member → perks copy | blocked | Seed `login/start` works for `annual@ccvaa-seed.test` on Preview, but OTP is not Mailosaur-deliverable; valid unsub landing (which would open paid verified UI) is broken (see Bugs) |
| Invalid unsub | pass | Clear “invalid or has expired” + gate still shown; no fake session |
| Valid unsub landing | **fail** | Seed tokens redeem OK via `POST /api/members/newsletter/unsub`, but `GET /?unsub=<token>` returns **HTTP 500** (see Bugs) |
| Hero CTAs + badges | pass | Both `href="#membership"`; shared min-height/radius/typography; shared ocean badge bg; coral vs cream glass; accessible count labels retained |
| Responsive + contrast | pass | Desktop CTA pair + mobile stacked strip; readable cream/ocean badges on hero |

## Bugs found

1. **Severity: high — Valid `/?unsub=<token>` landing 500 (cookie set in RSC)**  
   - **URL:** https://ccvaa-16d35ea02-azang-projects.vercel.app/?unsub=seed-unsub-annual-member (also `seed-unsub-newsletter-only`)  
   - **Repro:** Open Preview with Deployment Protection bypass + set-bypass-cookie. Navigate to `/?unsub=seed-unsub-annual-member` (or `#membership`).  
   - **Expected:** Newsletter off, verified `#membership` UI, toggle off, success/already message (idempotent reload).  
   - **Actual:** HTTP 500 Next error page (`digest: 484893588`). Vercel logs: `Error: Cookies can only be modified in a Server Action or Route Handler` from `setMemberSessionCookie` during `resolveUnsubLanding` in `src/app/page.tsx`.  
   - **Contrast:** `POST /api/members/newsletter/unsub` with the same token returns `200` `{ ok: true, alreadyUnsubscribed: true, plan: "annual", … }` — redeem works; SSR cookie write fails. Invalid tokens still render correctly (no cookie write).  
   - **Source:** `qa`

## Suggestions (non-blocking)

- Branch alias `ccvaa-web-git-feat-members-…` again lagged behind tip (same as `members-0021`). Prefer handoff tip deploy URL or fix Git→Vercel alias promotion.  
- After unsub fix: retest paid-member “Membership perks coming soon…” via seed unsub landing (annual) or Mailosaur-reachable paid fixture.  
- Person-name schema rejects digits (by design); QA names must be letters/punctuation only.

## Sign-off

**Pass 1:** **hold** (Merge gate `epic` — do **not** continue epic until valid unsub landing is fixed and retested)
