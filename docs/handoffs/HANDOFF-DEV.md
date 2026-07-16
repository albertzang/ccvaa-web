# Handoff: Product Manager → Developer

**Date:** 2026-07-16  
**Requested by:** CEO / PM  
**Backlog work ID:** `members-0020`  
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

Simplify the public Membership experience following CEO manual testing:

1. Remove the Membership section title/subtitle in both auth states.
2. Logged out: tabs become **Sign in** (left/default) | **Join** (right).
3. Join: remove title/subtitle and visible “Choose a plan”; use a responsive two-column plan grid.
4. Logged in: materially declutter the profile while preserving all real account actions and plan/renewal data.
5. Hero count badges: compact `K` / `M` / `B` display, exact accessible count, brand-consistent high-contrast styling.

## Acceptance criteria

Use the complete list under `members-0020`. In particular:

- [ ] Logged-in profile keeps name edit, email re-verification, plan/annual dates, feedback, and sign-out
- [ ] Use summary-first/progressive disclosure for secondary account edits
- [ ] Remove future-perks placeholder and `/admin` note
- [ ] Compact badges do not overflow at large values; exact counts stay in CTA `aria-label`
- [ ] Mobile and desktop; lint + typecheck; FEATURES.md + date-desc changelog
- [ ] Overwrite `HANDOFF-QA-pass1.md`; **do not merge**

## Out of scope

Newsletter placement; Stripe/Checkout behavior; schema/API behavior; counter definitions; merge milestone.

## Technical hints

- `MembershipSection.tsx`: remove section heading copy and reconsider excess vertical spacing
- `MembershipPanel.tsx`: default tab + order
- `JoinForm.tsx`: remove duplicate headings/legend; responsive plan grid
- `MemberProfileForm.tsx`: preserve functionality but flatten hierarchy; hide secondary edit forms until invoked
- `Hero.tsx`: `Intl.NumberFormat` compact notation can format K/M/B; constrain badge dimensions and keep exact-value `aria-label`
- Keep existing CCVAA ocean/coral palette and WCAG contrast

## Git / deploy

Reuse `feat/members` / PR #8. Pull tip first. PM authorizes commit/push. **Do not merge.**

## Done means

Acceptance met on Preview-ready tip; `HANDOFF-QA-pass1.md` overwritten for `members-0020`; PR not merged.
