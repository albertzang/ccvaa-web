# Handoff: Product Manager → Developer

**Date:** 2026-07-14  
**Requested by:** CEO / PM  
**Backlog work ID:** `members-0007`  
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

Hero **Subscribe** + **Join** with live counters (anchors only): Subscribe → `#contact`; Join → `#membership`. Counts: newsletter subscribers = confirmed newsletter-on; members = active paid. Stub zeros OK if DB unavailable; never imply newsletter is a membership plan.

## Acceptance criteria

- [ ] Hero shows Subscribe + Join CTAs with correct anchors
- [ ] Counters present and labeled for the two axes without conflating them
- [ ] Fail closed / stub zeros when DB missing — page still loads
- [ ] FEATURES.md Hero updated
- [ ] Lint + typecheck; on `feat/members` / PR #8; Pass 1 handoff updated; **do not merge**

## Out of scope

Forms in hero; Checkout; Contact form implementation; profile; merge to `main`.

## Technical hints

- Reuse existing hero in homepage; counts may use APIs/helpers from `0003`/`0001`
- Coastal brand; first viewport stays brand-first (don’t overload hero with extra chrome)
- Notify PM if blocked

## Git / deploy

Reuse `feat/members` + PR #8. PM authorizes commit/push; **do not merge**.

## Done means

Acceptance + lint/typecheck; Pass 1 handoff ready; PR not merged
