# Backlog: Public Homepage

**Feature:** Public Homepage  
**Slug:** `public-homepage`  
**Owner:** Product Manager  
**Next ID:** `0004`

Canonical work IDs: `public-homepage-NNNN`. Schema: [`../BACKLOG.md`](../BACKLOG.md).

---

## public-homepage-0003 — Umbrella: public homepage UI tweaks

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `completed` |
| **Verifier** | `ceo` |
| **Verify passes** | `pass2` |
| **Ship path** | `direct-to-main` |

### Description

Umbrella CEO-driven public homepage polish. Shipped as one squashed `main` commit after CEO complete/`verified`.

**Shipped scope:**
- About / Contact headings shortened; sticky hero stage through membership; hero copy content-height
- Logged-out: OTP + Sub/Join in Hero (Sub/Join row then OTP row); no Membership nav/section until verify
- Verified `#membership`: quiet identity fields, newsletter toggle, join/perks, banners, hero counter refresh
- Join return activates membership without waiting solely on webhook; strip `joined` query after success
- Plan/newsletter copy cleanup; founding seats on Founding card

### Overall

- CEO complete 2026-07-25 → squash + push `main`. Production smoke: https://ccvaa-web.vercel.app/

### Links

- FEATURES.md: Public site (`/`)

---

## public-homepage-0002 — Richer favicons / Apple touch icon

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `later` |
| **Status** | `not-started` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |

### Description

Optional richer favicon set and Apple touch icon beyond the current `src/app/icon.svg`.

### Links

- FEATURES.md: Branding / assets

---

## public-homepage-0001 — Real board portraits and bios

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `later` |
| **Status** | `not-started` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |

### Description

Replace board photo placeholders and bio placeholders on the public homepage with real portraits and written bios for Zhong Liu (President), Yaqi Jing (VP), and Albert Zang (Secretary). Match existing coastal layout; keep expand/collapse UX.

### Links

- FEATURES.md: Public site → Our Board
