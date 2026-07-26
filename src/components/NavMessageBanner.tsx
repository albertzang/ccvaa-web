"use client";

import { useEffect, useState } from "react";

/** Gap between header bottom edge and the banner chip. */
const BANNER_GAP_PX = 12;

type NavMessageBannerProps = {
  message: string | null;
  onDismiss?: () => void;
};

/**
 * Centered dismissible API chip, fixed just below the site header.
 * Top offset tracks live header height so it never sits under the nav.
 */
export function NavMessageBanner({
  message,
  onDismiss,
}: NavMessageBannerProps) {
  const [topPx, setTopPx] = useState(84);

  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) {
      return;
    }

    const update = () => {
      setTopPx(Math.ceil(header.getBoundingClientRect().height) + BANNER_GAP_PX);
    };
    update();

    const observer = new ResizeObserver(update);
    observer.observe(header);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 flex min-h-5 items-center justify-center px-6"
      style={{ top: topPx }}
      aria-live="polite"
    >
      {message ? (
        <div
          className="pointer-events-auto relative max-w-full rounded-md bg-coral py-0.5 pl-2 pr-7 text-[10px] font-semibold text-white shadow-sm ring-1 ring-cream/25"
          role="alert"
        >
          <p className="text-center">{message}</p>
          {onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              className="absolute right-0.5 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-white/85 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cream/70"
              aria-label="Dismiss message"
            >
              <span aria-hidden="true" className="text-sm leading-none">
                ×
              </span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
