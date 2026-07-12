# CCVAA Web — Feature Inventory

> **Owner:** Product Manager agent  
> **Updated:** 2026-07-11  
> Keep this document current whenever features ship or change. Work-to-do: [`BACKLOG.md`](BACKLOG.md).

## Product summary

**Coast to Coast Visual Arts Association (CCVAA)** — BC-registered non-profit website promoting visual arts across Canada.

- **Legal / contact:** Coast to Coast Visual Arts Association, 4 – 8800 Hazelbridge Way, Richmond, BC V6X 0S3, `info@ccvaa.ca`
- **Public site:** marketing homepage
- **Private admin:** `/admin` console (desktop/tablet only)

---

## Public site (`/`)

### Header / nav
- Fixed overlay header; style switches when scrolling past hero
- Brush wordmark logos: `logo-ondark.png` (hero) / `logo-onlight.png` (scrolled)
- Subtitle: “Visual Arts Association”
- Nav: About (`#about`), Contact (`#contact`)

### Hero
- Full-bleed coastal hero image (`hero-background.webp`)
- Eyebrow, headline, subheadline from `src/lib/site.ts`
- Text is non-selectable; no CTA buttons in hero

### About
- Intro paragraphs
- **Our Board** (collapsible section): group photo placeholder stays visible; member cards show name/role always; section expand reveals all portraits + bio placeholders together (Zhong Liu / President, Yaqi Jing / VP, Albert Zang / Secretary; 1:1 portraits)
- **Our Purposes** (collapsible): 10 purpose cards; titles always visible; descriptions toggle together

### Contact
- Email + mailing address card

### Footer
- Org name, tagline, copyright (no duplicate contact block)

### Branding / assets
- Favicon: `src/app/icon.svg` (cream C + teal wave on forest green)
- Theme: coastal fog/forest palette in `globals.css` (ocean + driftwood tokens)
- Logo wave: ocean teal (not gold); on-light wordmark text is brown

---

## Admin (`/admin`)

### Access control
- **Desktop / tablet only** — phones see “Desktop or tablet required”
- `robots: noindex` on admin page

### Header
- Same cream/scrolled visual language as public site
- Nav: Mail; Login (when logged out); Members / Financial / Events + Log out (when logged in)

### Mail (always available on admin, no OTP required)
- Collapsible section embedding Hover webmail via **same-origin proxy** `/admin/mail`
- Proxy rewrites Roundcube paths/assets/cookies so iframe works (Hover blocks direct iframe via `X-Frame-Options`)
- Known fragility: third-party Roundcube reverse proxy; watch for session/cookie/browser differences

### Admin login (OTP)
- 6-digit OTP emailed to `info@ccvaa.ca` (or `ADMIN_OTP_EMAIL`)
- UI cooldown + server rate limits (1/min, 5/hour send; 5 attempts/code; IP verify limits)
- OTP hashed (SHA-256), ~10 min TTL; session signed httpOnly cookie ~12h
- After success: login section hidden; scaffold sections shown
- Env: see `.env.example` (`ADMIN_SESSION_SECRET`, SMTP_*, `ADMIN_OTP_DEV_MODE`)
- Local: `.env.local` (gitignored). Production: Vercel Environment Variables + redeploy
- **QA OTP (current):** single-Send + CEO-in-the-loop — `docs/protocols/QA_AUTH.md` (no standing agent mailbox access; do not spam Send). Dedicated test inbox = `admin-console-0005` on backlog.

### Post-auth scaffolds (placeholders only)
- **Members** — coming soon
- **Financial dashboard** — coming soon
- **Events & posts** — coming soon (future CRUD)

---

## Infra & ops

| Item | Detail |
|------|--------|
| Hosting | Vercel |
| Production | https://ccvaa-web.vercel.app/ (`main`) — agent QA Pass 2 |
| Public domain | https://ccvaa.ca/ — **CEO manual only**; out of agent Dev/QA flow |
| Preview | Per-branch/PR Vercel URL (pre-merge QA target) |
| DNS / email | Hover |
| CI | lint, typecheck, build (GitHub Actions) |
| Package | `nodemailer` for OTP SMTP; `@upstash/redis` for shared OTP/rate-limit store |
| Ship path | Feature branch → QA Preview → merge → cleanup → QA on `ccvaa-web.vercel.app` (Verifier = `agent`). **Verifier = `ceo`:** CEO verifies (defaults: `direct-to-main` + Production pass2). Work IDs `{feature-slug}-{NNNN}` — [`BACKLOG.md`](BACKLOG.md). **Baseline** pass = Production audit with no PR. See `docs/protocols/GIT_DEPLOY.md`. CEO may manually check `ccvaa.ca`. |

### Important technical notes for Developer
- Next.js 16: prefer `proxy.ts` over deprecated `middleware.ts`
- Read `node_modules/next/dist/docs/` before novel Next APIs
- OTP challenges + rate-limit buckets use **Upstash Redis** when `KV_REST_API_URL` + `KV_REST_API_TOKEN` are set (shared across Vercel instances). In-memory fallback for local `next dev` only
- Never commit `.env.local` or secrets
- Default: feature branch + PR with backlog work ID `{feature-slug}-{NNNN}`; merge/push `main` only when CEO explicitly asks
- Admin OTP/mail on Preview needs Vercel **Preview** environment variables

---

## Known gaps / next candidates

Work-to-do lives in **[`BACKLOG.md`](BACKLOG.md)** (feature files under `backlogs/`). Do not duplicate long lists here.

---

## Changelog (high level)

| When | What |
|------|------|
| 2026-07 | Public site, board/purposes UX, branding/logos, favicon |
| 2026-07-10 | `/admin` OTP + Hover mail proxy + scaffolds; multi-agent OS bootstrapped |
| 2026-07-10 | Encoded feature-branch → Preview QA → merge → Production QA (`ccvaa-web.vercel.app`); `ccvaa.ca` CEO-manual only |
| 2026-07-10 | Ship path field: CEO owns `direct-to-main` approval; Developer follows handoff literally |
| 2026-07-10 | Post-merge: delete feature branch local+remote before Pass 2; Pass 2 fixes = new branch from main |
| 2026-07-10 | Added standard **baseline** QA pass (Production audit, no PR) |
| 2026-07-10 | QA OTP: single-Send + CEO-in-the-loop protocol (`QA_AUTH.md`) to protect rate limits |
| 2026-07-11 | OTP shared store via Marketplace Redis (`KV_REST_API_*`); `admin-console-0007` closed |
| 2026-07-11 | Feature backlogs replace ROADMAP; work IDs `{feature-slug}-{NNNN}` |
| 2026-07-11 | **Verifier** `agent` \| `ceo` \| `n/a` + **Verify passes**; CEO may bypass agent QA; `agent-os` uses `n/a`; **`verified` on agent-os ⇒ commit + push** |
