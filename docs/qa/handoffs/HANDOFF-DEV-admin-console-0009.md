# Handoff: Product Manager → Developer

**Date:** 2026-07-12  
**Requested by:** CEO / PM  
**Backlog work ID:** `admin-console-0009` (**required**)  
**Backlog link:** `docs/product/backlogs/admin-console-BACKLOG.md`  
**Priority:** now  
**Iteration:** `3`

**Save as:** `docs/qa/handoffs/HANDOFF-DEV-admin-console-0009.md`  
**Rework:** overwrite this same path.

## Verifier & Ship path

**Verifier:** `ceo`  
**Verify passes:** `pass2`  
**Ship path:** `direct-to-main`

**CEO approved direct-to-main?** yes (Verifier = `ceo` default)

## Goal

**Iteration 3 only:** After Hover login in the `/admin` mail iframe, hide or remove the blank `#header` element so it no longer shows empty chrome.

Do not regress Iterations 1–2 (refresh CSRF / no 403; More/Mark hash-link guard).

## User value

More usable vertical space; less empty UI in the embedded mailbox.

## Acceptance criteria

- [ ] After login, `#header` is not visible (hidden via CSS or removed from DOM via proxy inject) — CEO confirmed it is always blank
- [ ] Mail list, toolbars, folders, and compose still work
- [ ] Iteration 1: inbox refresh / auto-refresh still no 403
- [ ] Iteration 2: More / Mark on selected messages still no full iframe reload
- [ ] Surgical change — do not strip unrelated Roundcube chrome that is still needed
- [ ] No agent QA handoffs; cue PM after ready-to-push

## Out of scope

- Closing the umbrella ticket (more iterations possible)
- OTP / other admin features
- Public site

## Technical hints

- Likely inject CSS (`#header { display: none !important; }`) or remove/hide node in `injectBaseTag` / post-HTML rewrite in `src/app/admin/mail/[[...path]]/route.ts`
- Confirm selector is exactly `id="header"` in logged-in Roundcube HTML (Hover may nest differently on login vs mail task)
- Prefer CSS hide if Roundcube JS expects the node to exist
- Files: `src/app/admin/mail/[[...path]]/route.ts`, possibly `MailSection.tsx` only if embed chrome is involved (unlikely)

## Design / UX constraints

Behavior/chrome cleanup only inside the iframe; no admin page redesign.

## Git / deploy expectations

- `direct-to-main`; commit/push only when CEO asks
- Commit message: `admin-console-0009` Iteration 3 / hide blank header
- After push: CEO verifies Production Mail iframe

## Done means

- Lint/typecheck clean; ready to push
- Backlog stays `in-progress` until CEO closes the umbrella with **verified** (or continues iterations)
