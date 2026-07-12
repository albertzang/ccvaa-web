"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminScaffoldSections } from "@/components/admin/AdminScaffoldSections";
import { MailSection } from "@/components/admin/MailSection";
import {
  MobileUnsupportedMessage,
  useIsUnsupportedMobile,
} from "@/components/admin/MobileGate";
import { ADMIN_MAIL_AUTH_MESSAGE_SOURCE } from "@/lib/admin/constants";

const SESSION_POLL_MS = 8_000;

type MailAuthMessage = {
  source?: string;
  authenticated?: boolean;
};

async function fetchMailAuthenticated(): Promise<boolean> {
  try {
    const response = await fetch("/api/admin/session", { cache: "no-store" });
    const data = (await response.json()) as { authenticated?: boolean };
    return Boolean(data.authenticated);
  } catch {
    return false;
  }
}

export function AdminPage() {
  const unsupported = useIsUnsupportedMobile();
  const [authenticated, setAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);
  const [mailFrameKey, setMailFrameKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      const next = await fetchMailAuthenticated();
      if (!cancelled) {
        setAuthenticated(next);
        setReady(true);
      }
    }

    void loadSession();
    const timer = window.setInterval(() => {
      void loadSession();
    }, SESSION_POLL_MS);
    const onFocus = () => {
      void loadSession();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as MailAuthMessage;
      if (!data || data.source !== ADMIN_MAIL_AUTH_MESSAGE_SOURCE) return;
      setAuthenticated(Boolean(data.authenticated));
      setReady(true);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // Still clear local chrome + remount iframe
    }
    setAuthenticated(false);
    setMailFrameKey((key) => key + 1);
  }, []);

  if (unsupported) {
    return <MobileUnsupportedMessage />;
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-sm text-ocean-500">Loading admin…</p>
      </main>
    );
  }

  return (
    <>
      <AdminHeader authenticated={authenticated} onLogout={handleLogout} />
      <main className="min-h-screen bg-cream pb-20 pt-28 sm:pb-28 sm:pt-32">
        <div className="mx-auto max-w-6xl space-y-16 px-6">
          <MailSection
            authenticated={authenticated}
            iframeKey={mailFrameKey}
          />

          {authenticated && <AdminScaffoldSections />}
        </div>
      </main>
    </>
  );
}
