# Handoff: Product Manager → Developer

**Date:** 2026-07-14  
**Requested by:** CEO / PM  
**Backlog work ID:** `members-0001`  
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

**Reason for direct-to-main (if any):** n/a  

## Goal

Stand up the Members data platform on Neon: Drizzle schema + Zod for **orthogonal** newsletter and membership axes, OTP/challenges, unsub tokens, env split (Prod vs Dev; Preview via Vercel env), and non-Production seeds (including one Annual with a known anniversary). No public UI in this ticket — fail closed if members routes need DB and env is missing.

## User value

Enables later newsletter join/confirm, membership Join/Stripe, and admin roster without half-built public surfaces on `main` (epic lane).

## Acceptance criteria

- [ ] Migrations runnable; Annual anniversary / next-renewal fields documented (`membershipAnniversary` and/or `nextRenewalAt`; null for Founding/Lifetime)
- [ ] Shared Zod modules for newsletter + membership + OTP/challenges + unsub tokens
- [ ] Env split documented in `.env.example` and FEATURES (Neon connection strings; placeholders for Stripe test + Mailosaur for later tickets — do not invent live secrets)
- [ ] Seeds run non-Production only (incl. one Annual with known anniversary)
- [ ] App/members DB access fails closed when required env/DB is missing (no silent empty success)
- [ ] `npm run lint` + `npm run typecheck` clean; PR open on epic branch with Preview URL ready for Pass 1

## Out of scope

- Public UI (`#contact` / `#membership` forms)
- Stripe Checkout / webhooks
- Resend send path / email copy (`members-0002`)
- Admin roster / ESP UI
- Merging to `main` (Merge gate `epic` — wait for **merge milestone**)

## Technical hints

- Relevant paths: greenfield — likely `drizzle.config.*`, `src/db/` or `src/lib/db/`, `src/lib/members/` (Zod), `.env.example`, `package.json` scripts for migrate/seed; Next 16 App Router (no `middleware.ts` — use `proxy.ts` only if needed)
- Env / secrets impact: `DATABASE_URL` (or Neon split); never commit `.env.local`. Document Stripe test + Mailosaur keys as future placeholders only if useful for Dev setup notes
- Related FEATURES.md section: Members (planned); Infra & ops
- Related backlog item: `members-0001`; next wave `members-0002` depends on this
- Stack today: Next 16 / React 19 / Tailwind 4 — **no** Drizzle/Neon yet; add deps as needed
- Product model: Newsletter ⊥ Membership (not one tier ladder) — see members backlog header

## Design / UX constraints

n/a (platform only — no public UI)

## Git / deploy expectations

### Ship path = `feature-branch` + Epic branch + Merge gate `epic`

- Create **`feat/members`** from latest `main` (first epic ticket). Open **one** PR to `main`; keep it open across later Members tickets.
- PR title must include `members-0001` (may also say Members epic).
- **PM authorizes** commit + push on `feat/members` and opening the PR (not merge). Do not ask CEO for per-commit approval on the epic branch.
- After ship: fill `docs/handoffs/HANDOFF-QA-pass1.md` with the **exact** Preview URL for agent Pass 1; notify **PM** (not CEO) when ready.
- After Pass 1 **pass:** **do not merge** — leave PR open; PM will note Pass 1 on the backlog and kick `members-0002` on the same branch.
- Merge only when CEO/PM says **merge milestone**.
- If blocked on Neon/`DATABASE_URL` or other secrets → stop and tell **PM** what CEO must set in `.env.local` / Vercel Preview+Production.

## Done means

- Lint/typecheck clean; PR open on `feat/members`; Preview URL in Pass 1 handoff
- **PR not merged**; ready for next epic ticket after Pass 1 **continue epic**
