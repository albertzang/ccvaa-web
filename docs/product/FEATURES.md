# CCVAA Web — Feature Inventory

> **Owner:** Product Manager agent  
> **Updated:** 2026-07-16  
> Keep this document current whenever features ship or change. Work-to-do: [`BACKLOG.md`](BACKLOG.md).

## Product summary

**Coast to Coast Visual Arts Association (CCVAA)** — BC-registered non-profit website promoting visual arts across Canada.

- **Legal / contact:** Coast to Coast Visual Arts Association, 4 – 8800 Hazelbridge Way, Richmond, BC V6X 0S3, `info@ccvaa.ca`
- **Public site:** marketing homepage
- **Private admin:** `/admin` console

---

## Public site (`/`)

**Page order (top → bottom):** Nav → Hero → Membership (`#membership`) → About (`#about`) → Contact (`#contact`) → Footer.

### Header / nav
- Fixed overlay header; style switches when scrolling past hero
- Brush wordmark logos: `logo-ondark.png` (hero) / `logo-onlight.png` (scrolled)
- Subtitle: “Visual Arts Association”
- Nav anchors: Membership (`#membership`), About (`#about`), Contact (`#contact`)

### Hero
- Full-bleed coastal hero image (`hero-background.webp`)
- Eyebrow, headline, subheadline from `src/lib/site.ts`
- Text is non-selectable
- **Subscribe** and **Join** both anchor to `#membership` (verified-email portal)
- Cohesive coastal CTA pair: shared dimensions/typography/radius/focus; Subscribe = solid coral; Join = cream glass; both use the same ocean-950/cream counter badge treatment
- Live counts as compact (`K`/`M`/`B`) circle badges (newsletter `on` / paid `active`); exact counts in CTA `aria-label`
- Counts stub to `0` when `DATABASE_URL` / members DB unavailable; homepage still loads (`members-0007`)

### Membership (`#membership`)
- After Hero, before About — compact verified-email portal (no Join | Sign-in tabs)
- **Unverified:** Name + Email + Send code / OTP strip (stacked on mobile) over branded glass gate copy (“Verify your email…”, “One code…”)
- **Verified:** same strip for Name auto-save + email change (re-OTP); session subject = Member ID UUID; newsletter toggle (default **off** on first verify; on/off without OTP while session active); non-members → Stripe Checkout plans; active paid → “Membership perks coming soon…”
- Plans: **Founding** (capped one-time) while seats remain → then **Lifetime** (one-time, fee always > Founding); **Annual** always offered
- Checkout return `/?joined=1&session_id=…#membership` auto-establishes member session
- One-click `/?unsub=<token>#membership` → newsletter off + verified session + toggle off (idempotent); invalid token shows clear message without faking verification
- APIs: `POST /api/members/verify/{start,verify}`, `POST /api/members/newsletter/preference` (session), `POST /api/members/join/checkout` (session), plus `join/plans`, `join/session`, Stripe webhook, profile name/email. Fail closed without Stripe/`DATABASE_URL`/session secrets.

### About (`#about`)
- Intro paragraphs
- **Our Board** (collapsible section): group photo placeholder stays visible; member cards show name/role always; section expand reveals all portraits + bio placeholders together (Zhong Liu / President, Yaqi Jing / VP, Albert Zang / Secretary; 1:1 portraits)
- **Our Purposes** (collapsible): 10 purpose cards; titles always visible; descriptions toggle together

### Contact (`#contact`)
- Email + mailing address card (inquiry only — no newsletter UI)

### Footer
- Org name, tagline, copyright (no duplicate contact block)

### Branding / assets
- Favicon: `src/app/icon.svg` (cream C + teal wave on forest green)
- Theme: coastal fog/forest palette in `globals.css` (ocean + driftwood tokens)
- Logo wave: ocean teal (not gold); on-light wordmark text is brown

---

## Admin (`/admin`)

### Access control
- `robots: noindex` on admin page
- Available on phone, tablet, and desktop

### Layout (left sidebar)
- Dark ocean nav (`ocean-950`): left sidebar on `md+`; on small screens brand + **collapsed menu toggle** (expands to full nav list); cream main pane
- Brand mark (logo + “Visual Arts Association”) shared with public header via `BrandMark` — same logo size (`h-7` / `sm:h-8`), centered
- Nav order: **Webmail**, **Members**, **Events**, **Financial**
- Members / Events / Financial require mailbox sign-in; **Log out** when authenticated
- Main pane shows the active panel (Webmail embed, Members roster, or scaffold placeholders)

