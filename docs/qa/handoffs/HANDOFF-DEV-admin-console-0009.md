# Handoff: Product Manager → Developer

**Date:** 2026-07-11  
**Requested by:** CEO / PM  
**Backlog work ID:** `admin-console-0009` (**required**)  
**Backlog link:** `docs/product/backlogs/admin-console-BACKLOG.md`  
**Priority:** now  
**Iteration:** `1`

**Save as:** `docs/qa/handoffs/HANDOFF-DEV-admin-console-0009.md`

## Verifier & Ship path

**Verifier:** `ceo`  
**Verify passes:** `pass2`  
**Ship path:** `direct-to-main`

**CEO approved direct-to-main?** yes (Verifier = `ceo` default)

**Reason for direct-to-main (if any):** CEO will verify on Production; no agent QA.

## Goal

Stop HTTP **403** errors in the admin Hover webmail iframe when the user refreshes the inbox or when Roundcube auto-refresh runs.

## User value

Admins can keep the Mail panel open and rely on refresh without console/server errors breaking inbox updates.

## Acceptance criteria

- [ ] On `/admin` → Mail iframe (signed into Hover): manual inbox refresh does **not** produce HTTP 403 from proxied `/admin/mail…` requests
- [ ] Auto-refresh (if enabled in Roundcube) likewise does not 403
- [ ] Normal mail UI still loads (list, open message, compose if previously working)
- [ ] Admin session cookie is still **not** forwarded upstream; only Roundcube/Hover cookies
- [ ] No agent QA handoffs — after push, notify PM that Production is ready for CEO verify

## Out of scope

- Dedicated QA test inbox (`admin-console-0005`)
- OTP / Redis
- Replacing Hover with another mail client
- Changes to public site

## Technical hints

- Relevant paths:
  - `src/app/admin/mail/[[...path]]/route.ts` — main reverse proxy + HTML/JSON/JS rewrite
  - `src/proxy.ts` — keep Roundcube root-absolute paths under `/admin/mail`
  - `src/components/admin/MailSection.tsx` — iframe `src` = `ADMIN_MAIL_EMBED_PATH`
- Env / secrets impact: none expected (proxy already live on Production)
- Related FEATURES.md section: Admin → Mail (same-origin proxy; known Roundcube fragility)
- Related backlog item: `admin-console-0009`
- Debug tips: reproduce in DevTools Network tab inside the iframe context; note failing URL, method, request headers, and whether response is from our proxy vs Hover; check if refresh hits a path/cookie/token not covered by `rewritePayload` / cookie allowlist (`roundcube_`, `bi_wm`, `HMAC_`, `_ssid`)

## Design / UX constraints

No visual redesign required — fix proxy behavior only.

## Git / deploy expectations

### Ship path = `direct-to-main` (CEO Verifier)

- Work on `main`; commit/push only when CEO asks.
- Skip Preview / agent QA files.
- After push: tell PM CEO can verify https://ccvaa-web.vercel.app/admin (Mail section).
- Still mention `admin-console-0009` in the commit message.

## Done means

- Lint/typecheck clean; ready to commit/push when CEO asks.
- Production deploy live; PM cued for CEO verify — **no** `HANDOFF-QA-*`.
- Backlog stays `in-progress` until CEO says **verified** (or Iteration if issues).
