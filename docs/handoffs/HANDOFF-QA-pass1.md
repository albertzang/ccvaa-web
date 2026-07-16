# Handoff: Developer / PM → QA

**Date:** 2026-07-15  
**Pass:** `1`  
**Backlog work ID:** `members-0006` (then `members-0008`)  
**Ship path that led here:** `feature-branch`  
**Epic branch:** `feat/members`  
**Merge gate:** `epic`  
**Filled by:** Product Manager  

**Save as:** `docs/handoffs/HANDOFF-QA-pass1.md`

**Branch name:** `feat/members`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/8  
**Commit:** tip of `feat/members` (≥ `239574a`)  
**Preview URL:** https://ccvaa-web-git-feat-members-azang-projects.vercel.app  
**Preview protection:** both `x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie=true` from `.env.local` (`PREVIEW_PROTECTION.md`). Never paste secret.

**Out of scope:** https://ccvaa.ca/ · **live Stripe Join Checkout** (`members-0004`) — do not request Stripe secrets

## Context

`members-0003` + `members-0005` live Pass 1 just **continue epic** (`239574a`). Preview: Resend + Mailosaur + session + Neon schema OK; `stripe: "missing"` expected.

Use Mailosaur API for OTPs. Admin mailbox: `ADMIN_EMAIL` / `ADMIN_PASS` from `.env.local` (`QA_AUTH.md`).

## Part A — `members-0006` profile E2E

Prior Pass 1 blocked logged-in profile on unmigrated Neon. Retest:

- [ ] Login as seeded/paid member (Mailosaur) → `#membership` shows profile (name; Annual anniversary when applicable)
- [ ] Name edit works; email change requires re-verify path (or clear UX)
- [ ] Perks placeholder OK; no newsletter UI in profile
- [ ] Sign-off **continue epic** / hold / retest — do not merge

Overwrite report, commit+push, then Part B.

## Part B — `members-0008` admin roster

Impl on branch (`956be8a`+). First Pass 1:

- [ ] `/admin` Members roster: list/search/filter plan ⊥ newsletter
- [ ] Annual anniversary/next renewal visible when applicable
- [ ] Update/delete confirmation; Zod; mail-session gate (unauth cannot mutate)
- [ ] Sign-off **continue epic** / hold / retest — do not merge

## After Part B

**STOP** and report. Do not start Stripe Join live testing. PM will pause for CEO Stripe setup.

## Report

`docs/templates/qa-report.md` → `docs/reports/QA-pass1.md`