### Webmail
- Full-pane Hover webmail via same-origin proxy `/admin/mail` (iframe; Hover blocks direct embed via `X-Frame-Options`)
- Proxy handles Roundcube paths/cookies/CSRF, auth `postMessage` bridge, task switches, and minor chrome fixes
- Known fragility: third-party Roundcube reverse proxy (session/cookie/browser differences)

### Admin auth (Hover mailbox session)
- Admin chrome is authenticated **iff** the Hover mailbox session in the mail iframe is logged in
- Detection: Roundcube session cookie + fail-closed upstream probe (`/api/admin/session`); iframe `postMessage` while Webmail is open
- Sidebar **Log out** clears proxied Roundcube cookies and remounts the mail iframe
- Privilege = anyone who can sign into `info@ccvaa.ca` via embedded webmail

### Members roster
- Mail-session gated roster at **Members** (same Hover login as Webmail)
- List / search by name or email; **plan** and **newsletter** filters are separate axes
- Table shows plan, membership status, newsletter flag; **Annual** rows show anniversary date and next renewal
- Edit (modal + confirm) and delete (confirm dialog); mutations validated with Zod; API routes under `/api/admin/members`
- Fail closed when `DATABASE_URL` is missing or Neon schema is unmigrated (503) — UI shows error state

### Post-auth scaffolds (placeholders only)
- **Events** — coming soon
- **Financial** — coming soon

---

## Members (planned)

> Work IDs: [`backlogs/members-BACKLOG.md`](backlogs/members-BACKLOG.md). Shipped behavior lands in Public / Admin sections above as items complete.

**Two orthogonal axes:** Newsletter ⊥ Membership — both managed under `#membership` after verified email. A paid member may or may not be on the newsletter.

| | Newsletter | Membership |
|--|------------|------------|
| **Meaning** | Mailing-list opt-in | Paid association (Stripe) |
| **UI** | `#membership` toggle after verify; ESP unsub → `#membership` + verified session | `#membership` Join Checkout or perks placeholder after verify |
| **Count** | Anyone with newsletter on | Active paid plans |

**Hero:** Subscribe / Join cohesive coastal CTA pair with compact (`K`/`M`/`B`) badges → both `#membership`.
**Stack:** Neon + Drizzle + Zod · Stripe · Resend · ESP · Mailosaur. Admin roster (`0008`); Resend/ESP new-tab links (`0010`); later: in-admin blast, member perks, impersonation.  
**Standing:** No Resend/ESP iframes; member auth = email OTP (no OAuth/passwords); homepage SPA anchors over separate marketing routes.

**Platform (members-0001, epic `feat/members`):** Drizzle schema on Neon — orthogonal `newsletter_status` vs `membership_plan`; OTP challenges; unsub tokens; `stripe_webhook_events` for Join idempotency. Annual plans use `membership_anniversary` + `next_renewal_at` (null for Founding/Lifetime). Shared Zod in `src/lib/members/zod/`. `GET /api/members/health` fails closed (503) without `DATABASE_URL` (Stripe/Resend status informational). Migrate/seed: `npm run db:migrate`, `npm run db:seed` (seeds non-Production only). Schema notes: [`docs/members/schema.md`](../members/schema.md).

**Newsletter (members-0003 / portal `members-0022`, epic `feat/members`):** Preference lives on `#membership` after email verify. First verify defaults newsletter **off** (CASL). Session toggle on/off requires no OTP. Token unsub `/?unsub=<token>#membership` (idempotent; newsletter off + verified session + toggle UI off; membership unchanged). ESP sync stub in `src/lib/members/esp.ts` — footer URL: [`docs/members/esp.md`](../members/esp.md). APIs: `POST /api/members/newsletter/preference` (session), legacy subscribe/confirm/unsub routes retained for tooling.

**Join / Stripe (members-0004 + portal `members-0022`, epic `feat/members`):** Verified session → plan picker → `POST /api/members/join/checkout` → Stripe Checkout (test keys on Dev/Preview). Success return includes Stripe `session_id`; `POST /api/members/join/session` mints httpOnly member cookie (**members-0014**). Pre-cap Founding+Annual; post-cap Lifetime+Annual. Env: `STRIPE_*`, `MEMBERSHIP_FOUNDING_CAP`, fee cents (Lifetime > Founding enforced). Webhook: `POST /api/members/webhooks/stripe`. Live keys: `members-0009`.

**Member auth (members-0005 / portal `members-0022`, epic `feat/members`):** Email verify OTP (`purpose=email_verify`) upserts `members` and mints httpOnly `ccvaa_member_session` bound to Member ID UUID (plan may be `none`). 7-day TTL. Logout clears cookie only (does not touch Hover admin). APIs: `POST /api/members/verify/{start,verify}`, `POST /api/members/login/logout`. **Never grants `/admin`.**

