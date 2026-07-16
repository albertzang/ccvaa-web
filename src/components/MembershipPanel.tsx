"use client";

import { useEffect, useId, useState } from "react";

import { JoinForm, type JoinPlansProps } from "@/components/JoinForm";
import { MemberLoginForm } from "@/components/MemberLoginForm";
import {
  MemberProfileForm,
  type MemberProfileSummary,
} from "@/components/MemberProfileForm";
import { membershipContent } from "@/lib/site";

export type { MemberProfileSummary as MemberSessionSummary };

type MembershipPanelProps = {
  joinedLanding?: boolean;
  initialProfile: MemberProfileSummary | null;
  initialProfileError: string | null;
  initialPlans: JoinPlansProps | null;
  initialPlansError: string | null;
};

type LoggedOutTab = "join" | "sign-in";

type ApiError = {
  ok: false;
  code: string;
  message: string;
};

const SESSION_POLL_MS = 1500;
const SESSION_MAX_ATTEMPTS = 8;

async function postJoinSession(sessionId: string) {
  const response = await fetch("/api/members/join/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });
  const data = (await response.json()) as
    | {
        ok: true;
        status: "ready";
        profile: MemberProfileSummary;
        message: string;
      }
    | { ok: true; status: "pending"; message: string }
    | ApiError;

  if (!response.ok || (data as ApiError).ok === false) {
    const err = data as ApiError;
    throw new Error(err.message ?? "Could not open your membership session.");
  }
  return data as
    | {
        ok: true;
        status: "ready";
        profile: MemberProfileSummary;
        message: string;
      }
    | { ok: true; status: "pending"; message: string };
}

export function MembershipPanel({
  joinedLanding,
  initialProfile,
  initialProfileError,
  initialPlans,
  initialPlansError,
}: MembershipPanelProps) {
  const tabListId = useId();
  const joinPanelId = `${tabListId}-join`;
  const signInPanelId = `${tabListId}-sign-in`;
  const [activeTab, setActiveTab] = useState<LoggedOutTab>("join");
  const [profile, setProfile] = useState<MemberProfileSummary | null>(
    initialProfile,
  );
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [joinReturnMessage, setJoinReturnMessage] = useState<string | null>(
    null,
  );
  const [joinReturnError, setJoinReturnError] = useState<string | null>(null);
  const [establishingSession, setEstablishingSession] = useState(false);

  useEffect(() => {
    if (!joinedLanding || profile?.authenticated) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      setEstablishingSession(true);
      setJoinReturnError(null);
      setJoinReturnMessage(membershipContent.joinedActivating);

      for (let attempt = 0; attempt < SESSION_MAX_ATTEMPTS; attempt += 1) {
        if (cancelled) {
          return;
        }
        try {
          const result = await postJoinSession(sessionId);
          if (cancelled) {
            return;
          }
          if (result.status === "ready") {
            setProfile(result.profile);
            setJoinReturnMessage(result.message);
            setEstablishingSession(false);
            window.history.replaceState({}, "", "/?joined=1#membership");
            return;
          }
          setJoinReturnMessage(result.message);
        } catch (err) {
          if (cancelled) {
            return;
          }
          setJoinReturnError(
            err instanceof Error
              ? err.message
              : "Could not open your membership session.",
          );
          setEstablishingSession(false);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, SESSION_POLL_MS));
      }
      if (!cancelled) {
        setEstablishingSession(false);
        setJoinReturnError(membershipContent.joinedSessionTimeout);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [joinedLanding, profile?.authenticated]);

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
      setProfile(null);
    } catch (err) {
      setLogoutError(
        err instanceof Error ? err.message : "Could not sign out.",
      );
    } finally {
      setLoggingOut(false);
    }
  };

  if (profile?.authenticated) {
    return (
      <>
        {joinReturnMessage ? (
          <p
            className="mt-4 rounded-lg bg-white px-4 py-3 text-sm text-ocean-700"
            role="status"
          >
            {joinReturnMessage}
          </p>
        ) : null}
        <MemberProfileForm
          initialProfile={profile}
          initialProfileError={initialProfileError}
          onProfileUpdated={setProfile}
          onLogout={() => void handleLogout()}
          logoutError={logoutError}
          loggingOut={loggingOut}
        />
      </>
    );
  }

  return (
    <>
      {joinedLanding || establishingSession || joinReturnMessage || joinReturnError ? (
        <div className="mt-4 space-y-3 text-left">
          {joinReturnMessage || (joinedLanding && !joinReturnError) ? (
            <p
              className="rounded-lg bg-white px-4 py-3 text-sm text-ocean-700"
              role="status"
            >
              {joinReturnMessage ??
                (establishingSession
                  ? membershipContent.joinedActivating
                  : membershipContent.joinedSuccess)}
            </p>
          ) : null}
          {joinReturnError ? (
            <p
              className="rounded-lg bg-coral/10 px-4 py-3 text-sm text-coral-dark"
              role="alert"
            >
              {joinReturnError}
            </p>
          ) : null}
        </div>
      ) : null}

      <div
        className="mt-8 inline-flex rounded-full border border-ocean-200 bg-white/80 p-1"
        role="tablist"
        aria-label="Membership"
      >
        <button
          type="button"
          role="tab"
          id={`${tabListId}-tab-join`}
          aria-controls={joinPanelId}
          aria-selected={activeTab === "join"}
          tabIndex={activeTab === "join" ? 0 : -1}
          onClick={() => setActiveTab("join")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            activeTab === "join"
              ? "bg-ocean-800 text-white"
              : "text-ocean-700 hover:text-ocean-900"
          }`}
        >
          {membershipContent.joinTabLabel}
        </button>
        <button
          type="button"
          role="tab"
          id={`${tabListId}-tab-sign-in`}
          aria-controls={signInPanelId}
          aria-selected={activeTab === "sign-in"}
          tabIndex={activeTab === "sign-in" ? 0 : -1}
          onClick={() => setActiveTab("sign-in")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            activeTab === "sign-in"
              ? "bg-ocean-800 text-white"
              : "text-ocean-700 hover:text-ocean-900"
          }`}
        >
          {membershipContent.signInTabLabel}
        </button>
      </div>

      <div
        id={joinPanelId}
        role="tabpanel"
        aria-labelledby={`${tabListId}-tab-join`}
        hidden={activeTab !== "join"}
      >
        {activeTab === "join" ? (
          <JoinForm
            joinedLanding={false}
            initialPlans={initialPlans}
            initialPlansError={initialPlansError}
          />
        ) : null}
      </div>

      <div
        id={signInPanelId}
        role="tabpanel"
        aria-labelledby={`${tabListId}-tab-sign-in`}
        hidden={activeTab !== "sign-in"}
      >
        {activeTab === "sign-in" ? (
          <MemberLoginForm onAuthenticated={setProfile} />
        ) : null}
      </div>
    </>
  );
}
