# Handoff: Product Manager → Developer

**Date:** 2026-07-12  
**Backlog work ID:** `admin-console-0010`  
**Iteration:** `8`  
**Branch / PR:** `feat/admin-console-0010-hover-auth` — PR #4  
**Verifier:** `ceo` | **Verify passes:** `pass1`

## Corrected symptom (CEO)

When in-mailbox nav happens (Hover iframe task bar: Mail / Files / Calendar / Contacts):

- **NOT** a full `/admin` page reload
- The admin shell briefly blinks into a **logged-out** look: Members / Events / Financial / Log out **vanish for a blink**, then come back

Buttons at issue = **inside Hover iframe**, not our React sidebar.

## Root cause

`AUTH_BRIDGE` on each iframe document load reports `authenticated:false` while Roundcube is still booting → `AdminPage` `setAuthenticated(false)` → sidebar auth items unmount → then true again = blink.

## Fix (both sides)

1. **`AdminPage.tsx`:** sticky auth — apply `true` immediately; demote to `false` only after debounce / consecutive false messages / session API confirm. Explicit logout clears immediately (no debounce).
2. **`AUTH_BRIDGE` in mail `route.ts`:** no sync false on script parse; wait for DOM/rcmail; only post false when login form is clearly present; skip report on unload/pagehide.
3. Keep Help, frame isolation, 0009 fixes.

## Acceptance

- [ ] Click Mail↔Files↔Calendar↔Contacts in Hover task bar: sidebar auth items (**Members / Events / Financial / Log out**) stay visible with **no blink**
- [ ] Real logout (sidebar Log out or mail logout) still clears auth chrome
- [ ] Login still unlocks auth chrome
- [ ] Lint/typecheck; push; Preview URL
