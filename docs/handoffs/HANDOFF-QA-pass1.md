# Handoff: Developer / PM → QA

**Date:** 2026-07-16  
**Pass:** `1`  
**Backlog work ID:** `members-0020`  
**Ship path that led here:** `feature-branch`  
**Epic branch:** `feat/members`  
**Merge gate:** `epic`  
**Filled by:** Developer  

**Save as:** `docs/handoffs/HANDOFF-QA-pass1.md`

**Branch name:** `feat/members`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/8  
**Commit:** `203eec1`  
**Preview URL:** https://ccvaa-web-git-feat-members-azang-projects.vercel.app  
**Preview protection:** both `x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie=true` from `.env.local` (`PREVIEW_PROTECTION.md`). Never paste secret.

**Out of scope:** https://ccvaa.ca/ · merge to `main` · newsletter move · Stripe/Checkout/API/schema changes · counter definitions

## Environments to test this pass

- [ ] Dev — http://localhost:3000/ (optional)
- [ ] Preview — https://ccvaa-web-git-feat-members-azang-projects.vercel.app (required; wait for deploy of tip)
- [ ] Production — n/a (Pass 1)

## What changed

`members-0020` on epic `feat/members`:

1. **Membership section:** title/subtitle removed (logged out and logged in); section uses `aria-label="Membership"`
2. **Logged out tabs:** **Sign in** (left, default) | **Join** (right); only active panel visible
3. **Join:** form title/subtitle and visible “Choose a plan” removed; offered plans in responsive two-column grid (stacks on narrow screens); plan legend is `sr-only`
4. **Logged in profile:** summary-first — name/email edit revealed on demand; plan + Annual anniversary/renewal kept; future-perks placeholder and `/admin` note removed; feedback + sign-out preserved
5. **Hero badges:** compact `K`/`M`/`B` display; bounded badge (no overflow); exact counts in CTA `aria-label`; ocean/coral brand contrast (not black-on-white)
6. Newsletter remains in Contact only

## Focus checklist

### Membership UI
- [ ] No Membership section title/subtitle when logged out or logged in
- [ ] Tabs: Sign in left/default; Join right; mutual exclusivity of panels
- [ ] Join: no title/subtitle; no visible “Choose a plan”; two-column plan grid on desktop; stacks on narrow mobile
- [ ] Logged in: materially less cluttered; can still edit name, change email (OTP), see plan/renewal, see feedback, sign out
- [ ] Future-perks placeholder and `/admin` note absent
- [ ] Newsletter UI still only under Contact (`#contact`)

### Hero badges
- [ ] Compact notation for large values (`K`/`M`/`B`); badge stays circular/bounded without overflow
- [ ] Exact count still in Subscribe/Join `aria-label`
- [ ] Brand ocean/coral treatment (not plain black on white); readable on both CTAs
- [ ] Anchors still `#contact` / `#membership`
- [ ] Desktop + mobile

### Sign-off
- [ ] Lint/typecheck if feasible
- [ ] Sign-off **continue epic** / **hold** / **retest** — **do not merge**

## Known risks / flaky areas

- Preview deploy must include the latest tip before visual check
- Logged-in profile needs a member session (OTP) to exercise progressive disclosure
- Extremely large compact strings may truncate inside the bounded badge; exact value remains in `aria-label`

## Preview env notes (Pass 1)

Admin mail auth needs Preview Deployment Protection bypass if testing `/admin` on Preview. Member OTP / Stripe not required for most UI checks; session needed for logged-in profile declutter verification.

## Report back with

`docs/templates/qa-report.md` → save as `docs/reports/QA-pass1.md`  
Bugs → list in QA report for PM triage.  

Pass 1 (Merge gate `epic`): **continue epic** / **hold** / **retest** — **do not merge**
