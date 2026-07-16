# Handoff: Product Manager → Developer

**Date:** 2026-07-16  
**Requested by:** CEO / PM  
**Backlog work ID:** `members-0019`  
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

1. **`#membership` tabs (logged out):** **Join** | **Sign in**, **Join default** — only one form visible. Logged-in stays profile-only. Do **not** move newsletter UI from Contact.
2. **Hero counts:** Replace beside-button annotations (`members-0016`) with a **simple numeric circle badge** on the **top-right corner** of Subscribe (subscriber count) and Join (member count). Live counts + `#contact` / `#membership` anchors unchanged.

## Acceptance criteria

- [ ] Tabs Join | Sign in; Join default; mutual exclusivity of forms
- [ ] Profile when authenticated (no dual forms)
- [ ] Newsletter remains in Contact only
- [ ] Hero: circular number badge top-right on each CTA; accessible labeling
- [ ] Old beside annotation removed
- [ ] FEATURES.md + changelog; lint + typecheck
- [ ] Pass 1 handoff; **do not merge**

## Out of scope

Newsletter move into Membership; Stripe/Checkout changes; merge milestone.

## Technical hints

- `MembershipPanel.tsx` / `MemberLoginForm` / `JoinForm` / `MembershipSection.tsx`
- `Hero.tsx` + `HeroCtaAnnotation` — replace with positioned badge on the `<a>`
- Keep brand tokens; avoid purple/glow; minimal tab chrome
- Pull tip of `feat/members` first

## Git / deploy

Reuse `feat/members` / PR #8. PM authorizes commit/push. **Do not merge.**

## Done means

Acceptance met on Preview-ready tip; `HANDOFF-QA-pass1.md` overwritten for `members-0019`; PR not merged.
