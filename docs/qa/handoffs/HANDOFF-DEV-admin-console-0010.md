# Handoff: Product Manager → Developer

**Date:** 2026-07-12  
**Backlog work ID:** `admin-console-0010`  
**Iteration:** `9`  
**Branch / PR:** `feat/admin-console-0010-hover-auth` — PR #4  
**Verifier:** `ceo` | **Verify passes:** `pass1`

## Goal

CEO verified Iteration 8 (auth blink fixed). Remaining:

**White flash inside the mail iframe** on Hover task-bar navigation (Mail / Files / Calendar / Contacts). Native Hover feels **instant**; our embed shows a significant white blank while the next task document loads through the proxy.

## Approach

Roundcube task switch = full HTML navigation. Proxy adds latency → visible white unload.

**Preferred fix:** double-buffer / preload-then-swap so the current iframe stays painted until the next task document is ready, then swap (no white interstitial).

Options:
- Parent `MailSection`: two stacked iframes; on `switch-task` (postMessage from inject, or detect), load next URL in hidden frame, on `load` promote it
- Or inject in Roundcube: intercept `switch-task`, open hidden iframe sibling… harder inside one frame — parent coordination via `postMessage` is cleaner

Keep sticky auth (Iter 8), Help, logout, 0009.

## Acceptance

- [ ] Mail ↔ Files ↔ Calendar ↔ Contacts: **no significant white flash** inside mail panel (feels closer to native Hover)
- [ ] Auth sidebar items still stable (no Iter 8 regression)
- [ ] Help / logout / login still work
- [ ] Lint/typecheck; push; Preview URL
