---
name: ccvaa-dev-memory
description: >-
  Institutional memory for CCVAA development — admin OTP, Hover mail proxy,
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

- Route: `/admin` — desktop/tablet only (`MobileGate`)
- Mail: iframe via same-origin proxy `/admin/mail` (`src/app/admin/mail/[[...path]]/route.ts` + `src/proxy.ts`)
  - Hover sets `X-Frame-Options: sameorigin` — direct iframe fails
  - Do not follow redirects server-side blindly; filter/normalize cookies; asset paths (`/skins`, `/program`, etc.) must rewrite
- OTP: 6-digit to `info@ccvaa.ca`; hashed; httpOnly session cookie
  - APIs under `src/app/api/admin/`
  - OTP + rate limits use Upstash Redis when `UPSTASH_REDIS_REST_URL`/`TOKEN` are set (required on Vercel); in-memory fallback for local only
- Scaffolds only: Members, Financial, Events
- Env: `.env.example`; local `.env.local`; production Vercel env + redeploy
  - `ADMIN_OTP_DEV_MODE=false` for real SMTP; Hover SMTP `mail.hover.com:465` SSL

## Ops

- Production (agent QA): https://ccvaa-web.vercel.app/
- Public domain (CEO manual only): https://ccvaa.ca/
- GitHub: auto-deploy from `main` on Vercel
- Push/merge `main` only when CEO asks; default is feature branch + Preview
- Preview URL: from Vercel/GitHub PR (not `ccvaa-web.vercel.app`)
- See `docs/protocols/GIT_DEPLOY.md`

## Design constraints (CEO)

Brand-first first viewport; no card-heavy heroes; avoid generic AI purple/cream looks; intentional motion when doing visual work.
