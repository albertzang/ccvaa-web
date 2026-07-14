# Handoff: Product Manager → Developer

**Date:** 2026-07-14  
**Requested by:** CEO / PM  
**Backlog work ID:** `members-0006`  
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

Logged-in face of `#membership` (same slot as Join/`members-0004`): profile showing name; email change requires re-verify OTP; Annual shows read-only anniversary / next renewal; light placeholder for future perks (`members-0012`). **No newsletter UI** here (that stays on `#contact`).

## User value

Paid members see and manage their membership identity after OTP login (`members-0005`).

## Acceptance criteria

- [ ] Paid session shows profile in `#membership` (perks area = light stub/placeholder OK)
- [ ] Name edit; email change requires OTP re-verify before identity update
- [ ] Annual renewal / anniversary dates when applicable (Founding/Lifetime: null/ignored)
- [ ] Zod on profile updates; FEATURES.md `#membership` updated
- [ ] Fail closed without DB/session; lint + typecheck clean
- [ ] On `feat/members` / PR #8; Pass 1 handoff updated; **do not merge**

## Out of scope

Billing portal; Join Checkout (`0004`); newsletter (`0003`); real perks catalog (`0012`); merge to `main`.

## Technical hints

- Depends on session from `members-0005`; Join UI from `0004` when logged out
- Homepage `#membership` slot — switch Join ↔ profile by session
- Reuse Resend/OTP helpers for email re-verify
- Notify **PM** if blocked on secrets (Preview still may lack migrate/seed)
- Related FEATURES: Members → `#membership` profile

## Design / UX constraints

Match coastal theme; one job for `#membership` when logged in (profile). No newsletter chrome here.

## Git / deploy expectations

Reuse **`feat/members`** + PR #8. **PM authorizes** commit/push; **do not merge**. Overwrite `HANDOFF-QA-pass1.md` when ready.

## Done means

Acceptance + lint/typecheck; Pass 1 handoff ready; PR not merged
