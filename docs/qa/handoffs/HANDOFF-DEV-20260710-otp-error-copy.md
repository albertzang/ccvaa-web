# Handoff: Product Manager → Developer

**Date:** 2026-07-10  
**Requested by:** CEO / PM  
**Priority:** now  

## Ship path

**Ship path:** `feature-branch` (default)

**CEO approved direct-to-main?** no  

**Reason for direct-to-main (if any):** n/a  

## Goal

Fix the **code** side of BUG-20260710-01: Production-facing OTP/SMTP config errors must not tell operators to edit `.env.local` only. Use environment-aware, safe messaging.

## User value

When SMTP is misconfigured on Vercel, admins/operators get actionable guidance (Vercel Production/Preview env vars) instead of local-dev instructions that don’t apply on Production.

## Acceptance criteria

- [ ] Missing/invalid SMTP config errors shown to users (or returned by API) do **not** exclusively point at `.env.local` for Production/Preview deployments
- [ ] Local/dev guidance may still mention `.env.local` when appropriate (e.g. `NODE_ENV=development` or clear local context)
- [ ] Do **not** leak secrets; keep messages operator-safe
- [ ] Related copy in `src/lib/admin/email.ts` and `src/components/admin/LoginSection.tsx` (and any other user-visible SMTP/OTP config strings) reviewed and aligned
- [ ] `npm run lint` and `npm run typecheck` pass
- [ ] PR + exact Preview URL recorded in QA Pass 1 handoff when ready

## Out of scope

- **Setting `SMTP_PASS` (or other SMTP_*) in Vercel** — CEO ops, not this handoff. Codes still won’t send until CEO configures env + redeploys.
- Changing OTP algorithm, rate limits, or mail proxy behavior
- FEATURES.md Board wording (PM already corrected)
- Committing/pushing/merging unless CEO asks

## Technical hints

- Bug: `docs/qa/bugs/BUG-20260710-01.md`
- Report: `docs/qa/reports/QA-20260710-01.md`
- Likely files: `src/lib/admin/email.ts`, `src/components/admin/LoginSection.tsx`
- Related FEATURES.md: Admin login (OTP)

## Design / UX constraints

Match existing admin tone; concise errors; prefer minimal diff.

## Git / deploy expectations

- You own the feature branch name (`fix/…` suggested: `fix/otp-smtp-error-copy`)
- Open PR → Preview → fill `docs/templates/handoff-qa.md` for Pass 1
- After merge (when CEO asks): delete branch local+remote → Pass 2 handoff

## Done means

Lint/typecheck clean; PR open; exact Preview URL in QA Pass 1 handoff.
