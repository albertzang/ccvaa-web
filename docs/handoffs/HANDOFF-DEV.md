# Handoff: Product Manager → Developer

**Date:** 2026-07-14  
**Requested by:** CEO / PM  
**Backlog work ID:** `members-0005`  
**Backlog link:** `docs/product/backlogs/members-BACKLOG.md`  
**Priority:** now  
**Iteration:** `1`

**Save as:** `docs/handoffs/HANDOFF-DEV.md`

## Verifier & Ship path

**Verifier:** `agent`  
**Verify passes:** `pass1+pass2`  
**Ship path:** `feature-branch`  
**Epic branch:** `feat/members`  
**Merge gate:** `epic`

**CEO approved direct-to-main?** n/a  

## Goal

Member email OTP login for the public site `#membership` wall: 6-digit OTP via Resend → httpOnly member session + logout. DB-backed challenges (reuse `members-0002` helpers). Does **not** grant `/admin`. Enables Join → profile transition for later `members-0006`.

## User value

Paid (or seeded) members can open the membership profile side of `#membership` without admin auth.

## Acceptance criteria

- [ ] Login from/near `#membership`; OTP send + verify → httpOnly session; logout
- [ ] Zod; rate limits/expiry documented; session never grants `/admin`
- [ ] FEATURES.md Member auth updated
- [ ] Lint + typecheck clean; push on `feat/members`; Pass 1 handoff updated
- [ ] **Do not merge**

## Out of scope

OAuth; passwords; admin auth; join/subscribe form redesign (`0003`/`0004`); full profile chrome (`0006`).

## Technical hints

- Reuse: `src/lib/members/otp-challenges.ts`, `confirm.ts`, `resend.ts` from `0002`
- Seeded members available via `npm run db:seed` for QA without live Join
- Preview already has `DATABASE_URL`; CEO still adding Resend — fail closed without `RESEND_*`
- Cookie/session: httpOnly, secure in production, same-site appropriate; do not touch Hover admin session
- Related: next ticket `members-0006` profile UI depends on this session

## Design / UX constraints

Minimal login wall near `#membership`; match coastal theme; keep Join UI for logged-out.

## Git / deploy expectations

- Reuse **`feat/members`** + PR #8  
- PM authorizes commit/push; **do not merge**  
- Overwrite `docs/handoffs/HANDOFF-QA-pass1.md` when ready

## Done means

Acceptance met; Pass 1 handoff ready; **PR not merged**