**Member profile (members-0006 / portal `members-0022`, epic `feat/members`):** Verified strip — Name debounced auto-save; email change requires `email_verify` OTP on the new address; Annual shows read-only anniversary / next renewal; paid members see perks placeholder (`members-0012`). APIs: `GET /api/members/profile`, `PATCH /api/members/profile/name`, `POST /api/members/profile/email/{start,verify}`.

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
| Stack | Next.js App Router, React, Tailwind; admin auth = Hover mail-session; Members DB = Neon + Drizzle (`DATABASE_URL`) |
| Ship path | Feature branch → QA Preview → merge → cleanup → QA on `ccvaa-web.vercel.app` (Verifier = `agent`). **Epic/milestone (opt-in):** shared branch; Pass 1 per ticket; merge only on **merge milestone**. **Verifier = `ceo`:** CEO verifies (defaults: `direct-to-main` + Production pass2). Work IDs `{feature-slug}-{NNNN}` — [`BACKLOG.md`](BACKLOG.md). **Baseline** pass = Production audit with no PR. See `docs/protocols/GIT_DEPLOY.md`. CEO may manually check `ccvaa.ca`. |

### Important technical notes for Developer
- Next.js 16: prefer `proxy.ts` over deprecated `middleware.ts`
- Read `node_modules/next/dist/docs/` before novel Next APIs
- Never commit `.env.local` or secrets
- Default: feature branch + PR with backlog work ID `{feature-slug}-{NNNN}`; merge/push `main` only when CEO asks (product Dev). **agent-os** after **`verified`:** PM ships same turn.
- Admin mail proxy on Preview needs network reachability to `mail.hover.com`

---

## Known gaps / next candidates

Work-to-do lives in **[`BACKLOG.md`](BACKLOG.md)** (feature files under `backlogs/`). Do not duplicate long lists here.

---

## Changelog (high level)

**Order (required):** rows **descending by date** (`YYYY-MM-DD`). Same-day rows: newest event first. Month-only folds (`YYYY-MM`) sit **after** all dated rows in that month. Keep rows **one line** each. When the table grows past ~30 rows, PM may fold older entries into a single monthly summary row (history remains in git). New entries always go at the **top** of their date group (usually the top of the table).

