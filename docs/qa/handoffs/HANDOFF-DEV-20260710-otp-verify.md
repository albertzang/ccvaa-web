# Handoff: Product Manager → Developer

**Date:** 2026-07-10  
**Requested by:** CEO / PM  
**Priority:** now  

## Ship path

**Ship path:** `feature-branch` (default)

**CEO approved direct-to-main?** no  

## Goal

Fix Production admin OTP **verify**: codes email successfully but verify returns “No active code found. Request a new one.” (BUG-20260710-02).

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

- Closing BUG-20260710-01 SMTP-missing (ops resolved; error-copy already shipped)
- Protocol/CEO.md docs (parked)
- Changing Hover mail iframe proxy
- Commit/merge unless CEO asks

## Technical hints

- Bug: `docs/qa/bugs/BUG-20260710-02.md`
- Likely: `src/lib/admin/otp.ts` in-memory `Map`; verify route `src/app/api/admin/otp/verify/route.ts`
- Prefer a durable shared store suitable for Vercel (e.g. Redis/KV) for challenges — and consider rate-limit store consistency
- Read FEATURES.md note on per-instance memory

## Design / UX constraints

Minimal user-facing change; keep existing login UI unless needed for clarity.

## Git / deploy expectations

- Branch e.g. `fix/otp-verify-shared-store`
- Feature-branch path: Preview Pass 1 → merge when CEO asks → cleanup → Pass 2

## Done means

Lint/typecheck clean; PR open; exact Preview URL in QA Pass 1 handoff; login verify demonstrably works across instances (document how you validated).
