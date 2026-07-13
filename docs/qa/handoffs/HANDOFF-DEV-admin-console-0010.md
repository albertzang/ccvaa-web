# Handoff: Product Manager → Developer

**Date:** 2026-07-12  
**Backlog work ID:** `admin-console-0010`  
**Iteration:** `10`  
**Branch / PR:** `feat/admin-console-0010-hover-auth` — PR #4  
**Verifier:** `ceo` | **Verify passes:** `pass1`

## Goal

CEO verified Iteration 9 (no white flash). Regression:

Leaving **Compose** shows Chrome **“Leave site?”** instead of Hover’s built-in **discard draft / are you sure?** dialog (which worked before recent intercept/preload iterations, and matches native Hover).

## Cause

Switch-task intercept + preload/swap navigates without Roundcube’s compose dirty-check → browser `beforeunload` instead of Hover UI.

## Fix

- Before preload/swap away from compose (dirty compose / compose mode), invoke Roundcube’s normal confirm path so **Hover’s dialog** shows
- Only proceed with navigation/swap after confirm or if clean
- Keep Iter 9 double-buffer for clean task switches (Mail↔Calendar etc. without compose dirty)
- Must not break sticky auth, Help, logout

## Acceptance

- [ ] Switch away from dirty Compose → **Hover discard dialog** (not Chrome Leave site)
- [ ] Confirm discard → leave compose; cancel → stay in compose
- [ ] Clean task switches (no compose) still no significant white flash
- [ ] Lint/typecheck; push; Preview URL

## Dev notes (Iteration 10)

- Patch in `SWITCH_TASK_FRAME_PATCH`: `withComposeConfirm` → `doRequestSwap` only after clean or Hover `confirm_dialog` discard
- Sticky auth / Help / logout unchanged; Iter 9 buffer kept for non-dirty switches
