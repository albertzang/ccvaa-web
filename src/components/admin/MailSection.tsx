"use client";

import { useEffect, useRef, useState } from "react";
import {
  ADMIN_MAIL_AUTH_MESSAGE_SOURCE,
  ADMIN_MAIL_EMBED_PATH,
  ADMIN_MAIL_PRELOAD_TASK_ACTION,
} from "@/lib/admin/constants";

type MailSectionProps = {
  iframeKey: number;
  hidden?: boolean;
};

type PreloadTaskMessage = {
  source?: string;
  action?: string;
  url?: string;
};

function isAllowedMailUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    return (
      parsed.origin === window.location.origin &&
      (parsed.pathname === ADMIN_MAIL_EMBED_PATH ||
        parsed.pathname.startsWith(`${ADMIN_MAIL_EMBED_PATH}/`))
    );
  } catch {
    return false;
  }
}

/** Normalize to path + search for iframe src (same-origin). */
function toEmbedSrc(url: string): string | null {
  try {
    const parsed = new URL(url, window.location.origin);
    if (!isAllowedMailUrl(parsed.href)) return null;
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
}

function urlsMatch(a: string, b: string): boolean {
  const na = toEmbedSrc(a);
  const nb = toEmbedSrc(b);
  return na !== null && nb !== null && na === nb;
}

/**
 * Double-buffer Hover task switches: keep the painted iframe visible while the
 * next task document loads in a hidden sibling, then swap (no white flash).
 * Remount via `key={iframeKey}` on logout.
 */
function MailFrameBuffer() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [srcs, setSrcs] = useState<[string, string]>([
    ADMIN_MAIL_EMBED_PATH,
    "about:blank",
  ]);
  const activeIndexRef = useRef(0);
  const srcsRef = useRef(srcs);
  const pendingSrcRef = useRef<string | null>(null);
  const loadingIndexRef = useRef<number | null>(null);

  useEffect(() => {
    srcsRef.current = srcs;
  }, [srcs]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    function cancelPendingLoad() {
      pendingSrcRef.current = null;
      loadingIndexRef.current = null;
      const inactive = 1 - activeIndexRef.current;
      setSrcs((prev) => {
        if (prev[inactive] === "about:blank") return prev;
        const next: [string, string] = [...prev];
        next[inactive] = "about:blank";
        return next;
      });
    }

    function preloadTask(rawUrl: string) {
      const nextSrc = toEmbedSrc(rawUrl);
      if (!nextSrc) return;

      const currentSrc = srcsRef.current[activeIndexRef.current];
      // Same task as painted frame: cancel any in-flight preload so it cannot swap later.
      if (currentSrc && urlsMatch(currentSrc, nextSrc)) {
        cancelPendingLoad();
        return;
      }

      const inactive = 1 - activeIndexRef.current;
      pendingSrcRef.current = nextSrc;
      loadingIndexRef.current = inactive;
      setSrcs((prev) => {
        const next: [string, string] = [...prev];
        next[inactive] = nextSrc;
        return next;
      });
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as PreloadTaskMessage;
      if (
        !data ||
        data.source !== ADMIN_MAIL_AUTH_MESSAGE_SOURCE ||
        data.action !== ADMIN_MAIL_PRELOAD_TASK_ACTION ||
        typeof data.url !== "string"
      ) {
        return;
      }
      preloadTask(data.url);
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function handleFrameLoad(index: number) {
    const src = srcsRef.current[index];
    const pending = pendingSrcRef.current;
    if (!src || src === "about:blank" || !pending) return;
    if (loadingIndexRef.current !== index) return;
    if (!urlsMatch(src, pending)) return;

    pendingSrcRef.current = null;
    loadingIndexRef.current = null;
    activeIndexRef.current = index;
    setActiveIndex(index);

    const other = 1 - index;
    // Defer blanking so the promoted frame paints first.
    window.requestAnimationFrame(() => {
      setSrcs((prev) => {
        if (prev[index] !== src) return prev;
        const next: [string, string] = [...prev];
        next[other] = "about:blank";
        return next;
      });
    });
  }

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
      {([0, 1] as const).map((index) => {
        const isActive = index === activeIndex;
        return (
          <iframe
            key={index}
            title={isActive ? "Hover webmail" : "Hover webmail (loading)"}
            src={srcs[index]}
            onLoad={() => handleFrameLoad(index)}
            className={`absolute inset-0 h-full w-full bg-white ${
              isActive
                ? "z-10 opacity-100"
                : "pointer-events-none z-0 opacity-0"
            }`}
            aria-hidden={!isActive}
          />
        );
      })}
    </div>
  );
}

export function MailSection({ iframeKey, hidden = false }: MailSectionProps) {
  return (
    <section
      className={`flex min-h-0 flex-1 flex-col ${hidden ? "hidden" : ""}`}
      aria-hidden={hidden}
    >
      <MailFrameBuffer key={iframeKey} />
    </section>
  );
}
