# QA report

**Pass:** 1 (pre-merge)  
**Backlog work ID:** `members-0021`  
**Environment(s) + exact URLs:**  
- Preview (tested): https://ccvaa-5n1rvpmc1-azang-projects.vercel.app — CLI redeploy of tip `ce89d4c` / impl `1d3ca6b` (Deployment Protection bypass via `.env.local`; header and/or both `x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie=true`; bypass value omitted).  
- Handoff branch alias https://ccvaa-web-git-feat-members-azang-projects.vercel.app remained on a **pre-0021** deploy (still showed **Manage preference**) after tip push; GitHub auto-Preview did not update within ~10m — QA triggered `vercel deploy` of local tip to unblock.  
**Branch / PR / commit:** `feat/members` · PR https://github.com/albertzang/ccvaa-web/pull/8 · tip `ce89d4c` · impl `1d3ca6b`  
**Date:** 2026-07-16  
**Result:** pass  
**Merge gate:** `epic` → **continue epic** (do **not** merge)

**Save as:** `docs/reports/QA-pass1.md`

**Retest:** overwrite this same path. Do not create `-prior` / `-v2` / `-attemptN` files.

## Scope tested

`members-0021` on epic `feat/members` (handoff `HANDOFF-QA-pass1.md` + `docs/members/esp.md`):

1. Contact newsletter tabs **Subscribe** | **Unsubscribe** (Membership-like pill tablist); one panel visible
2. Unsubscribe: email + Unsubscribe only (no preference lookup / Check preference)
3. Distinct messages: subscribed→off / already off / unknown; `membershipUnchanged`
4. Token landing `/?unsub=<token>#contact`: Unsubscribe tab, email filled, auto result, idempotent reload; invalid token message
5. Subscribe smoke: required name + double opt-in (Mailosaur)
6. Desktop SSR markers + `tsc --noEmit` clean

## Checklist results

| Area | Result | Notes |
|------|--------|-------|
| Preview bypass | pass | No Vercel wall with protection bypass |
| Preview deploy (tip) | pass-with-note | Branch alias stale; tested CLI Preview of tip `ce89d4c` / `1d3ca6b` |
| Tabs Subscribe \| Unsubscribe | pass | Home: Subscribe `aria-selected=true`, Unsubscribe `false`; token/invalid landings flip selection |
| One panel visible | pass | Inactive panel not rendered / `hidden`; unsubscribe email field only when Unsubscribe active |
| No Check preference / Manage preference | pass | Absent on tip Preview HTML |
| Unsubscribe email + button only | pass | `newsletter-unsub-email` + Unsubscribe submit; no lookup step |
| Manual unsub → off | pass | Fresh Mailosaur confirm then unsub → `outcome=unsubscribed`, membershipUnchanged |
| Manual already off | pass | Second unsub + `founding@ccvaa-seed.test` → `already_off` |
| Manual unknown | pass | Unknown address → `unknown` (“could not find…”) |
| Membership unchanged | pass | API `membershipUnchanged: true` for annual/lifetime/founding paths; unsub updates newsletter only |
| Token landing (seed) | pass | `seed-unsub-annual-member`: Unsubscribe selected, seed email in payload, success/already message |
| Token idempotent reload | pass | Reload same URL still shows already/success message |
| Invalid token | pass | Message “This unsubscribe link is invalid or has expired.” on Unsubscribe tab |
| Subscribe name required | pass | Missing name → 400 `MEMBERS_VALIDATION_ERROR` |
| Subscribe double opt-in | pass | Mailosaur: pending → confirm → `on` |
| Lint / typecheck | pass | `tsc --noEmit` clean |
| Desktop + mobile | pass-with-note | Responsive markup verified via SSR/API; interactive browser MCP tab unavailable this session — tab/panel behavior confirmed via RSC HTML (`aria-selected` / field presence) |

## Bugs found

- (none)

## Suggestions (non-blocking)

- Git → Vercel Preview for `feat/members` lagged after `members-0021` push (branch alias still served pre-0021 **Manage preference**). PM/Dev: confirm Vercel Git webhook / Ignored Build Step so the handoff alias tracks tip without CLI redeploy.
- Optional: re-seed `newsletter_status=on` for seed members after aggressive unsub QA so the next Pass 1 does not need a Mailosaur bootstrap for the fresh unsub path.

## Sign-off

**Pass 1:** **continue epic** (Merge gate `epic` — do **not** merge)
