# Handoff: Product Manager → Developer

**Date:** 2026-07-10  
**Requested by:** CEO / PM  
**Backlog work ID:** `admin-console-0007`  
**Backlog link:** `docs/product/backlogs/admin-console-BACKLOG.md`  
**Priority:** now  

## Ship path

**Ship path:** `feature-branch` (default)

**CEO approved direct-to-main?** no  

## Goal

Fix Production admin OTP **verify**: codes email successfully but verify returns “No active code found. Request a new one.” (admin-console-0007).

## User value

CEO/admins can complete OTP login on Production after receiving the email code.

## Acceptance criteria

- [ ] On Production (or Preview with same architecture), request OTP → receive email → enter code → **successful login** (session cookie set; scaffolds visible)
- [ ] Challenge survives across serverless instances (not only same-instance happy path)
- [ ] Expired / wrong codes still fail safely with clear errors
- [ ] Rate limits still apply; no secrets in logs or client errors
- [ ] `npm run lint` and `npm run typecheck` pass
- [ ] PR + exact Preview URL in QA Pass 1 handoff when ready

## Out of scope

- Closing admin-console-0006 SMTP-missing (ops resolved; error-copy already shipped)
- Protocol/CEO.md docs (parked)
- Changing Hover mail iframe proxy
- Commit/merge unless CEO asks

## Technical hints

- Backlog: `admin-console-0007`
- Backlog: `docs/product/backlogs/admin-console-BACKLOG.md` (`admin-console-0007`)
- Likely: `src/lib/admin/otp.ts` in-memory `Map`; verify route `src/app/api/admin/otp/verify/route.ts`
- Prefer a durable shared store suitable for Vercel (e.g. Redis/KV) for challenges — and consider rate-limit store consistency
- Read FEATURES.md note on OTP Redis store

## Design / UX constraints

Minimal user-facing change; keep existing login UI unless needed for clarity.

## Git / deploy expectations

- Historical branch: `fix/otp-verify-shared-store` (prefer `fix/admin-console-0007-…` going forward)
- Feature-branch path: Preview Pass 1 → merge when CEO asks → cleanup → Pass 2

## Done means

Lint/typecheck clean; PR open; exact Preview URL in QA Pass 1 handoff; login verify demonstrably works across instances (document how you validated).
