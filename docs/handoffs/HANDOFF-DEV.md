# Handoff: Product Manager → Developer

**Date:** 2026-07-14  
**Requested by:** CEO / PM  
**Backlog work ID:** `members-0008`  
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

Replace Admin **Members** scaffold with a real roster gated by Hover **mail-session** (same as existing `/admin`). Filter/search by **plan** and **newsletter-on** as separate axes. Update/delete with confirmation. Show plan, status, newsletter flag, Annual anniversary/next renewal. Zod on mutations. No impersonation.

## Acceptance criteria

- [ ] List / search / filter (plan + newsletter as separate concerns)
- [ ] Confirm UX for update/delete; Zod on payloads
- [ ] Annual anniversary / next renewal visible when applicable
- [ ] Mail-session gated (unauthenticated visitors cannot mutate)
- [ ] FEATURES.md Admin → Members updated
- [ ] Lint + typecheck; on `feat/members` / PR #8; Pass 1 handoff ready; **do not merge**

## Out of scope

Impersonation (`members-0013`); Events/Financial; public CTAs; merge to `main`.

## Technical hints

- Admin chrome: mail-session probe / existing Members nav entry
- Load ccvaa-dev-memory for admin/auth patterns
- Fail closed without DB; Preview may still have Neon branch migrate gap — still ship UI + APIs
- Notify **PM** if blocked on secrets (do not ping CEO)

## Design / UX constraints

Match existing admin console patterns (dark sidebar). Keep roster usable; avoid decorative card clutter.

## Git / deploy

Reuse `feat/members` + PR #8. PM authorizes commit/push; **do not merge**.

## Done means

Acceptance + lint/typecheck; Pass 1 handoff ready; PR not merged
