# Handoff: Product Manager → Developer

**Date:** 2026-07-14  
**Requested by:** CEO / PM  
**Backlog work ID:** `members-0004`  
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

Logged-out `#membership` Join UI + Stripe Checkout (test keys on Dev/Preview). Flow: name, email, optional newsletter opt-in → email verify (reuse `members-0002` OTP) → Checkout → webhook activates membership; return to `/`. Pre-cap: Founding + Annual; post-cap: Lifetime + Annual. Race-safe Founding seat cap; Lifetime fee always > Founding. Annual anniversary / nextRenewalAt from Stripe. Zod on join payloads. Idempotent webhooks.

## User value

Public can pay to join CCVAA membership without landing half-built checkout on `main` (epic lane).

## Acceptance criteria

- [ ] `#membership` Join UI when logged out; hero **Join** anchors here (add Join CTA if missing)
- [ ] Plan rules + Founding seat cap + Lifetime fee > Founding validation
- [ ] Verify → Checkout → webhook; return to `/`; anniversary fields for Annual
- [ ] Optional newsletter opt-in stored; env placeholders for fees / Price IDs / cap in `.env.example` + FEATURES
- [ ] Fail closed without Stripe/`DATABASE_URL` where applicable
- [ ] Lint + typecheck clean; push on `feat/members`; Pass 1 handoff updated
- [ ] **Do not merge**

## Out of scope

Monthly plans; Customer Portal; live Production keys (`members-0009`); logged-in profile chrome (`members-0006`).

## Technical hints

- Reuse: `src/lib/members/*`, newsletter opt-in, OTP helpers from `0002`, Contact patterns from `0003`
- Homepage order: Nav → Hero → **`#membership`** → About → Contact → Footer (add Membership section if not present)
- Stripe test mode webhooks via Vercel Preview URL — document required env for CEO/PM
- Secrets ask via **PM** only: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, Price IDs, Founding cap, fees; still need `DATABASE_URL` / Resend for verify step

## Design / UX constraints

Match coastal theme; minimal Join UI; no card-heavy hero clutter; `#membership` is post-hero section.

## Git / deploy expectations

- Reuse **`feat/members`** + PR #8  
- PM authorizes commit/push; **do not merge**  
- Overwrite `docs/handoffs/HANDOFF-QA-pass1.md` when ready

## Done means

Acceptance met on epic Preview; Pass 1 handoff ready; **PR not merged**
