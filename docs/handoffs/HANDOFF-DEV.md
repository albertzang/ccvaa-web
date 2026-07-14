# Handoff: Product Manager → Developer

**Date:** 2026-07-14  
**Requested by:** CEO / PM  
**Backlog work ID:** `members-0002`  
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

Add Resend transactional send path plus shared confirm + OTP helpers (DB challenges, expiry, rate limits) on top of `members-0001`. Document Mailosaur for Preview QA. Update `.env.example` only for secrets (never commit real keys).

## User value

Enables later newsletter confirm and membership login OTP without building public forms yet.

## Acceptance criteria

- [ ] Resend send path works on Dev/Preview with test keys (fail closed if `RESEND_API_KEY` missing)
- [ ] Confirm + OTP helpers: create/verify challenges against DB, expiry, rate limits
- [ ] Mailosaur notes for Preview QA; `.env.example` updated (Resend + Mailosaur placeholders)
- [ ] Lint + typecheck clean; commits on `feat/members`; update Pass 1 handoff Preview URL if needed
- [ ] **Do not merge** (Merge gate `epic`)

## Out of scope

Public forms; Stripe; admin roster; full ESP API; merge to `main`.

## Technical hints

- Builds on: `src/db/`, `src/lib/members/`, OTP/challenge schema from `members-0001`
- Reuse shared Zod modules; add thin Resend client + helpers under `src/lib/members/`
- Env: `RESEND_API_KEY`, from address; Mailosaur server/key for QA docs only
- If blocked on secrets → tell **PM** what CEO must set (do not ping CEO)
- Related: FEATURES Members (planned); Next ticket likely `members-0003` public newsletter

## Design / UX constraints

n/a (no public UI)

## Git / deploy expectations

### Ship path = `feature-branch` + Epic + Merge gate `epic`

- Reuse **`feat/members`** + open PR #8 — do not create a new branch
- **PM authorizes** commit + push on epic branch; **do not merge**
- After ship: overwrite `docs/handoffs/HANDOFF-QA-pass1.md` with current Preview URL + focus for this ticket; notify PM

## Done means

Lint/typecheck clean; PR #8 updated; Pass 1 handoff ready; **PR not merged**
