# Backlog: Members

**Feature:** Members  
**Slug:** `members`  
**Owner:** Product Manager  
**Next ID:** `0021`  

Canonical work IDs: `members-NNNN`. Schema: [`../BACKLOG.md`](../BACKLOG.md).

## Product model

Two **orthogonal** axes (not one ladder of plans):

| Axis | What it is | Plans / states | Primary UI |
|------|------------|----------------|------------|
| **Newsletter** | Mailing-list opt-in | On / off (double opt-in; unsubscribe anytime) | Contact `#contact` |
| **Membership** | Paid association (Stripe) | Founding · Lifetime · Annual · none | `#membership` |

**Membership plans:** Founding (one-time, capped, lifetime) → after cap, Join shows Lifetime (one-time, fee always higher than Founding) instead of Founding; Annual (yearly recurring) always offered alongside. Annual stores anniversary / next renewal from Stripe. Auth: email OTP (not admin Hover); no OAuth/passwords.

**`#membership`:** after Hero, before About. Logged out → Join; logged in (paid) → profile (+ future perks). Newsletter never lives here.

**Homepage order:** Nav → Hero → `#membership` → About → Contact → Footer. Hero: Subscribe / Join + counters → `#contact` / `#membership` (anchors only).

**Counts:** Members = active paid; Newsletter subscribers = anyone with newsletter on.

**Stack:** Neon + Drizzle + Zod · Stripe (test on Dev/Preview) · Resend (transactional) · ESP (blasts; preference sync from Neon) · Mailosaur (Preview QA). Admin: Resend/ESP **new-tab links** only (no iframes; Hover remains the only embed). In-admin blast send = `members-0011` (`later`).

CEO sets fees, Founding cap, Lifetime fee (> Founding), Stripe Price IDs, ESP name before Production (`members-0009`).

**Suggested build order** (not started until CEO kickoff):
1. Platform — `0001` → `0002`
2. Public newsletter — `0003` (ESP sync may stub until provider chosen)
3. Public membership — `0004` → `0005` → `0006` (same `#membership` slot); `0007` can stub counts early
4. Admin roster — `0008`
5. Then `next`: `0010` links → `0009` go-live (CEO); `later`: `0011`–`0013`

