"use client";

import { useState } from "react";

import { JoinForm, type JoinPlansProps } from "@/components/JoinForm";
import { MemberLoginForm } from "@/components/MemberLoginForm";
import { membershipContent } from "@/lib/site";

export type MemberSessionSummary = {
  authenticated: true;
  memberId: string;
  email: string;
  name: string | null;
  plan: "founding" | "lifetime" | "annual";
  expiresAt: string;
  grantsAdmin: false;
};

type MembershipPanelProps = {
  joinedLanding?: boolean;
  initialSession: MemberSessionSummary | null;
  initialPlans: JoinPlansProps | null;
  initialPlansError: string | null;
};

const PLAN_LABELS: Record<MemberSessionSummary["plan"], string> = {
  founding: "Founding",
  lifetime: "Lifetime",
  annual: "Annual",
};

export function MembershipPanel({
  joinedLanding,
  initialSession,
  initialPlans,
  initialPlansError,
}: MembershipPanelProps) {
  const [session, setSession] = useState<MemberSessionSummary | null>(
    initialSession,
  );
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLogoutError(null);
    setLoggingOut(true);
    try {
      const response = await fetch("/api/members/login/logout", {
        method: "POST",
      });
      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };
      if (!response.ok || data.ok === false) {
        throw new Error(data.message ?? "Could not sign out.");
      }
      setSession(null);
    } catch (err) {
      setLogoutError(
        err instanceof Error ? err.message : "Could not sign out.",
      );
    } finally {
      setLoggingOut(false);
    }
  };

  if (session?.authenticated) {
    const displayName = session.name?.trim() || session.email;
    return (
      <div className="mt-10 rounded-2xl border border-ocean-100 bg-white/70 p-6 text-left sm:p-8">
        <h3 className="font-display text-xl font-semibold text-ocean-900">
          {membershipContent.signedInTitle}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ocean-600">
          {membershipContent.signedInDescription}
        </p>
        <dl className="mt-6 space-y-2 text-sm text-ocean-800">
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-ocean-600">Member</dt>
            <dd>{displayName}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-ocean-600">Email</dt>
            <dd>{session.email}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-ocean-600">Plan</dt>
            <dd>{PLAN_LABELS[session.plan]}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-ocean-500">
          {membershipContent.signedInAdminNote}
        </p>
        {logoutError ? (
          <p
            className="mt-4 rounded-lg bg-coral/10 px-4 py-3 text-sm text-coral-dark"
            role="alert"
          >
            {logoutError}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={loggingOut}
          className="mt-6 rounded-full border border-ocean-300 bg-white px-6 py-3 text-sm font-semibold text-ocean-800 transition-colors hover:bg-ocean-50 disabled:opacity-60"
        >
          {loggingOut ? "Signing out…" : membershipContent.logoutLabel}
        </button>
      </div>
    );
  }

  return (
    <>
      <MemberLoginForm onAuthenticated={setSession} />
      <JoinForm
        joinedLanding={joinedLanding}
        initialPlans={initialPlans}
        initialPlansError={initialPlansError}
      />
    </>
  );
}
