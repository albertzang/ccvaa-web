# Handoff: Developer / PM → QA

**Date:** 2026-07-16  
**Pass:** `1`  
**Backlog work ID:** `members-0019`  
**Ship path that led here:** `feature-branch`  
**Epic branch:** `feat/members`  
**Merge gate:** `epic`  
**Filled by:** Developer  

**Save as:** `docs/handoffs/HANDOFF-QA-pass1.md`

**Branch name:** `feat/members`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/8  
**Commit:** `030f96b`  
**Preview URL:** https://ccvaa-web-git-feat-members-azang-projects.vercel.app  
**Preview protection:** both `x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie=true` from `.env.local` (`PREVIEW_PROTECTION.md`). Never paste secret.

**Out of scope:** https://ccvaa.ca/ · merge to `main` · moving newsletter into Membership · Checkout/Elements changes

## Environments to test this pass

- [ ] Dev — http://localhost:3000/ (optional)
- [ ] Preview — https://ccvaa-web-git-feat-members-azang-projects.vercel.app (required)
- [ ] Production — n/a (Pass 1)

## What changed

`members-0019` on epic `feat/members`:

1. **`#membership` tabs (logged out):** **Join** | **Sign in**, Join default — only the active form is visible
2. **Logged in:** profile only (no tabs)
3. **Newsletter** remains in Contact only (not moved)
4. **Hero:** subscriber / member counts are **numeric circle badges** on the **top-right** of Subscribe / Join (replaces beside-button annotations); counts in CTA `aria-label`

## Focus checklist

### Tabs
- [ ] Logged out `#membership`: tabs Join | Sign in; **Join selected by default**
- [ ] Switching tabs shows only one form (mutual exclusivity)
- [ ] Logged in: profile only — no Join/Sign-in tabs
- [ ] Newsletter UI still only under Contact (`#contact`)

### Hero badges
- [ ] Subscribe shows numeric circle badge top-right (subscriber count)
- [ ] Join shows numeric circle badge top-right (paid member count)
- [ ] Old beside-button annotation layout gone
- [ ] Accessible: count included in link accessible name / not color-only
- [ ] Desktop + mobile readable; zeros OK if DB empty
- [ ] Anchors still `#contact` / `#membership`

### Sign-off
- [ ] Lint/typecheck if feasible
- [ ] Sign-off **continue epic** / **hold** / **retest** — **do not merge**

## Known risks / flaky areas

- Preview deploy must include the latest tip before visual check
- Large count values may widen the badge slightly (min-width + padding)

## Preview env notes (Pass 1)

Admin mail auth needs Preview Deployment Protection bypass if testing `/admin` on Preview (mailbox login in iframe). Member OTP / Stripe not required for this UI-only ticket unless spot-checking Join/Sign-in still work.

## Report back with

`docs/templates/qa-report.md` → save as `docs/reports/QA-pass1.md`  
Bugs → list in QA report for PM triage.  

Pass 1 (Merge gate `epic`): **continue epic** / **hold** / **retest** — **do not merge**
