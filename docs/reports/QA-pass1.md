# QA report

**Pass:** 1 (pre-merge)  
**Backlog work ID:** `members-0019`  
**Environment(s) + exact URLs:** Preview https://ccvaa-web-git-feat-members-azang-projects.vercel.app (Deployment Protection bypass via `.env.local`; both `x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie=true`; bypass value omitted).  
**Branch / PR / commit:** `feat/members` · PR https://github.com/albertzang/ccvaa-web/pull/8 · tip `0ecf058` (impl `030f96b`; Preview deploy Ready, aliased to branch URL)  
**Date:** 2026-07-16  
**Result:** pass  
**Merge gate:** `epic` → **continue epic** (do **not** merge)

**Save as:** `docs/reports/QA-pass1.md`

**Retest:** overwrite this same path. Do not create `-prior` / `-v2` / `-attemptN` files.

## Scope tested

`members-0019` on epic `feat/members` (handoff `HANDOFF-QA-pass1.md`):

1. Logged-out `#membership`: **Join** | **Sign in** tabs; Join default; only active form visible; tab switch works  
2. Logged-in profile-only chrome — **not exercised** (no member session in this run; optional per handoff)  
3. Newsletter public UI remains under Contact (`#contact`), not Membership  
4. Hero: numeric circle badges top-right on Subscribe / Join; beside-button annotations gone; counts in `aria-label`; anchors `#contact` / `#membership`  
5. Desktop + mobile spot-check  

## Checklist results

| Area | Result | Notes |
|------|--------|-------|
| Preview bypass | pass | No Vercel wall with both bypass params |
| Preview deploy | pass | Ready; GitHub Preview deployment SHA `0ecf058` (includes `030f96b`) |
| `#membership` tabs (logged out) | pass | Tablist Join \| Sign in; Join `aria-selected=true` by default |
| Tab mutual exclusivity | pass | Join panel shows Join form; Sign in panel shows Member sign-in + email OTP; inactive panel `hidden` / `display:none` |
| Newsletter placement | pass | Newsletter heading + Subscribe/Manage under `#contact`; Membership copy points to Contact; no Newsletter heading in `#membership` (optional Join newsletter checkbox OK / out of scope) |
| Hero Subscribe badge | pass | Circle `8` at top-right (`-right-2 -top-2`); `aria-label="Subscribe, 8 Newsletter subscribers"` |
| Hero Join badge | pass | Circle `8` at top-right; `aria-label="Join, 8 Paid members"` |
| Beside annotations removed | pass | No sibling text annotation beside CTAs; hero text is Subscribe/Join + badge numerals only |
| Anchors | pass | Subscribe → `#contact`; Join → `#membership` |
| Desktop viewport | pass | 1280–1440 wide: tabs, badges, Contact newsletter readable |
| Mobile viewport | pass | 390×844: default Join; Sign in switch hides Join; badges ≥16px / readable |
| Logged-in profile-only | skip | No member session available this run |
| FEATURES.md | pass | Changelog already notes members-0019 tabs + Hero circle badges |

## Bugs found

- (none)

## Suggestions (non-blocking)

- Spot-check logged-in `#membership` (profile only, no Join/Sign-in tabs) on a later Pass 1 or Pass 2 when a member session is handy.

## Sign-off

**Pass 1:** **continue epic** — do **not** merge to `main`
