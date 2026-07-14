# Handoff: Product Manager → Developer

**Date:** 2026-07-14  
**Requested by:** CEO / PM  
**Backlog work ID:** `members-0003`  
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

Contact `#contact` owns the **Newsletter** axis: subscribe (double opt-in via Resend), manage preference (including paid members), and tokenized unsubscribe landing (`/?unsub=<token>#contact`). Unsub must **never** cancel membership. ESP sync stubs OK until provider chosen. Hero Subscribe should anchor to `#contact`.

## User value

Public can join/leave the mailing list without conflating newsletter with paid membership.

## Acceptance criteria

- [ ] Contact UI for newsletter-only people and paid members’ preference
- [ ] Double opt-in via Resend/OTP helpers; unconfirmed do not count toward subscriber count; ESP sync stub or real if env present
- [ ] Unsub token → `/#contact` (or `/?unsub=<token>#contact`); idempotent; membership unchanged; ESP footer URL documented
- [ ] CASL-friendly copy; does not treat newsletter as a membership plan
- [ ] FEATURES.md Contact → Newsletter updated
- [ ] Lint + typecheck clean; on `feat/members`; Pass 1 handoff updated; **do not merge**

## Out of scope

Join Checkout (`members-0004`); `#membership` profile (`members-0006`); merge to `main`.

## Technical hints

- Reuse `members-0001` schema + `members-0002` confirm/OTP/Resend helpers
- Match existing Contact section patterns in homepage (`src/lib/site.ts`, page components)
- Homepage order: Nav → Hero → `#membership` → About → Contact → Footer (Membership slot may still be stub/placeholder until 0004)
- Fail closed without DB/Resend where required; stub ESP with clear “not configured” behavior
- Product model: Newsletter ⊥ Membership
- Notify **PM** if blocked on secrets (do not ping CEO)

## Design / UX constraints

Match coastal theme; minimal scope; no card-heavy clutter in Contact. Brand-first page patterns already on site.

## Git / deploy expectations

### Epic lane

- Reuse **`feat/members`** + PR #8
- **PM authorizes** commit + push; **do not merge**
- Overwrite `docs/handoffs/HANDOFF-QA-pass1.md` when ready

## Done means

Acceptance + lint/typecheck; Pass 1 handoff ready; PR not merged
