# Handoff: Developer → QA

**Date:** 2026-07-14  
**Pass:** `1`  
**Backlog work ID:** `members-0008`  
**Ship path that led here:** `feature-branch`  
**Epic branch:** `feat/members`  
**Merge gate:** `epic`  
**Filled by:** Developer  

**Save as:** `docs/handoffs/HANDOFF-QA-pass1.md`

**Branch name:** `feat/members`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/8  
**Commit:** `956be8a`  
**Preview URL:** https://ccvaa-web-git-feat-members-azang-projects.vercel.app  
**Preview protection:** QA reads `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local`. Browser Pass 1: both bypass query **and** `x-vercel-set-bypass-cookie=true`. See `docs/protocols/PREVIEW_PROTECTION.md`.  
**Production URL:** https://ccvaa-web.vercel.app/ (Pass **2** only)

**Post-merge cleanup (Pass 2 only):** n/a until **merge milestone**

**Out of scope for QA:** https://ccvaa.ca/

## What changed

Admin **Members** panel replaces the scaffold with a mail-session-gated roster. Search by name/email; separate **plan** and **newsletter** filters. Table shows membership status, newsletter flag, and Annual anniversary/next renewal when applicable. Edit (modal) and delete (confirm dialog) call Zod-validated `/api/admin/members` APIs. Fail closed with clear error when DB is missing or unmigrated.

## Focus checklist

- [ ] Sign in via Webmail (Hover mailbox in iframe); **Members** nav appears after auth
- [ ] Roster loads when `DATABASE_URL` + migrated Neon (seed data shows plan/newsletter variants incl. Annual dates)
- [ ] Without DB or unmigrated schema: roster shows fail-closed error (503 message), not a blank crash
- [ ] Search filters name/email; **plan** and **newsletter** filters work independently
- [ ] Annual member row shows anniversary + next renewal; non-Annual shows em dash
- [ ] Edit opens modal; save updates row; invalid payload rejected
- [ ] Delete requires confirm dialog; member removed from list
- [ ] Unauthenticated `/api/admin/members` returns **401**
- [ ] Lint + typecheck clean on branch
- [ ] Sign-off **continue epic** — **do not merge**

## Known risks

- Preview Neon branch may still be unmigrated (`health` `db.ok` but tables missing) — expect roster 503 until migrate+seed on Preview branch
- Admin mail auth on Preview needs Deployment Protection bypass + mailbox credentials from `.env.local`
- Prior epic tickets unchanged; spot-check hero/profile if time permits

## Report back with

Overwrite `docs/reports/QA-pass1.md`. Commit + push on `feat/members`.
