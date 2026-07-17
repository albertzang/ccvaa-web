# Handoff: Product Manager → Developer

**Date:** 2026-07-16  
**Requested by:** CEO / PM  
**Backlog work ID:** `members-0022`
**Backlog link:** `docs/product/backlogs/members-BACKLOG.md`  
**Priority:** now  
**Iteration:** `2`

**Save as:** `docs/handoffs/HANDOFF-DEV.md`

## Verifier & Ship path

**Verifier:** `agent`  
**Verify passes:** `pass1+pass2`  
**Ship path:** `feature-branch`  
**Epic branch:** `feat/members`  
**Merge gate:** `epic`

**CEO approved direct-to-main?** n/a

## Goal

**Iteration 2 (Pass 1 hold):** Fix valid one-click unsubscribe landing on Preview.

QA: `GET /?unsub=<token>` returns HTTP 500 because `setMemberSessionCookie` runs during `resolveUnsubLanding` in `src/app/page.tsx` (RSC). Next.js only allows cookie writes in a Server Action or Route Handler. `POST /api/members/newsletter/unsub` already redeems successfully; invalid tokens render correctly.

## Acceptance criteria

- [ ] Valid `/?unsub=<token>#membership` returns 200 (not 500)
- [ ] Redeem sets newsletter off (idempotent); membership unchanged
- [ ] Verified session established/resumed for that member without setting cookies from the RSC page
- [ ] Verified `#membership` UI shows with newsletter toggle **off**
- [ ] Invalid/expired token: clear message; no fake verified session
- [ ] Seed annual unsub path shows “Membership perks coming soon…” (blocked in Pass 1 by this 500)
- [ ] Lint + typecheck; overwrite `HANDOFF-QA-pass1.md` with tip/Preview URL for retest; **do not merge**

## Out of scope

Broader portal redesign (already shipped in Iteration 1); merge milestone; Production go-live.

## Technical hints

- Bug site: `src/app/page.tsx` → `resolveUnsubLanding` → `setMemberSessionCookie`
- Prefer: redeem + `Set-Cookie` in Route Handler / Server Action, then redirect to `/#membership` (or client redeem that sets session via API) so the page only reads session/profile
- Preserve token security/idempotency from `members-0021` / Iteration 1
- Pull tip of `feat/members` first; reuse PR #8

## Git / deploy expectations

Reuse `feat/members` / PR #8. Commit/push when Preview-ready. **Do not merge.**

## Done means

Unsub landing fixed on Preview tip; Pass 1 handoff ready for retest; PR remains open.
