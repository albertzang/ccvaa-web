/**
 * Soft RSC refresh (no full browser reload).
 * Shared by silent recovery paths: checkout fail, join-return fail/timeout,
 * newsletter toggle fail — and success paths that need server UI to catch up.
 */
export function softReload(router: { refresh: () => void }) {
  router.refresh();
}

/** Drop `?joined` / `session_id` so join-return polling cannot re-enter after refresh. */
export function clearMembershipReturnUrl() {
  window.history.replaceState({}, "", "/#membership");
}
