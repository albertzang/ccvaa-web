# QA report

**Pass:** 1 (pre-merge)  
**Backlog work ID:** `members-0007`  
**Environment(s) + exact URLs:** Preview https://ccvaa-web-git-feat-members-azang-projects.vercel.app (Deployment Protection bypass via `.env.local`; both `x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie=true`; bypass value omitted from report). API/HTML checks used header `x-vercel-protection-bypass`.  
**Branch / PR / commit:** `feat/members` · PR https://github.com/albertzang/ccvaa-web/pull/8 · `4e0216a`  
**Date:** 2026-07-14  
**Result:** pass

**Save as:** `docs/reports/QA-pass1.md`

**Retest:** overwrite this same path. Do not create `-prior` / `-v2` / `-attemptN` files.

## Scope tested

`members-0007` — Hero **Subscribe** + **Join** CTAs with live dual-axis counters beneath each button. Epic Preview after `4e0216a`. Merge gate **epic** — sign-off **continue epic** (not merge to `main`).

Cursor browser MCP tabs unavailable; UI verified via bypassed HTML fetch (`x-vercel-cache: MISS` on fresh fetch). Lint + typecheck on branch tip.

## Checklist results

| Area | Result | Notes |
|------|--------|-------|
| Preview protection bypass | pass | Both query params; CCVAA homepage loads; not Vercel login wall |
| Hero **Subscribe** (coral) → `#contact` | pass | SSR: `href="#contact"`, `bg-coral`, label “Subscribe” |
| Hero **Join** (outline) → `#membership` | pass | SSR: `href="#membership"`, `border-white/40 bg-white/10`, label “Join” |
| Subscribe counter label | pass | “**0** Newsletter subscribers” beneath Subscribe CTA |
| Join counter label | pass | “**0** Paid members” beneath Join CTA |
| Dual-axis separation | pass | Distinct labels; `#membership` copy states “Newsletter signup stays in Contact”; no conflation in hero |
| Counters stub without DB data | pass | Both show `0`; homepage loads (33967-byte SSR, no error page) |
| Hero brand-first | pass | No `<form>` in hero; eyebrow/headline/subheadline + two CTA/counter pairs only |
| Homepage regression smoke | pass | Nav/logo, `#membership` sign-in, `#about`, `#contact`, favicon present |
| `npm run lint` + `typecheck` | pass | Clean on `feat/members` @ `4e0216a` |
| Do not merge (epic) | n/a | Confirmed |

## Bugs found

- (none new for `members-0007`)

**Note (known epic infra):** Non-zero live counts require Preview `DATABASE_URL` + migrated/seeded Neon. Counters correctly stub to `0` on current Preview (shared schema gap from prior tickets). Not a `members-0007` defect.

## Suggestions (non-blocking)

- After Preview migrate + seed, spot-check non-zero counts reflect newsletter `on` and `membership_status = active` rows.
- Browser MCP was unavailable this pass; interactive anchor scroll smoke optional on retest.

## FEATURES.md drift

None observed. Hero section matches FEATURES.md dual-axis counter spec (`members-0007`).

## Sign-off

**Pass 1:** **continue epic** — `members-0007` hero CTAs, dual-axis counter labels, zero stubs, and brand-first layout verified on Preview. Epic stays open; do **not** merge to `main`.
