# Handoff: Product Manager → Developer

**Date:** 2026-07-16  
**Requested by:** CEO / PM  
**Backlog work ID:** `members-0021`  
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

## Goal

Reshape Contact newsletter UI and unsubscribe UX:

1. Replace Subscribe / Manage preference with Membership-style tabs: **Subscribe** | **Unsubscribe** (one panel visible).
2. Unsubscribe = email + Unsubscribe only — no “Check preference” / lookup step. Backend returns clear messages for subscribed→off, already off, unknown/invalid; never cancel membership.
3. One-click from email: `/?unsub=<token>#contact` lands on Contact newsletter, activates **Unsubscribe** tab, prefills email, auto-runs unsub, shows result (idempotent). Invalid/expired token still shows clear message on that tab.
4. Keep subscribe double opt-in + required name unless layout-only changes need copy tweaks.
5. Update FEATURES.md and `docs/members/esp.md` for the new landing UX.

## Acceptance criteria

See full list under `members-0021` in the backlog. Also:

- [ ] Match tab chrome pattern from Membership (`members-0019` / `0020`) where practical
- [ ] Lint + typecheck; Pass 1 handoff overwritten; **do not merge**

## Out of scope

Moving newsletter into Membership; ESP provider (`0009`); changing double opt-in; merge milestone.

## Technical hints

- `NewsletterForm.tsx`, Contact section, `src/lib/members/newsletter.ts`, unsub token redeem, preference API
- Token landing is currently server-redeemed — preserve security/idempotency while presenting Unsubscribe-tab UX (email from member record after redeem)
- Manual unsub may call existing unsubscribe action with clearer client messaging; avoid requiring lookup first
- Pull tip of `feat/members` first

## Git / deploy

Reuse `feat/members` / PR #8. PM authorizes commit/push. **Do not merge.**

## Done means

Acceptance met on Preview-ready tip; `HANDOFF-QA-pass1.md` for `members-0021`; PR not merged.
