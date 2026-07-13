# Handoff: Product Manager → Developer

**Date:** 2026-07-12  
**Requested by:** CEO / PM  
**Backlog work ID:** `admin-console-0012`  
**Backlog link:** `docs/product/backlogs/admin-console-BACKLOG.md`  
**Priority:** now  
**Iteration:** `1`

**Save as:** `docs/handoffs/HANDOFF-DEV.md`

## Verifier & Ship path

**Verifier:** `ceo`  
**Verify passes:** `pass2`  
**Ship path:** `direct-to-main`

**CEO approved direct-to-main?** yes (Verifier = `ceo` defaults)

## Goal

On the Hover login page inside the mail iframe, make **Go back to Hover.com** (`https://www.hover.com/`) open in a **new browser tab**, not navigate inside the iframe.

## Acceptance criteria

- [ ] Anchors to `https://www.hover.com/` (and `https://hover.com/` if used) get `target="_blank"` and `rel="noopener noreferrer"` in proxied HTML (rewrite and/or runtime fixer — mirror Help link treatment)
- [ ] Click opens Hover marketing site in a new tab from logged-out `/admin` Webmail
- [ ] Does not force unrelated in-app Roundcube links to `_blank`
- [ ] Push `main`; notify PM for CEO Production verify

## Out of scope

- Agent QA handoffs
- Changing the link URL/text
- Broader iframe breakout policy beyond this marketing link

## Notes for Developer

- See existing `rewriteHelpLinks` / `fixHelp` patterns and `PASSIVE_QUERY_LINK_FIXER` in `src/app/admin/mail/[[...path]]/route.ts`
- `admin-console-0011` completed (`4718bf4`); this is a new work ID
- `.cursor/skills/ccvaa-dev-memory/SKILL.md`
