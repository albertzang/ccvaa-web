# Handoff: Developer / PM → QA

**Date:** 2026-07-16  
**Pass:** `1`  
**Backlog work ID:** `members-0014`, `members-0015`, `members-0016`, `members-0017`, `members-0018`  
**Ship path that led here:** `feature-branch`  
**Epic branch:** `feat/members`  
**Merge gate:** `epic`  
**Filled by:** Developer  

**Save as:** `docs/handoffs/HANDOFF-QA-pass1.md`

**Branch name:** `feat/members`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/8  
**Commit:** `5f2050a` (tip of `feat/members`)  
**Preview URL:** https://ccvaa-web-git-feat-members-azang-projects.vercel.app  
**Preview protection:** both `x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie=true` from `.env.local` (`PREVIEW_PROTECTION.md`). Never paste secret.

**Out of scope:** https://ccvaa.ca/ · merge to `main` · Production live keys

## Batch SHAs (implement order)

| Work ID | SHA | Summary |
|---------|-----|---------|
| `members-0017` | `4e62b4b` | Name required on newsletter; shared international `personNameSchema` |
| `members-0015` | `78a2884` | Join + newsletter opt-in → one OTP; webhook activates newsletter |
| `members-0014` | `f68d805` (+ `5f2050a` lint follow-up) | Checkout return auto member session → profile |
| `members-0016` | `a57a64a` | Hero counts as annotations beside Subscribe/Join |
| `members-0018` | `8ab184d` | Trim excessive UI notes; keep CASL / ≠membership |

## Environments to test this pass

- [ ] Dev — http://localhost:3000/ (optional)
- [ ] Preview — https://ccvaa-web-git-feat-members-azang-projects.vercel.app (required)
- [ ] Production — n/a (Pass 1)

## What changed

CEO feedback batch on epic `feat/members`:

1. **0017** — Newsletter Name required; Unicode-friendly name Zod for newsletter + Join + profile  
2. **0015** — Join with newsletter checked sends **one** email-verify OTP only (no second newsletter confirm)  
3. **0014** — After Checkout success (`/?joined=1&session_id=…#membership`), auto-login via `POST /api/members/join/session` → profile (polls if webhook pending)  
4. **0016** — Hero subscriber/member counts sit beside CTAs  
5. **0018** — Shorter Join/newsletter/membership copy; CASL + newsletter≠membership kept

## Focus checklist

### members-0017
- [ ] Contact subscribe: Name required (UI + API); rejects empty/whitespace
- [ ] Accepts diacritics / non-Latin letters within max length; Join name uses same rules

### members-0015
- [ ] Join with newsletter checked → **one** OTP email only (Mailosaur)
- [ ] After verify + Checkout success, newsletter is `on` without a second confirm mail
- [ ] Join without newsletter → membership-only path unchanged
- [ ] Contact-only subscribe still double opt-in

### members-0014
- [ ] Successful Checkout return → signed-in `#membership` profile (no separate login)
- [ ] Session does not grant `/admin`
- [ ] If webhook is slow: activating message / poll, then profile or clear timeout + sign-in fallback

### members-0016
- [ ] Counts appear as annotations beside Subscribe / Join (not a heavy strip)
- [ ] Live counts; zeros OK; desktop + mobile readable

### members-0018
- [ ] Join / newsletter / membership chrome less note-heavy
- [ ] CASL consent + newsletter≠membership still clear

### Sign-off
- [ ] Lint/typecheck if feasible
- [ ] Sign-off **continue epic** / **hold** / **retest** — **do not merge**

## Known risks / flaky areas

- Webhook race on Join return (auto-session polls ~8×1.5s; timeout falls back to sign-in)
- Stripe Test mode + Mailosaur OTP timing
- Preview deploy must include latest tip before live Checkout retest

## Preview env notes (Pass 1)

Health should show db / Resend / Stripe / session configured. Use Mailosaur for OTPs. Stripe Test card: `4242 4242 4242 4242`.

## Report back with

`docs/templates/qa-report.md` → overwrite `docs/reports/QA-pass1.md`. Commit + push on `feat/members`.  

Pass 1: **continue epic** / **hold** / **retest** (Merge gate `epic` — **do not merge**).