| When | What |
|------|------|
| 2026-07-16 | **members-0022** (epic `feat/members`): `#membership` verified-email portal; newsletter moves from Contact; unsub → `#membership` + session; Hero Subscribe+Join → `#membership` with cohesive coastal CTAs |
| 2026-07-16 | **members-0021** (epic `feat/members`): Contact newsletter tabs Subscribe \| Unsubscribe; email-only unsub with distinct outcomes; one-click `/?unsub=` lands on Unsubscribe tab |
| 2026-07-16 | **members-0020** (epic `feat/members`): Membership UI declutter — no section/Join titles; Sign-in \| Join tabs (Sign-in default); two-column plan grid; compact profile; Hero badges compact K/M/B + brand contrast |
| 2026-07-16 | **members-0019** (epic `feat/members`): `#membership` Join \| Sign-in tabs (Join default); Hero counts as top-right circle badges on Subscribe/Join |
| 2026-07-16 | **members-0018** (epic `feat/members`): trim Join/newsletter/membership UI notes; keep CASL + newsletter≠membership clarity |
| 2026-07-16 | **members-0016** (epic `feat/members`): Hero subscriber/member counts as annotations beside Subscribe/Join CTAs |
| 2026-07-16 | **members-0014** (epic `feat/members`): Checkout success return auto-establishes member session → `#membership` profile (webhook race poll) |
| 2026-07-16 | **members-0015** (epic `feat/members`): Join + newsletter opt-in uses one email OTP only; webhook activates newsletter without a second confirm mail |
| 2026-07-16 | **members-0017** (epic `feat/members`): newsletter Name required; shared international `personNameSchema` for newsletter + Join + profile |
| 2026-07-14 | **members-0006** (epic `feat/members`): `#membership` logged-in profile — name edit, email change with OTP re-verify, Annual anniversary/renewal read-only, perks placeholder |
| 2026-07-14 | **agent-os-0014:** Preview browser bypass requires `x-vercel-set-bypass-cookie` (with protection-bypass) for Pass 1 |
| 2026-07-14 | **members-0005** (epic `feat/members`): `#membership` email OTP login → httpOnly member session + logout; never grants `/admin` |
| 2026-07-14 | **members-0004** (epic `feat/members`): `#membership` Join UI + Stripe Checkout (test); Founding seat cap; webhook activation; Hero Join → `#membership` |
| 2026-07-14 | **members-0003** (epic `feat/members`): Contact newsletter — double opt-in, manage preference, token unsub landing; Hero Subscribe → `#contact`; ESP stub + docs |
| 2026-07-14 | **agent-os-0013:** CEO talks only to PM; PM invokes Dev/QA (no CEO Dev/QA chats) |
| 2026-07-14 | **agent-os-0012** self-evolve: epic status/close/Pass 1 notes; thin-rule defaults; Members epic pre-wire |
| 2026-07-14 | Guiding principle #9: living docs = current state (prune leftovers with every OS change) |
| 2026-07-14 | Agent OS docs prune: align thin rules/`n/a`/epic; drop obsolete FEAT- template; fix `tbd` Ship paths |
| 2026-07-13 | **agent-os-0011:** epic/milestone ship lane (shared branch; merge on milestone) |
| 2026-07-13 | Members backlog final review: build-order waves; ESP stubs; dep/hygiene consistency |
| 2026-07-13 | FEATURES prune: drop obsolete admin OTP/SMTP/Redis negatives; tighten Admin/Infra current-state copy |
| 2026-07-13 | Members backlog + FEATURES: newsletter ⊥ membership; homepage Nav→Hero→Membership→About→Contact→Footer |
| 2026-07-13 | **agent-os-0010:** FEATURES changelog must be descending by date (OS rule + table resort) |
| 2026-07-13 | **Members** feature backlog opened (`members-0001`+); `admin-console-0001` closed as superseded |
| 2026-07-12 | **agent-os-0009** self-evolve: principles↔self-evolve; agent QA gate trim; baseline = Production QA mode; changelog hygiene (PR #6) |
| 2026-07-12 | “Go back to Hover.com” opens in a new tab from mail iframe (`admin-console-0012`) |
| 2026-07-12 | Hide Hover pre-login help block in mail iframe (`admin-console-0011`) |
| 2026-07-12 | **agent-os-0008:** OS **self-evolve** workflow (CEO kickoff; PM loop on feature branch; CEO merge gate) |
| 2026-07-12 | **agent-os-0007:** Guiding principles; stale-doc sweep; role titles; ship/tiny-fix defaults; workflow map + `verified` table + rare paths; HANDOFF gates matrix |
| 2026-07-12 | **agent-os-0005:** PM chat title `Product Manager`; ephemeral fixed-name handoffs/reports; backlog ID-desc + `closed` status; `ADMIN_EMAIL`/`ADMIN_PASS` for QA |
| 2026-07-12 | Embedded Hover mail iframe fixes (`admin-console-0009`): refresh 403, More/Mark reload, hide blank `#header` |
| 2026-07-12 | Admin auth = Hover mailbox iframe session; OTP pruned; dark sidebar console + mail embed UX; mobile gate removed (`admin-console-0010`, PR #4) |
| 2026-07-12 | Admin sidebar dark theme + logo width match nav column; drop “· Admin” (`admin-console-0010` Iteration 12, PR #4) |
| 2026-07-11 | **Verifier** `agent` \| `ceo` \| `n/a` + **Verify passes**; CEO may bypass agent QA; `agent-os` uses `n/a`; **`verified` on agent-os ⇒ ship per Ship path** |
| 2026-07-11 | OTP shared store via Marketplace Redis (`KV_REST_API_*`); `admin-console-0007` closed |
| 2026-07-11 | Feature backlogs replace ROADMAP; work IDs `{feature-slug}-{NNNN}` |
| 2026-07-11 | `/admin` page intro blurb removed (`admin-console-0008`) |
| 2026-07-10 | `/admin` OTP + Hover mail proxy + scaffolds; multi-agent OS bootstrapped |
| 2026-07-10 | Encoded feature-branch → Preview QA → merge → Production QA (`ccvaa-web.vercel.app`); `ccvaa.ca` CEO-manual only |
| 2026-07-10 | Ship path field: CEO owns `direct-to-main` approval; Developer follows handoff literally |
| 2026-07-10 | Post-merge: delete feature branch local+remote before Pass 2; Pass 2 fixes = new branch from main |
| 2026-07-10 | Added standard **baseline** QA pass (Production audit, no PR) |
| 2026-07-10 | QA OTP: single-Send + CEO-in-the-loop protocol (`QA_AUTH.md`) to protect rate limits |
| 2026-07 | Public site, board/purposes UX, branding/logos, favicon |
