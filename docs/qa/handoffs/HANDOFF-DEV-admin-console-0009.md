# Handoff: Product Manager → Developer

**Date:** 2026-07-12  
**Requested by:** CEO / PM  
**Backlog work ID:** `admin-console-0009` (**required**)  
**Backlog link:** `docs/product/backlogs/admin-console-BACKLOG.md`  
**Priority:** now  
**Iteration:** `2`

**Save as:** `docs/qa/handoffs/HANDOFF-DEV-admin-console-0009.md`  
**Rework:** overwrite this same path (Iteration 1 content lives in git history).

## Verifier & Ship path

**Verifier:** `ceo`  
**Verify passes:** `pass2`  
**Ship path:** `direct-to-main`

**CEO approved direct-to-main?** yes (Verifier = `ceo` default)

**Reason for direct-to-main (if any):** CEO verifies on Production; no agent QA. Same umbrella ticket as Iteration 1.

## Goal

**Iteration 2 only:** Make Hover toolbar actions that operate on selected message(s) — especially **More** and **Mark** — usable inside the `/admin` mail iframe without causing a full iframe content refresh/reload.

(Iteration 1 refresh-403 is CEO-verified and must not regress.)

## User value

Admins can mark, bulk-act, and use overflow toolbar menus on selected mail without the embedded client resetting.

## Acceptance criteria

- [ ] Select one or more messages → **More** opens/works without a full iframe document reload
- [ ] Select one or more messages → **Mark** (and its submenu actions) works without a full iframe document reload
- [ ] Prefer fixing similar selection-toolbar controls if they share the same root cause (note any left broken)
- [ ] Iteration 1 behavior still holds: inbox manual/auto refresh does not 403
- [ ] Admin session cookie still not forwarded upstream
- [ ] No agent QA handoffs — after push, cue PM for CEO Production verify

## Out of scope

- Closing the whole `admin-console-0009` umbrella (CEO may add more iterations)
- OTP / Redis / dedicated QA inbox
- Replacing Hover
- Public site

## Technical hints

- Relevant paths:
  - `src/app/admin/mail/[[...path]]/route.ts` — HTML/JSON/JS rewrite, Location, cookies, CSRF header (`X-Roundcube-Request` already forwarded in Iteration 1)
  - `src/proxy.ts` — root-absolute Roundcube path rewrites
  - `src/components/admin/MailSection.tsx` — iframe embed
- Likely causes: links/forms navigating the iframe top document; `target="_top"` / `_parent`; unre written action URLs; 302/308 full navigations instead of XHR; base href edge cases on toolbar POSTs
- Debug: DevTools on iframe — watch document navigation vs XHR when clicking More/Mark; capture request URL + whether response is full HTML login/list shell
- Related FEATURES.md: Admin → Mail
- Related backlog: `admin-console-0009` Iteration 2

## Design / UX constraints

Proxy/behavior fix only; no visual redesign of admin chrome.

## Git / deploy expectations

### Ship path = `direct-to-main` (CEO Verifier)

- Work on `main`; commit/push only when CEO asks.
- Skip Preview / agent QA files.
- After push: tell PM CEO can verify https://ccvaa-web.vercel.app/admin (Mail).
- Commit message should include `admin-console-0009` and mention Iteration 2 / toolbar.

## Done means

- Lint/typecheck clean; ready to commit/push when CEO asks.
- Production ready for CEO verify of Iteration 2 — **no** `HANDOFF-QA-*`.
- Backlog stays `in-progress` (umbrella) until CEO says **verified** for the ticket as a whole (or explicitly closes remaining work).
