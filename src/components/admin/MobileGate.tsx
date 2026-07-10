"use client";

import { useEffect, useState } from "react";

function isPhoneUserAgent(ua: string) {
  return /iPhone|iPod|Android.+Mobile|Windows Phone|BlackBerry|IEMobile|Opera Mini/i.test(
    ua,
  );
}

/**
 * Blocks phone-sized viewports and phone user agents.
 * Tablets and desktops are allowed.
 */
export function useIsUnsupportedMobile() {
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => {
      const phoneUa = isPhoneUserAgent(navigator.userAgent);
      setUnsupported(media.matches || phoneUa);
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return unsupported;
}

export function MobileUnsupportedMessage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="max-w-md rounded-3xl border border-ocean-100 bg-white p-8 text-center shadow-sm sm:p-10">
        <p className="text-sm font-medium uppercase tracking-wider text-ocean-500">
          Admin console
        </p>
        <h1 className="mt-3 font-display text-2xl font-semibold text-ocean-900">
          Desktop or tablet required
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ocean-600">
          The CCVAA admin area is only available on desktop and tablet devices.
          Please open this page on a supported device to continue.
        </p>
      </div>
    </main>
  );
}
