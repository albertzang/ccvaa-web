# QA report

**ID:** QA-baseline-0001
**Backlog work ID:** n/a (baseline)  
**Pass:** baseline  
**Environment(s) + exact URLs:** Production — https://ccvaa-web.vercel.app/  
**Branch / PR / commit:** n/a (baseline; current `main` Production deploy)  
**Date:** 2026-07-10  
**Result:** pass-with-issues

## Scope tested

Full living inventory from `docs/product/FEATURES.md` and handoff `docs/qa/handoffs/HANDOFF-QA-baseline-0001.md`.

- Public site `/` (hero, header/scroll, Board, Purposes, Contact, Footer, favicon)
- Admin `/admin` (mobile gate, desktop chrome, Mail iframe, OTP request UI/cooldown)
- Admin post-login scaffolds: **blocked** (no mailbox access; OTP send also broken — see bugs)

**Method note:** Cursor browser MCP tabs would not stay open in this session; checklist was exercised with headless Chromium (Playwright) against the Production URL above. Not tested: https://ccvaa.ca/.

## Checklist results

| Area | Result | Notes |
|------|--------|-------|
| Public homepage | pass | Loads; hero `hero-background.webp` + on-dark wordmark; no hero CTAs; hero copy `select-none`; title/meta OK |
| Header / scroll | pass | About → `#about`, Contact → `#contact`; scroll past hero → `logo-onlight.png` + cream header |
| Board / Purposes | pass | Board expands: group photo placeholder + Zhong Liu / Yaqi Jing / Albert Zang; portraits+bios show on section expand. Purposes: 10 titles always visible; descriptions toggle together |
| Contact | pass | `info@ccvaa.ca` + 8800 Hazelbridge / Richmond / V6X; footer org name, tagline, ©2026; no footer email duplicate |
| Favicon | pass | `/icon.svg` 200 |
| Admin mobile gate | pass | 390×844: “Desktop or tablet required” |
| Admin desktop | pass | Cream header; Mail + Login; robots `noindex, nofollow` |
| Admin mail | pass | Section expands; iframe `/admin/mail` loads Hover webmail login (“Webmail :: Welcome to Webmail”) |
| Admin OTP | pass-with-issues | Request UI + cooldown work; **send fails** — `SMTP_PASS` missing on Production (admin-console-0006). Error copy references `.env.local` |
| Admin scaffolds | blocked | Full login not completable (no mailbox + SMTP broken). Not scored as automatic product fail for mailbox; SMTP is a filed product issue |

## Bugs found

- [admin-console-0006](../../product/backlogs/admin-console-BACKLOG.md) — Production admin OTP cannot send mail (`SMTP_PASS` unset)

## Suggestions (non-blocking)

- Soften/productionize OTP config error copy (mention Vercel Production env vars, not only `.env.local`).
- FEATURES.md wording: Board is a **section** expand for all member portraits/bios (names/roles always visible), not per-member expand toggles.

## FEATURES.md drift (for PM)

1. **Our Board — “member expand”:** Inventory/handoff imply per-member expand for portrait/bio. Production shows name/role always; one “Our Board” control reveals all portraits + bios together. Group photo is always visible (not behind the expand).
2. Otherwise public + admin inventory matched observed Production behavior (aside from SMTP env gap).

## Sign-off

**Pass 1:** n/a  
**Pass 2:** n/a  
**Baseline:** issues found  
