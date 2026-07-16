# QA report

**Pass:** 1 (pre-merge)  
**Backlog work ID:** `members-0020`  
**Environment(s) + exact URLs:** Preview https://ccvaa-web-git-feat-members-azang-projects.vercel.app (Deployment Protection bypass via `.env.local`; both `x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie=true`; bypass value omitted).  
**Branch / PR / commit:** `feat/members` · PR https://github.com/albertzang/ccvaa-web/pull/8 · tip `0615132` (impl `203eec1`; Preview deploy Ready — CLI redeploy aliased to branch URL after GitHub webhook lag)  
**Date:** 2026-07-16  
**Result:** pass  
**Merge gate:** `epic` → **continue epic** (do **not** merge)

**Save as:** `docs/reports/QA-pass1.md`

**Retest:** overwrite this same path. Do not create `-prior` / `-v2` / `-attemptN` files.

## Scope tested

`members-0020` on epic `feat/members` (handoff `HANDOFF-QA-pass1.md`):

1. Membership section title/subtitle absent logged out and logged in (`aria-label="Membership"` only)
2. Logged-out tabs: **Sign in** left/default | **Join** right; one panel visible
3. Join: no title/subtitle; “Choose a plan” `sr-only` (not visually shown); plans two-column at ≥`sm`, stack on 390px
4. Logged-in profile declutter: summary-first name/email edit; plan + Annual anniversary/renewal; no future-perks / `/admin` note; sign-out
5. Hero compact badges: circular ocean/coral brand treatment; exact counts in `aria-label`; anchors `#contact` / `#membership`
6. Newsletter remains under Contact only
7. Desktop + mobile; `tsc --noEmit` clean

## Checklist results

| Area | Result | Notes |
|------|--------|-------|
| Preview bypass | pass | No Vercel wall with both bypass params |
| Preview deploy | pass | Tip `0615132` / impl `203eec1` Ready on branch alias (CLI redeploy after auto-deploy lag) |
| Section title/subtitle (logged out) | pass | No visible `h2`; section `aria-label="Membership"` |
| Tabs Sign in \| Join | pass | Sign in left + `aria-selected=true` by default; Join right |
| Tab mutual exclusivity | pass | Only active tabpanel visible (`hidden` / `display:none` on inactive) |
| Join title / “Choose a plan” | pass | No Join headings; legend `sr-only` (1×1 clipped; not visually shown) |
| Join plan grid | pass | `sm:grid-cols-2` → 2 cols @1280; 1 col @390 |
| Newsletter placement | pass | Newsletter under `#contact`; no Newsletter heading in `#membership` |
| Hero Subscribe badge | pass | Circle `8`, ocean-950 on coral CTA; `aria-label="Subscribe, 8 Newsletter subscribers"`; `#contact` |
| Hero Join badge | pass | Circle `9`, coral on glass CTA; `aria-label="Join, 9 Paid members"`; `#membership` |
| Compact K/M/B | pass | Counts 8/9 correctly plain digits; compact formatter present for large values; badge `max-w` + truncate bounds overflow |
| Badge brand styling | pass | Not black-on-white; ocean / coral contrast on both CTAs |
| Desktop viewport | pass | 1280×900 |
| Mobile viewport | pass | 390×844: stacked plans; badges bounded |
| Logged-in profile declutter | pass | Mailosaur OTP session (Founding + Annual); no tabs/`h2`; Edit/Change on demand; plan visible; no future-perks or `/admin` note |
| Annual renewal | pass | Anniversary + Next renewal shown for Annual plan |
| Name edit / sign-out | pass | Edit reveals name input; Cancel returns; Sign out → Sign-in default tabs |
| Lint / typecheck | pass | `tsc --noEmit` clean |
| FEATURES.md | pass | Changelog notes members-0020 declutter + compact badges |

## Bugs found

- (none)

## Suggestions (non-blocking)

- GitHub→Vercel auto Preview for tip `0615132` lagged (~10+ min with no new deployment). QA unblocked with `vercel deploy --target=preview` + branch alias. Worth checking the Vercel Git integration if this recurs.

## Sign-off

**Pass 1:** **continue epic** — do **not** merge to `main`
