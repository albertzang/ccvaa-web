# Handoff: Product Manager → Developer

**Date:** 2026-07-12  
**Requested by:** CEO / PM  
**Backlog work ID:** `admin-console-0011`  
**Backlog link:** `docs/product/backlogs/admin-console-BACKLOG.md`  
**Priority:** now  
**Iteration:** `1`

**Save as:** `docs/handoffs/HANDOFF-DEV.md`

## Verifier & Ship path

**Verifier:** `ceo`  
**Verify passes:** `pass2`  
**Ship path:** `direct-to-main`

**CEO approved direct-to-main?** yes (Verifier = `ceo` defaults)  

**Reason for direct-to-main:** Small proxy CSS hide; CEO will verify on Production.

## Goal

Hide Hover’s pre-login help block inside the embedded mailbox iframe so it does not appear before the user is signed in.

## Acceptance criteria

- [ ] Proxied `/admin/mail` HTML injects CSS that hides `div#login-form > div.hover-login-help` (use `display:none!important` or equivalent, same style as `#header` hide)
- [ ] Login form fields/controls remain usable while logged out
- [ ] After mailbox login, no regression to mail chrome (do not hide unrelated logged-in UI)
- [ ] Push to `main` when ready; notify PM so CEO can verify Production `/admin` Webmail (logged out)

## Out of scope

- Changing Hover’s help content or linking behavior after login
- Broader login-form restyling
- Agent QA handoffs

## Notes for Developer

- Follow existing inject pattern: `HIDE_BLANK_HEADER` in `src/app/admin/mail/[[...path]]/route.ts`
- Read `.cursor/skills/ccvaa-dev-memory/SKILL.md` for mail proxy pitfalls
- Do **not** create `HANDOFF-QA-*` (Verifier = `ceo`)
