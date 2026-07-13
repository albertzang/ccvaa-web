"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AdminScaffoldPanel } from "@/components/admin/AdminScaffoldSections";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MailSection } from "@/components/admin/MailSection";
import {
  MobileUnsupportedMessage,
  useIsUnsupportedMobile,
} from "@/components/admin/MobileGate";
import {
  ADMIN_MAIL_AUTH_MESSAGE_SOURCE,
  type AdminPanelId,
} from "@/lib/admin/constants";

const SESSION_POLL_MS = 8_000;
/** Ignore transient iframe-boot `authenticated:false` while Roundcube remounts. */
const AUTH_FALSE_DEBOUNCE_MS = 600;

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

function isProtectedPanel(panel: AdminPanelId): panel is Exclude<AdminPanelId, "mail"> {
  return panel !== "mail";
}

export function AdminPage() {
  const unsupported = useIsUnsupportedMobile();
  const [authenticated, setAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);
  const [mailFrameKey, setMailFrameKey] = useState(0);
  const [activePanel, setActivePanel] = useState<AdminPanelId>("mail");
  /** Sticky mirror so explicit logout can clear immediately (no debounce). */
  const stickyAuthRef = useRef(false);
  const falseDebounceRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    function clearFalseDebounce() {
      if (falseDebounceRef.current !== undefined) {
        window.clearTimeout(falseDebounceRef.current);
        falseDebounceRef.current = undefined;
      }
    }

    /** Sticky auth: promote to true immediately; demote to false only after debounce + confirm. */
    function applyAuth(next: boolean) {
      if (cancelled) return;
      if (next) {
        clearFalseDebounce();
        stickyAuthRef.current = true;
        setAuthenticated(true);
        setReady(true);
        return;
      }
      setReady(true);
      if (!stickyAuthRef.current) {
        setAuthenticated(false);
        return;
      }
      // Stay logged-in until debounce confirms session is still false
      clearFalseDebounce();
      falseDebounceRef.current = window.setTimeout(() => {
        void (async () => {
          const confirmed = await fetchMailAuthenticated();
          if (cancelled) return;
          if (!confirmed) {
            stickyAuthRef.current = false;
            setAuthenticated(false);
          }
        })();
      }, AUTH_FALSE_DEBOUNCE_MS);
    }

    async function loadSession() {
      applyAuth(await fetchMailAuthenticated());
    }

    void loadSession();
    const timer = window.setInterval(() => {
      void loadSession();
    }, SESSION_POLL_MS);
    const onFocus = () => {
      void loadSession();
    };

    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as MailAuthMessage;
      if (!data || data.source !== ADMIN_MAIL_AUTH_MESSAGE_SOURCE) return;
      applyAuth(Boolean(data.authenticated));
    }

    window.addEventListener("focus", onFocus);
    window.addEventListener("message", onMessage);
    return () => {
      cancelled = true;
      clearFalseDebounce();
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("message", onMessage);
    };
  }, []);

  const visiblePanel =
    !authenticated && isProtectedPanel(activePanel) ? "mail" : activePanel;

  const handleLogout = useCallback(async () => {
    if (falseDebounceRef.current !== undefined) {
      window.clearTimeout(falseDebounceRef.current);
      falseDebounceRef.current = undefined;
    }
    stickyAuthRef.current = false;
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // Still clear local chrome + remount iframe
    }
    // Explicit logout: clear auth chrome immediately (no sticky debounce)
    setAuthenticated(false);
    setActivePanel("mail");
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
    <div className="flex h-screen bg-cream">
      <AdminSidebar
        activePanel={visiblePanel}
        authenticated={authenticated}
        onPanelChange={setActivePanel}
        onLogout={handleLogout}
      />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col">
        <MailSection
          iframeKey={mailFrameKey}
          hidden={visiblePanel !== "mail"}
        />
        {authenticated && (
          <>
            <AdminScaffoldPanel
              panelId="members"
              hidden={visiblePanel !== "members"}
            />
            <AdminScaffoldPanel
              panelId="events"
              hidden={visiblePanel !== "events"}
            />
            <AdminScaffoldPanel
              panelId="financial"
              hidden={visiblePanel !== "financial"}
            />
          </>
        )}
      </main>
    </div>
  );
}
