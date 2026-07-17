# Handoff: Product Manager → Developer

**Date:** 2026-07-16  
**Requested by:** CEO / PM  
**Backlog work ID:** `members-0022`
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

Redesign `#membership` into one compact verified-email portal for identity, newsletter preference, and paid membership:

1. Move newsletter UI out of Contact; Contact keeps inquiry/message only.
2. Unverified state: responsive Name + Email + OTP identity strip over a branded glass gate panel. Name is required and international-friendly; persist it only when verification succeeds.
3. Verified state: same top strip manages Name (debounced auto-save) and email (new OTP required). Session identity is the UUID Member ID; email remains unique but is not the primary key.
4. Bottom panel: newsletter toggle (initial default **off**) plus Join Checkout for non-members, or “Membership perks coming soon…” for active paid members.
5. A verified session may toggle newsletter on/off without another OTP. Unsubscribe never changes paid membership.
6. Retarget token unsubscribe to `#membership`: valid token switches newsletter off, establishes/resumes the verified member session, and displays verified state with toggle off. Invalid/expired tokens show a clear message without faking verification.
7. Hero Subscribe and Join both target `#membership`.
8. Redesign the Hero Subscribe / Join buttons and counter badges as one cohesive coastal-brand CTA pair.

Gate copy direction:

- **“Verify your email to unlock the newsletter and membership.”**
- **“One code. Then subscribe, join, or both — on your terms.”**

## User value

Visitors verify their email once, then independently manage newsletter consent and paid membership from one clear, compact surface. Returning users retain stable identity even when their email changes.

## Acceptance criteria

- [ ] Contact has no newsletter subscribe/unsubscribe UI
- [ ] Unverified `#membership` has identity/OTP controls and branded glass gate message; no newsletter toggle or Join until verified
- [ ] Desktop identity controls are compact; mobile uses readable stacked/full-width controls rather than a cramped forced row
- [ ] Successful verification creates/upserts `members`; `members.id` remains UUID PK and the session subject; email remains unique
- [ ] Required Name accepts international scripts/common name punctuation; after verify, Name auto-saves with safe debounce/error feedback
- [ ] Email change requires successful OTP before update and preserves Member ID
- [ ] First verified newsletter state defaults **off**; on/off updates during an active verified session require no additional OTP
- [ ] Newsletter preference updates never alter paid membership
- [ ] Verified non-member sees existing Stripe Checkout plans; active paid member sees “Membership perks coming soon…”
- [ ] `/?unsub=<token>#membership` valid redeem is idempotent: newsletter off, verified session established/resumed, verified UI shown with toggle off
- [ ] Invalid/expired unsubscribe token shows a clear `#membership` result without a verified session
- [ ] Hero Subscribe and Join both target `#membership`; live counts and accessible labels retain their existing meanings
- [ ] Hero CTA pair uses a cohesive ocean/cream/coral treatment: replace the current disconnected coral/dark-badge versus glass/coral-badge pairing; buttons remain distinct but equally intentional
- [ ] CTA buttons share dimensions, typography, radius/border language, hover/focus behavior, and integrated badge placement; badges remain readable through compact K/M/B values
- [ ] CTA pair remains visually balanced when wrapping/stacking on narrow screens and meets accessible contrast
- [ ] Update `FEATURES.md`, the members backlog Product model, and `docs/members/esp.md`
- [ ] Lint + typecheck pass; prepare Pass 1 handoff; **do not merge**

## Out of scope

Real membership perks (`members-0012`); ESP provider selection or Production go-live (`members-0009`); Stripe Elements (retain Checkout); milestone merge.

## Technical hints

- Pull the current `feat/members` tip before implementation; preserve prior `members-0021` token security/idempotency while changing its destination and presentation.
- Likely UI: `src/components/MembershipPanel.tsx`, `MembershipSection.tsx`, `JoinForm.tsx`, `MemberLoginForm.tsx`, `MemberProfileForm.tsx`, `NewsletterForm.tsx`, Contact section, and `src/components/Hero.tsx`.
- Likely server/data: member session/OTP/profile/newsletter actions, unsubscribe token redeem, `src/db/schema.ts`, and `src/lib/site.ts`.
- Current schema already has `members.id` UUID PK and unique email. Prefer migration-free reuse unless implementation evidence proves a schema change is necessary.
- A token unsubscribe must authenticate only the token’s associated member; do not accept an arbitrary email or expose member data.
- Use the existing brand tokens in `src/app/globals.css`; avoid introducing a disconnected palette or generic purple glassmorphism.
- Relevant docs: `docs/members/esp.md`, `docs/product/FEATURES.md`, and the Product model at the top of `members-BACKLOG.md`.
- Env/secrets: no new secret is expected; do not commit `.env.local`.

## Design / UX constraints

- Keep the portal compact without sacrificing clear state, consent, validation, keyboard flow, focus visibility, or touch targets.
- Newsletter and paid membership remain orthogonal even though they share one portal.
- Use one coherent coastal visual system across the gate panel, newsletter toggle, Join surface, and Hero CTA pair.
- Counter badges are annotations to their buttons, not separate competing circles or a detached stats strip.

## Git / deploy expectations

Reuse `feat/members` and PR #8. Commit/push the implementation to update Preview, then prepare `HANDOFF-QA-pass1.md` with the exact Preview URL. **Do not merge**; Merge gate remains `epic`.

## Done means

Acceptance met on a Preview-ready `feat/members` tip; lint/typecheck clean; Pass 1 handoff overwritten for `members-0022`; PR #8 remains open and unmerged.