**Ship lane:** Default for Verifier=`agent` tickets in the first Members milestone: **Epic branch `feat/members`**, **Merge gate `epic`** (fields set on `0001`–`0008`, `0010`, and `0014`–`0020`). `members-0009` (CEO go-live) stays outside that gate. See [`GIT_DEPLOY.md`](../../protocols/GIT_DEPLOY.md#epic--milestone-ship-lane-opt-in).

---

## members-0020 — Simplify Membership UI + compact Hero badges

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `in-progress` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |
| **Epic branch** | `feat/members` |
| **Merge gate** | `epic` |

### Description

CEO manual-test refinement after `members-0019`: further reduce the public Membership UI’s hierarchy, text, and vertical footprint in both logged-out and logged-in states.

**Logged out:** remove the Membership section title/subtitle. Tabs become **Sign in** on the left and **Join** on the right, with **Sign in selected by default**. In Join, remove its title/subtitle and the visible “Choose a plan” legend; show the two currently offered plans side-by-side in a two-column selection grid (stack only where necessary on narrow screens).

**Logged in:** remove the section title/subtitle and simplify the profile into one calm, compact surface. Preserve plan/renewal information, name edit, email re-verification, feedback, and sign-out, but reduce stacked cards, placeholder copy, notes, and always-visible edit controls. Prefer summary-first with secondary edit actions revealed on demand. Remove the future-perks placeholder and `/admin` explanatory note from the public profile.

**Hero badges:** format large counts with compact notation (`K` / `M` / `B`) so the circle never overflows; keep the exact count in accessible labels. Replace plain black-on-white styling with a brand-consistent, high-contrast treatment that remains distinct on both Hero CTAs.

**Acceptance:**
- [ ] Membership section title/subtitle absent when logged out and logged in
- [ ] Logged out tabs: **Sign in** left/default; **Join** right; one panel visible
- [ ] Join title/subtitle and visible “Choose a plan” text removed
- [ ] Offered plans use two columns at suitable widths and stack cleanly on narrow mobile
- [ ] Logged-in profile is materially less cluttered without losing name/email/plan/renewal/sign-out capability
- [ ] Future-perks placeholder and `/admin` note removed from the public profile
- [ ] Hero badges use compact `K` / `M` / `B` notation for large values, cannot overflow, and retain exact accessible counts
- [ ] Badge colors use accessible CCVAA brand styling rather than black on white
- [ ] Desktop + mobile; FEATURES.md updated

**Out of scope:** Moving newsletter UI; changing membership behavior, Stripe Checkout, data model, or counter definitions; merge to main.

### Overall

- Pass 1 (2026-07-16): **continue epic** — Sign-in default tabs; Join declutter + two-column plans; logged-in summary profile; Hero ocean/coral compact badges. Report tip `cc465ed`.

### Links

- Source: CEO manual test (2026-07-16)
- Depends on: `members-0006`, `members-0019`
- PR: https://github.com/albertzang/ccvaa-web/pull/8

---

## members-0019 — Membership tabs + Hero count badges

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `in-progress` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |
| **Epic branch** | `feat/members` |
| **Merge gate** | `epic` |

### Description

CEO: `#membership` feels overwhelming with Join + Sign-in stacked. Use **tabs** — **Join** (default) | **Sign in** — show only one full form at a time. Newsletter UI stays in Contact (not moved).

Same ticket: Hero Subscriber/Member counts become a **simple number in a circle** on the **top-right corner** of the Subscribe / Join buttons (badge overlay), replacing the beside-button annotation from `members-0016`. Keep live counts + anchors. Accessible (don’t rely on color alone; expose count to AT). Mobile-friendly; avoid cluttering the hero.

**Acceptance:**
- [ ] Logged-out `#membership`: tabs Join | Sign in; **Join selected by default**; only active tab’s form visible
- [ ] Logged-in: profile only (no tabs clutter)
- [ ] Newsletter public UI remains in Contact
- [ ] Hero: count badge = numeric circle on top-right of Subscribe (subscribers) and Join (members)
- [ ] Prior beside-button annotation removed/replaced
- [ ] Desktop + mobile; FEATURES.md updated

**Out of scope:** Moving newsletter into Membership; Checkout/Elements changes; merge to main.

### Overall

- Pass 1 (2026-07-16): **continue epic** — Join|Sign-in tabs (Join default); Hero circle badges; newsletter still Contact. Report tip `0f57d29`. Logged-in profile-only not exercised this pass (no session).

### Links

- Source: CEO product choice (2026-07-16) — Option B tabs + corner badges
- Depends on: `members-0005`, `members-0007`, `members-0016`
- PR: https://github.com/albertzang/ccvaa-web/pull/8

---

## members-0018 — Trim excessive Members UI notes

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `in-progress` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |
| **Epic branch** | `feat/members` |
| **Merge gate** | `epic` |

### Description

CEO feedback: some explanatory notes on Join / newsletter / membership UI feel excessive. Tighten copy — keep CASL / membership-separate / legal necessities; remove redundant helper text and stacked notes that clutter `#membership` and `#contact`.

**Acceptance:**
- [ ] Audit Join, newsletter subscribe/manage, and logged-in membership chrome for redundant notes
- [ ] Keep required legal/CASL and “newsletter ≠ membership” clarity in one short line where needed
- [ ] FEATURES.md copy notes if behavior/text contracts change

**Out of scope:** New features; redesign of whole homepage.

### Overall

- Pass 1 (2026-07-16): **continue epic** — notes trimmed; CASL + newsletter≠membership clear. Report tip `d69adfa`.

### Links

- Source: CEO manual test (2026-07-16)
- PR: https://github.com/albertzang/ccvaa-web/pull/8

---

## members-0017 — Required international Name (newsletter + membership)

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `in-progress` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |
| **Epic branch** | `feat/members` |
| **Merge gate** | `epic` |

### Description

Make **Name required** on newsletter subscribe (Contact). Ensure Name validation supports people from different countries/languages for **both** newsletter and membership Join (Unicode letters, spaces, common punctuation; avoid ASCII-only / Latin-only rules). Align Zod + UI required markers + error messages.

**Acceptance:**
- [ ] Newsletter subscribe requires non-empty name (API + UI)
- [ ] Join name already required — same international-friendly validation rules
- [ ] Zod schemas reject empty/whitespace; accept diverse scripts/diacritics within a sane max length
- [ ] FEATURES.md updated

**Out of scope:** Legal name verification; address/phone fields.

### Overall

- Pass 1 (2026-07-16): **continue epic** — name required; Unicode/diacritics OK. Report tip `d69adfa`.

### Links

- Source: CEO manual test (2026-07-16)
- PR: https://github.com/albertzang/ccvaa-web/pull/8

---

## members-0016 — Hero counters as button annotations

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `in-progress` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |
| **Epic branch** | `feat/members` |
| **Merge gate** | `epic` |

### Description

CEO: Subscriber / Member counters should read as **annotations beside** the Hero **Subscribe** / **Join** buttons (not a separate heavy strip or competing layout). Preserve live counts; keep anchors to `#contact` / `#membership`. Fit existing brand; mobile-friendly.

**Acceptance:**
- [ ] Counts sit as annotation UI adjacent to each CTA (Subscribe ↔ subscribers; Join ↔ members)
- [ ] Counts still update from platform APIs; zeros OK when empty
- [ ] Desktop + mobile readable; no new card clutter in hero
- [ ] FEATURES.md Hero CTAs updated

**Out of scope:** Changing what is counted; forms inside the hero.

### Overall

- Pass 1 (2026-07-16): **continue epic** — counts as annotations beside Subscribe/Join. Report tip `d69adfa`.

### Links

- Source: CEO manual test (2026-07-16)
- Depends on: `members-0007`
- PR: https://github.com/albertzang/ccvaa-web/pull/8

---

## members-0015 — One email verify for Join + newsletter opt-in

| Field | Value |
|-------|--------|
| **Type** | `bug` |
| **Priority** | `now` |
| **Status** | `in-progress` |
| **Source** | `ceo` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |
| **Epic branch** | `feat/members` |
| **Merge gate** | `epic` |

### Description

**Summary:** Checking newsletter opt-in on Join should not require a second, separate newsletter confirmation email. One successful email verification during Join should cover membership verify **and** newsletter opt-in.

**Environment:** Preview / Dev Join flow  
**Expected:** Single OTP (or single verify step); on success, newsletter preference is set without a second Resend confirm.  
**Actual:** Separate membership and newsletter verification emails / steps (CEO report).  
**Severity:** high (friction + duplicate mail)

**Acceptance:**
- [ ] Join with newsletter checked → one OTP email only
- [ ] After verify + Checkout success, newsletter is on (or pending→on per product rules) without a second confirm mail
- [ ] Join without newsletter unchecked → membership-only path unchanged
- [ ] Contact-only subscribe still double opt-in as today
- [ ] FEATURES.md Join / newsletter notes

**Out of scope:** Changing Contact-only subscribe to single opt-in; ESP blast copy.

### Overall

- Pass 1 (2026-07-16): **continue epic** — one Join OTP; newsletter on after Checkout; Contact still double opt-in. Report tip `d69adfa`.

### Links

- Source: CEO manual test (2026-07-16)
- Depends on: `members-0003`, `members-0004`
- PR: https://github.com/albertzang/ccvaa-web/pull/8

---

## members-0014 — Auto-login after successful Join Checkout

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `in-progress` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |
| **Epic branch** | `feat/members` |
| **Merge gate** | `epic` |

### Description

After successful Stripe Checkout return (`/?joined=1#membership`), automatically establish the member session (same httpOnly cookie as OTP login) so the user lands on the logged-in `#membership` profile without a separate sign-in.

**Acceptance:**
- [ ] Successful Join return → signed-in session for that member email
- [ ] `#membership` shows profile (not Join) after return
- [ ] Session still never grants `/admin`
- [ ] Safe if webhook races (retry/wait or clear messaging if membership not active yet)
- [ ] FEATURES.md Join / login notes

**Out of scope:** Changing Checkout itself; password auth; admin Hover session.

### Overall

- Pass 1 (2026-07-16): **continue epic** — Checkout return → auto session → profile; `grantsAdmin: false`. Report tip `d69adfa`.

### Links

- Source: CEO manual test (2026-07-16)
- Depends on: `members-0004`, `members-0005`
- PR: https://github.com/albertzang/ccvaa-web/pull/8

---

## members-0013 — Admin impersonation

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `later` |
| **Status** | `not-started` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |

### Description

Admin temporarily views the site / account as a selected member (clear chrome, exit control, audit trail). After roster + member login.

**Acceptance:**
- [ ] Start/end impersonation with obvious chrome
- [ ] Audit attribution agreed with CEO
- [ ] FEATURES.md updated when shipped

**Out of scope:** Permanent role change.

### Links

- Depends on: `members-0005`, `members-0008`

---

## members-0012 — Member perks

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `later` |
| **Status** | `not-started` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |

### Description

Member perks: benefits exclusively for paid members, surfaced from the logged-in `#membership` face. Exact perk set, delivery (e.g. third-party member store vs on-site), and eligibility by plan are TBD when we reopen this item.

**Acceptance:** TBD with CEO when kickoff.

**Out of scope:** TBD.

### Links

- Depends on: `members-0006`

---

## members-0011 — Admin: send newsletter blast in-app

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `later` |
| **Status** | `not-started` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |

### Description

Compose/trigger a newsletter blast from `/admin` via ESP and/or Resend APIs against Neon newsletter audience (CASL / our unsub URL). Confirm-before-send. After `members-0010` + ESP sync.

**Acceptance:**
- [ ] Admin can initiate blast from admin UI
- [ ] Audience = newsletter-on from Neon (or synced); fail closed if API/sync unhealthy
- [ ] Confirm UX; Zod validates payload; CASL/unsub intact
- [ ] FEATURES.md updated when shipped

**Out of scope:** Vendor iframes; full Resend template studio in admin.

### Links

- Depends on: `members-0003`, `members-0010`, ESP sync

---

## members-0010 — Admin email ops (Resend + ESP links)

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `next` |
| **Status** | `not-started` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |
| **Epic branch** | `feat/members` |
| **Merge gate** | `epic` |

### Description

Admin Email/Newsletter panel: short ops copy + new-tab links to Resend (transactional) and ESP (templates/blasts; provider name from CEO). No iframes. Neon remains list truth.

**Acceptance:**
- [ ] Admin entry + Resend + ESP links (`target="_blank"`)
- [ ] Copy: Resend vs ESP vs Neon ownership
- [ ] No Resend/ESP iframes; FEATURES.md noted

**Out of scope:** In-admin blast (`members-0011`).

### Links

- Depends on: `members-0008` (or adjacent admin chrome)

---

## members-0009 — ESP harden + Production go-live

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `next` |
| **Status** | `not-started` |
| **Verifier** | `ceo` |
| **Verify passes** | `pass2` |
| **Ship path** | `feature-branch` |

### Description

Harden ESP preference sync. CEO sets live fees/cap/Price IDs + Resend/Stripe/ESP/Neon Production env. Smoke: newsletter confirm, unsub via `#contact` token, one Join path, one ESP blast with correct unsub URL.

**Acceptance:**
- [ ] ESP documented; sync covers subscribe/unsubscribe/Contact preference
- [ ] CEO live-keys / fees checklist complete before live Checkout
- [ ] Production smokes above (or CEO-approved dry-run)

**Out of scope:** Model changes; `0011`–`0013`.

### Links

- Depends on: core public/admin paths through `members-0008`

---

## members-0008 — Admin roster (newsletter ⊥ membership)

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `in-progress` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |
| **Epic branch** | `feat/members` |
| **Merge gate** | `epic` |

### Description

Replace Members scaffold with roster gated by Hover mail-session. Filter/search by **plan** and **newsletter-on** as separate concerns. Update/delete need confirmation. Show plan, status, newsletter flag, Annual anniversary/next renewal. Zod on mutations. No impersonation.

**Acceptance:**
- [ ] List / search / filter (plan + newsletter)
- [ ] Confirm UX for update/delete; Zod on payloads
- [ ] Annual anniversary / next renewal visible
- [ ] Mail-session gated; FEATURES.md Admin → Members updated

**Out of scope:** Impersonation (`members-0013`); Events/Financial; public CTAs.

### Overall

- Pass 1 (2026-07-15): **continue epic** — admin roster list/search/filters, Zod, mail-session gate. Report tip `2093de1`.

### Links

- Depends on: `members-0001`
- FEATURES.md: Admin → Members
- PR: https://github.com/albertzang/ccvaa-web/pull/8

---

## members-0007 — Hero Subscribe / Join + counters

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `in-progress` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |
| **Epic branch** | `feat/members` |
| **Merge gate** | `epic` |

### Description

Hero **Subscribe** + **Join** with live counters (anchors only): Subscribe → `#contact`; Join → `#membership`. Counts per product model. Stub zeros OK before backends land.

**Acceptance:**
- [ ] Hero CTAs + counters; correct anchors
- [ ] Counts/axes labeled without implying newsletter is a plan
- [ ] FEATURES.md Hero updated

**Out of scope:** Forms in hero; Checkout (`0004`); Contact form (`0003`); profile (`0006`).

### Overall

- Pass 1 (2026-07-14): **continue epic** — Hero CTAs + dual-axis counters (0s without seeded Preview Neon). Report: `docs/reports/QA-pass1.md` (`70874a2`)

### Links

- Depends on: counts from `0003` / `0004` (stubs OK)
- PR: https://github.com/albertzang/ccvaa-web/pull/8

---

## members-0006 — `#membership` logged-in: profile

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `in-progress` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |
| **Epic branch** | `feat/members` |
| **Merge gate** | `epic` |

### Description

Logged-in face of `#membership` (same slot as Join). Profile: name; email change requires re-verify. Optional light placeholder for future perks (`members-0012`). Annual: read-only anniversary / next renewal. No newsletter UI here. Zod on profile updates.

**Acceptance:**
- [ ] Paid session shows profile in `#membership` (perks area can be a light placeholder)
- [ ] Name edit; email re-verify before identity update
- [ ] Annual renewal date when applicable
- [ ] Zod validates profile; FEATURES.md `#membership` updated

**Out of scope:** Billing portal; Join Checkout (`0004`); newsletter (`0003`); defining real perks (`0012`).

### Overall

- Pass 1 (2026-07-14): **continue epic** — logged-out UI + fail-closed APIs OK; logged-in profile E2E blocked (Preview Neon unmigrated). Report: `docs/reports/QA-pass1.md` (`95a4497`)
- Pass 1 (2026-07-15): **continue epic** — logged-in profile E2E (Mailosaur session). Report tip `2093de1` / `61face7`.

### Links

- Depends on: `members-0005`
- Shares slot with: `members-0004`
- PR: https://github.com/albertzang/ccvaa-web/pull/8

---

## members-0005 — Member email OTP login

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `in-progress` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |
| **Epic branch** | `feat/members` |
| **Merge gate** | `epic` |

### Description

Homepage SPA login wall for `#membership`: 6-digit OTP (Resend) → httpOnly session; logout. DB-backed challenges; Zod; Mailosaur on Preview. Does not grant `/admin`. Crosses wall: Join → profile.

**Acceptance:**
- [ ] Login from/near `#membership`; OTP + session + logout
- [ ] Zod; rate limits/expiry documented; no admin privilege
- [ ] FEATURES.md Member auth

**Out of scope:** OAuth; passwords; admin auth; join/subscribe forms.

### Overall

- Pass 1 (2026-07-14): **continue epic** — sign-in UI + session/logout/admin isolation OK; live OTP E2E blocked (Preview Neon unmigrated / no Mailosaur). Report: `docs/reports/QA-pass1.md` (`0f0bada`)
- Pass 1 hold (2026-07-14, Dev probe): schema missing on Preview Neon branch while health `db.ok`.
- Pass 1 (2026-07-15): **continue epic** — live Mailosaur OTP login → session → logout; `grantsAdmin: false`. Report tip `239574a`.

### Links

- Depends on: `members-0001`, `members-0002` (seeded or real members for QA; Join `0004` not required to start)
- FEATURES.md: Members → Login
- PR: https://github.com/albertzang/ccvaa-web/pull/8

---

## members-0004 — Stripe Join (Founding / Lifetime / Annual)

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `in-progress` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |
| **Epic branch** | `feat/members` |
| **Merge gate** | `epic` |

### Description

Logged-out `#membership` Join UI + Stripe Checkout (test on Dev/Preview). Flow: name, email, optional newsletter opt-in → email verify → Checkout → webhook activates membership; return to `/`. Pre-cap: Founding + Annual; post-cap: Lifetime + Annual. Race-safe Founding seat cap; Lifetime fee > Founding. Annual anniversary/nextRenewalAt from Stripe. Zod on join payloads. Idempotent webhooks.

**Acceptance:**
- [ ] Join UI in `#membership` when logged out; hero Join anchors here
- [ ] Plan rules + seat cap + Lifetime fee validation
- [ ] Verify → Checkout → webhook; return to `/`; anniversary fields for Annual
- [ ] Optional newsletter opt-in stored; env placeholders for fees/Price IDs/cap
- [ ] FEATURES.md Join / `#membership`

**Out of scope:** Monthly plans; Customer Portal; live keys (`0009`); logged-in chrome (`0006`).

### Overall

- Pass 1 (2026-07-14): **continue epic** — Join UI + fail-closed without Stripe; live Checkout/OTP blocked pending Resend + Stripe test secrets + migrate. Report: `docs/reports/QA-pass1.md`
- Pass 1 hold (2026-07-15): Checkout failed — Preview `STRIPE_PRICE_*` were Product IDs (`prod_…`) not Price IDs (`price_…`). Report `9ba157a`.
- Pass 1 (2026-07-15): **continue epic** — live Join → Mailosaur OTP → Stripe Checkout → webhook activation. Report tip `829c3e9`.

### Links

- Depends on: `members-0001`, `members-0002`
- Shares slot with: `members-0006`
- PR: https://github.com/albertzang/ccvaa-web/pull/8

---

## members-0003 — Contact newsletter (subscribe / manage / unsub)

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `in-progress` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |
| **Epic branch** | `feat/members` |
| **Merge gate** | `epic` |

### Description

Contact `#contact` owns the **Newsletter** axis: subscribe (double opt-in via Resend), manage preference (incl. paid members), and tokenized unsubscribe landing (`/?unsub=<token>#contact`). Unsub never cancels membership. Sync on/off to ESP when provider is configured (stubs OK until then). Zod. Hero Subscribe anchors here.

**Acceptance:**
- [ ] Contact UI for newsletter-only people and paid members’ preference
- [ ] Double opt-in; unconfirmed do not count; ESP sync
- [ ] Unsub token → `#contact`; idempotent; membership unchanged; ESP footer URL documented
- [ ] CASL-friendly; copy does not treat newsletter as a plan
- [ ] FEATURES.md Contact → Newsletter

**Out of scope:** Join Checkout (`0004`); `#membership` profile (`0006`).

### Overall

- Pass 1 (2026-07-14, early): UI checks ok while DB missing — **continue epic** (stale once `DATABASE_URL` landed).
- Pass 1 (2026-07-14): **hold** — Resend missing / unmigrated → generic **500** (Iteration 2).
- Iteration 2 Pass 1 (2026-07-14): **continue epic** — clear **503** fail-closed (`MEMBERS_EMAIL_UNAVAILABLE` / `MEMBERS_DB_UNAVAILABLE`); live double opt-in still blocked until Neon migrate+seed on Preview. Report: `docs/reports/QA-pass1.md` (`d0f360b` / tip).
- Pass 1 hold (2026-07-14, Dev probe): schema missing on Preview Neon branch while health `db.ok`.
- Pass 1 (2026-07-15): **continue epic** — live subscribe → Mailosaur OTP → confirm; preference; hero/unsub. Report tip `239574a`.

### Links

- Depends on: `members-0001`, `members-0002`
- PR: https://github.com/albertzang/ccvaa-web/pull/8

---

## members-0002 — Resend transactional + OTP helpers + Mailosaur

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `in-progress` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |
| **Epic branch** | `feat/members` |
| **Merge gate** | `epic` |

### Description

Resend send path; shared confirm + OTP helpers (DB challenges, expiry, rate limits). Document Mailosaur for Preview QA. `.env.example` only.

**Acceptance:**
- [ ] Resend works on Dev/Preview with test keys
- [ ] Confirm + OTP helpers; Mailosaur notes; `.env.example` updated

**Out of scope:** Public forms; Stripe; admin roster; full ESP API.

### Overall

- Pass 1 (2026-07-14): **continue epic** — health fail-closed; live OTP blocked pending secrets (`DATABASE_URL`, `RESEND_*`, optional Mailosaur). Report: `docs/reports/QA-pass1.md`

### Links

- Depends on: `members-0001`

---

## members-0001 — Neon + Drizzle + Zod + env split + seeds

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `in-progress` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |
| **Epic branch** | `feat/members` |
| **Merge gate** | `epic` |

### Description

Neon + Drizzle schema for **newsletter** and **membership** (orthogonal), OTP/challenges, unsub tokens. Annual: `membershipAnniversary` and/or `nextRenewalAt` (null for Founding/Lifetime). Shared Zod modules. Prod vs Dev connection strings; Preview via branch/env. Non-Production seeds (incl. one Annual with known anniversary). Document Dev `.env.local` (Neon + Stripe test + Mailosaur).

**Acceptance:**
- [ ] Migrations runnable; anniversary fields documented
- [ ] Zod shared module; env split in `.env.example` / FEATURES
- [ ] Seeds non-Production only; fail closed when members routes need DB

**Out of scope:** Public UI; Stripe Checkout; Resend copy; admin UI.

### Overall

- Pass 1 (2026-07-14): **continue epic** — Preview health fail-closed 503 without `DATABASE_URL`; CI green; migrate/seed not exercised (no local/Preview `DATABASE_URL` yet). Report: `docs/reports/QA-pass1.md`

### Links

- FEATURES.md: Infra; Members (planned)
- PR: https://github.com/albertzang/ccvaa-web/pull/8
