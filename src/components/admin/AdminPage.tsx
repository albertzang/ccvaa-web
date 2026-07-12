"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminScaffoldSections } from "@/components/admin/AdminScaffoldSections";
import { LoginSection } from "@/components/admin/LoginSection";
import { MailSection } from "@/components/admin/MailSection";
import {
  MobileUnsupportedMessage,
  useIsUnsupportedMobile,
} from "@/components/admin/MobileGate";

export function AdminPage() {
  const unsupported = useIsUnsupportedMobile();
  const [authenticated, setAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadSession() {
      try {
        const response = await fetch("/api/admin/session");
        const data = (await response.json()) as { authenticated?: boolean };
        if (!cancelled) setAuthenticated(Boolean(data.authenticated));
      } catch {
        if (!cancelled) setAuthenticated(false);
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    void loadSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = useCallback(async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
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
          <MailSection />

          {!authenticated && (
            <LoginSection onAuthenticated={() => setAuthenticated(true)} />
          )}

          {authenticated && <AdminScaffoldSections />}
        </div>
      </main>
    </>
  );
}
