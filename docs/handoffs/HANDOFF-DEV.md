# Handoff: Product Manager → Developer

**Date:** 2026-07-16  
**Requested by:** CEO / PM  
**Backlog work ID:** `members-0014` … `members-0018` (batch — implement in order below)  
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

CEO manual-test feedback on Members — five tickets on the same epic branch. Implement **in order**, commit as you go (one commit per work ID preferred), then overwrite **one** Pass 1 handoff covering the batch (or per-ticket if you split QA).

### Implement order

1. **`members-0017`** — Name required on newsletter; international-friendly name Zod/UI for newsletter + Join  
2. **`members-0015`** — Join + newsletter opt-in → **one** email OTP only (bug, Source ceo)  
3. **`members-0014`** — After Checkout success return, **auto-login** member session → profile  
4. **`members-0016`** — Hero Subscriber/Member counts as **annotations beside** Subscribe/Join buttons  
5. **`members-0018`** — Trim excessive UI notes on Join/newsletter/membership (keep CASL / separate-axes clarity)

## Acceptance criteria

See each item in `members-BACKLOG.md` (`0014`–`0018`). All must pass lint + typecheck. Update `FEATURES.md` for behavior changes (changelog date-desc).

## Out of scope

Merge to `main`; Production go-live (`0009`); ESP; changing Contact-only double opt-in model; Elements/Checkout redesign.

## Technical hints

- Join: `src/components/JoinForm.tsx`, `src/lib/members/join.ts`, webhook return `/?joined=1#membership`  
- Session: `members-0005` cookie helpers — reuse for post-Checkout login  
- Newsletter: `NewsletterForm.tsx`, `zod/newsletter.ts` (name currently optional)  
- Hero counters: `members-0007` CTA area  
- Copy: `site` / membership & newsletter content modules  
- Load `ccvaa-dev-memory` for auth/session pitfalls  
- Preview already has Stripe/Resend/Mailosaur/session configured

## Git / deploy

Reuse `feat/members` / PR #8. Pull tip first. PM authorizes commit/push. **Do not merge.**

## Done means

All five acceptance lists met on branch; Pass 1 handoff ready (`HANDOFF-QA-pass1.md`); **PR not merged**.
