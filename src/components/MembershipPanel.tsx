"use client";

import { useState } from "react";

import { JoinForm, type JoinPlansProps } from "@/components/JoinForm";
import { MemberLoginForm } from "@/components/MemberLoginForm";
import {
  MemberProfileForm,
  type MemberProfileSummary,
} from "@/components/MemberProfileForm";

export type { MemberProfileSummary as MemberSessionSummary };

type MembershipPanelProps = {
  joinedLanding?: boolean;
  initialProfile: MemberProfileSummary | null;
  initialProfileError: string | null;
  initialPlans: JoinPlansProps | null;
  initialPlansError: string | null;
};

export function MembershipPanel({
  joinedLanding,
  initialProfile,
  initialProfileError,
  initialPlans,
  initialPlansError,
}: MembershipPanelProps) {
  const [profile, setProfile] = useState<MemberProfileSummary | null>(
    initialProfile,
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
      <MemberProfileForm
        initialProfile={profile}
        initialProfileError={initialProfileError}
        onProfileUpdated={setProfile}
        onLogout={() => void handleLogout()}
        logoutError={logoutError}
        loggingOut={loggingOut}
      />
    );
  }

  return (
    <>
      <MemberLoginForm onAuthenticated={setProfile} />
      <JoinForm
        joinedLanding={joinedLanding}
        initialPlans={initialPlans}
        initialPlansError={initialPlansError}
      />
    </>
  );
}
