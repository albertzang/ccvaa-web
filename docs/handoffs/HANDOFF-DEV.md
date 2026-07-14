# Handoff: Product Manager → Developer

**Date:** 2026-07-14  
**Requested by:** CEO / PM  
**Backlog work ID:** `members-0003`  
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

## Goal

**Delta only:** Newsletter APIs must fail closed with clear **503** when Resend (or other required env) is missing — not generic **500** `MEMBERS_INTERNAL_ERROR`.

QA repro (Preview with `DATABASE_URL` set, `RESEND_*` missing):
- `POST /api/members/newsletter/subscribe` → currently 500; expect 503 + clear code/message
- `POST /api/members/newsletter/preference` (`lookup`) → same

Also harden: if schema missing (unmigrated Neon), return clear 503 rather than unhandled 500.

## Acceptance criteria

- [ ] Subscribe / confirm / preference map `MembersEnvError` / Resend-not-configured to **503** with stable codes (not blank “Something went wrong”)
- [ ] Preference `lookup` without Resend should not require send — if it 500s for env reasons, fix mapping; DB-only lookup should work with just `DATABASE_URL` if no email send is needed
- [ ] Quick check join OTP routes share same error helper so 0004/0005 don’t regress the same way
- [ ] Lint + typecheck; push on `feat/members`; overwrite `HANDOFF-QA-pass1.md` for **members-0003** Iteration 2 retest
- [ ] **Do not merge**

## Out of scope

Setting CEO secrets; full double opt-in with Mailosaur; merge to main; pausing unrelated `members-0005` work except pull/rebase onto this fix.

## Technical hints

- Routes under `src/app/api/members/newsletter/*`; shared error mapper if present
- Health already reports `email.resend: "missing"` — API responses should align
- After fix: QA will retest Pass 1 (continue epic expected)

## Git / deploy

Reuse `feat/members` / PR #8. PM authorizes commit/push. Pull tip first (`b90116a`+). If `members-0005` WIP lands mid-flight, rebase/merge carefully — this Iteration is small and priority.

## Done means

503 fail-closed verified on Preview without Resend; Pass 1 handoff ready for retest; **PR not merged**
