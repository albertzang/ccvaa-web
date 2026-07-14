# Backlog: Members

**Feature:** Members  
**Slug:** `members`  
**Owner:** Product Manager  
**Next ID:** `0014`  

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

**Ship lane:** Default for Verifier=`agent` tickets in the first Members milestone: **Epic branch `feat/members`**, **Merge gate `epic`** (fields set on `0001`–`0008` and `0010`). `members-0009` (CEO go-live) stays outside that gate. See [`GIT_DEPLOY.md`](../../protocols/GIT_DEPLOY.md#epic--milestone-ship-lane-opt-in).

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
| **Status** | `not-started` |
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

### Links

- Depends on: `members-0001`
- FEATURES.md: Admin → Members

---

## members-0007 — Hero Subscribe / Join + counters

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `not-started` |
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

### Links

- Depends on: counts from `0003` / `0004` (stubs OK)

---

## members-0006 — `#membership` logged-in: profile

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `not-started` |
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

### Links

- Depends on: `members-0005`
- Shares slot with: `members-0004`

---

## members-0005 — Member email OTP login

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `not-started` |
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

### Links

- Depends on: `members-0001`, `members-0002` (seeded or real members for QA; Join `0004` not required to start)
- FEATURES.md: Members → Login

---

## members-0004 — Stripe Join (Founding / Lifetime / Annual)

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `not-started` |
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

### Links

- Depends on: `members-0001`, `members-0002`
- Shares slot with: `members-0006`

---

## members-0003 — Contact newsletter (subscribe / manage / unsub)

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `not-started` |
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

### Links

- Depends on: `members-0001`, `members-0002`

---

## members-0002 — Resend transactional + OTP helpers + Mailosaur

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `not-started` |
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

### Links

- Depends on: `members-0001`

---

## members-0001 — Neon + Drizzle + Zod + env split + seeds

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `not-started` |
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

### Links

- FEATURES.md: Infra; Members (planned)
