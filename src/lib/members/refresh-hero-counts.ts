/** Browser event: hero Subscribe/Join badges should refetch live counts. */
export const HERO_COUNTS_REFRESH_EVENT = "ccvaa:hero-counts";

export function refreshHeroCounts() {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(HERO_COUNTS_REFRESH_EVENT));
}
