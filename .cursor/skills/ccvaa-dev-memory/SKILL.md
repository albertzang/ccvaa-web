---
name: ccvaa-dev-memory
description: >-
  Institutional memory for CCVAA development — admin mail-session auth, Hover mail proxy,
  branding, env, and known pitfalls. Use when implementing or debugging
  ccvaa-web admin, auth, mail, or public site branding.
---

# CCVAA developer memory

## Public site

- Content: `src/lib/site.ts`
- Theme tokens: `src/app/globals.css` (ocean teal + driftwood; not purple/cream-AI defaults)
- Logos: `public/images/logo-ondark.png`, `logo-onlight.png`
- Favicon: `src/app/icon.svg` only
- Board / Purposes: collapsible; shared +/− expand affordance; board portraits 1:1; group photo ~5:3 max-height
- Hero: full-bleed, `select-none`, no CTAs; header style switches on scroll

## Admin

- Route: `/admin` — phones, tablets, and desktops (no MobileGate)
- Auth: Hover mailbox session inside the mail iframe (no OTP)
  - Probe: `GET /api/admin/session` (Roundcube `roundcube_sessid` + fail-closed upstream HTML probe)
  - Iframe bridge: injected `postMessage` (`ccvaa-admin-mail`) when Mail is open
  - Logout: `POST /api/admin/logout` clears proxied Roundcube cookies + remounts iframe
- Mail: iframe via same-origin proxy `/admin/mail` (`src/app/admin/mail/[[...path]]/route.ts` + `src/proxy.ts`)
  - Hover sets `X-Frame-Options: sameorigin` — direct iframe fails
  - Do not follow redirects server-side blindly; filter/normalize cookies; asset paths (`/skins`, `/program`, etc.) must rewrite
  - Keep CSRF header, hash-link guard, hide `#header` (admin-console-0009)
- Scaffolds only: Members, Financial, Events
- Env: `.env.example` — `ADMIN_EMAIL` / `ADMIN_PASS` for QA Hover sign-in (not app-runtime); `VERCEL_AUTOMATION_BYPASS_SECRET` for Preview

## Ops

- Production (agent QA): https://ccvaa-web.vercel.app/
- Public domain (CEO manual only): https://ccvaa.ca/
- GitHub: auto-deploy from `main` on Vercel
- Push/merge `main` only when CEO asks (product Dev). Default for Verifier=`agent` is feature branch + Preview; Verifier=`ceo`/`n/a` often `direct-to-main`
- Preview URL: from Vercel/GitHub PR (not `ccvaa-web.vercel.app`)
- See `docs/protocols/GIT_DEPLOY.md`

## Design constraints (CEO)

Brand-first first viewport; no card-heavy heroes; avoid generic AI purple/cream looks; intentional motion when doing visual work.
