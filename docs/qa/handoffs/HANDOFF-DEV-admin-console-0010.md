# Handoff: Product Manager → Developer

**Date:** 2026-07-12  
**Requested by:** CEO / PM  
**Backlog work ID:** `admin-console-0010` (**required**)  
**Backlog link:** `docs/product/backlogs/admin-console-BACKLOG.md`  
**Priority:** now  
**Iteration:** `2`

**Save as:** `docs/qa/handoffs/HANDOFF-DEV-admin-console-0010.md`  
**Rework:** overwrite this path (Iteration 1 in git history).

## Verifier & Ship path

**Verifier:** `ceo`  
**Verify passes:** `pass1`  
**Ship path:** `feature-branch`

**CEO Pass 2:** skip  
**Branch / PR:** continue on `feat/admin-console-0010-hover-auth` — PR #4

## Goal

**Iteration 2 only:** Redesign `/admin` layout:

- **Left:** full-height sidebar navigation
- **Right:** main content panel filling remaining width + height
- **Interaction:** sidebar buttons switch which panel is shown (no hash scrolling / no stacked sections on one long page)

## User value

App-like admin console; mail and scaffolds each get full workspace; clearer navigation.

## Acceptance criteria

- [ ] Layout: fixed/full-height sidebar left; main content right uses remaining viewport (below any minimal top chrome, or sidebar spans full height — pick one coherent model)
- [ ] Sidebar nav switches panels: **Mail**, **Members**, **Financial**, **Events** (latter three only when authenticated, same rule as today)
- [ ] **Mail** panel: iframe fills main panel height (remove collapsible expand/collapse accordion for Mail)
- [ ] **Members / Financial / Events:** existing scaffold “coming soon” content, one panel at a time
- [ ] **Log out** accessible from sidebar (or header + sidebar — avoid duplicate confusing controls)
- [ ] Logged-out: Mail panel still reachable for sign-in; protected nav items hidden or disabled until authenticated
- [ ] Iteration 1 auth unchanged (mail session = admin session; postMessage/poll/logout)
- [ ] No regression on mail proxy (`admin-console-0009` fixes)
- [ ] Mobile gate unchanged
- [ ] Lint/typecheck clean; push to same feature branch; update Preview URL for CEO Pass 1

## Out of scope

- Real CRUD for Members/Financial/Events
- Pass 2 Production verify
- Public site changes

## Technical hints

- Current files: `AdminPage.tsx`, `AdminHeader.tsx`, `MailSection.tsx`, `AdminScaffoldSections.tsx`, `adminNavItems` in `src/lib/admin/constants.ts`
- Likely refactor: `AdminSidebar` + `AdminMainPanel` (or similar); lift `activePanel` state in `AdminPage`
- Remove `#mail` / `#members` hash nav from header — sidebar replaces it
- Header may shrink to logo/home link only, or merge branding into sidebar top — match coastal palette (`globals.css` ocean tokens)
- Mail iframe: use `h-full` / `min-h-0` flex patterns so iframe grows in panel

## Design / UX constraints

- Coastal fog/forest theme; minimal scope
- Desktop/tablet only
- Default panel: **Mail** on load

## Git / deploy expectations

- Commit to `feat/admin-console-0010-hover-auth`; push; same PR #4
- No agent QA files
- CEO verifies on Preview only

## Done means

- Preview updated; exact Preview URL for CEO
- Summarize layout model + any header/sidebar decisions
- Backlog stays `in-progress` until CEO **verified** for whole ticket
