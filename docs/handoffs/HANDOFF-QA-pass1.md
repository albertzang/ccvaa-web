# Handoff: Developer → QA

**Date:** 2026-07-14  
**Pass:** `1`  
**Backlog work ID:** `members-0007`  
**Ship path that led here:** `feature-branch`  
**Epic branch:** `feat/members`  
**Merge gate:** `epic`  
**Filled by:** Developer  

**Save as:** `docs/handoffs/HANDOFF-QA-pass1.md`

**Branch name:** `feat/members`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/8  
**Commit:** tip of `feat/members` after members-0007 push  
**Preview URL:** https://ccvaa-web-git-feat-members-azang-projects.vercel.app  
**Preview protection:** QA reads `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local`. Browser Pass 1: both bypass query **and** `x-vercel-set-bypass-cookie=true`. See `docs/protocols/PREVIEW_PROTECTION.md`.  
**Production URL:** https://ccvaa-web.vercel.app/ (Pass **2** only)

**Post-merge cleanup (Pass 2 only):** n/a until **merge milestone**

**Out of scope for QA:** https://ccvaa.ca/

## What changed

Hero **Subscribe** + **Join** CTAs now show live dual-axis counters beneath each button: confirmed newsletter subscribers (Subscribe → `#contact`) and active paid members (Join → `#membership`). Labels keep the mailing list separate from paid membership. Counts stub to zero when the members DB is unavailable.

## Focus checklist

- [ ] Hero shows **Subscribe** (coral) linking to `#contact` and **Join** (outline) linking to `#membership`
- [ ] Subscribe counter labeled “Newsletter subscribers”; Join counter labeled “Paid members”
- [ ] Counters do not imply newsletter is a membership plan
- [ ] With `DATABASE_URL` + migrated Neon: counts reflect seeded/live data (newsletter `on`; paid `membership_status = active`)
- [ ] Without DB (or unset `DATABASE_URL`): homepage loads; both counters show `0`
- [ ] Hero stays brand-first — no forms or extra chrome in the viewport
- [ ] Lint + typecheck clean on branch
- [ ] Sign-off **continue epic** — **do not merge**

## Known risks

- Live non-zero counts need Preview `DATABASE_URL` + migrate/seed; Dev without DB should show zeros
- Prior epic tickets (`members-0004`–`0006`) unchanged; regression spot-check Join/profile if time permits

## Report back with

Overwrite `docs/reports/QA-pass1.md`. Commit + push on `feat/members`.
