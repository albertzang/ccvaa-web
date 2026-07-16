"use client";

import { useState } from "react";

import { membershipContent } from "@/lib/site";

export type MemberProfileSummary = {
  authenticated: true;
  memberId: string;
  email: string;
  name: string | null;
  plan: "founding" | "lifetime" | "annual";
  membershipAnniversary: string | null;
  nextRenewalAt: string | null;
  expiresAt: string;
  grantsAdmin: false;
};

type ApiError = {
  ok: false;
  code: string;
  message: string;
};

type NameView = "display" | "edit";
type EmailView = "display" | "edit" | "verify";

type MemberProfileFormProps = {
  initialProfile: MemberProfileSummary;
  initialProfileError?: string | null;
  onProfileUpdated: (profile: MemberProfileSummary) => void;
  onLogout: () => void;
  logoutError: string | null;
  loggingOut: boolean;
};

const PLAN_LABELS: Record<MemberProfileSummary["plan"], string> = {
  founding: "Founding",
  lifetime: "Lifetime",
  annual: "Annual",
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as T | ApiError;
  if (!response.ok || (data as ApiError).ok === false) {
    const err = data as ApiError;
    throw new Error(err.message ?? "Request failed.");
  }
  return data as T;
}

async function patchJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as T | ApiError;
  if (!response.ok || (data as ApiError).ok === false) {
    const err = data as ApiError;
    throw new Error(err.message ?? "Request failed.");
  }
  return data as T;
}

function formatAnniversary(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) {
    return isoDate;
  }
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function formatRenewal(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) {
    return isoDateTime;
  }
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

export function MemberProfileForm({
  initialProfile,
  initialProfileError,
  onProfileUpdated,
  onLogout,
  logoutError,
  loggingOut,
}: MemberProfileFormProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [nameView, setNameView] = useState<NameView>("display");
  const [name, setName] = useState(profile.name?.trim() ?? "");
  const [emailView, setEmailView] = useState<EmailView>("display");
  const [newEmail, setNewEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    initialProfileError ?? null,
  );
  const [nameLoading, setNameLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const clearFeedback = () => {
    setMessage(null);
    setError(null);
  };

  const applyProfile = (next: MemberProfileSummary) => {
    setProfile(next);
    setName(next.name?.trim() ?? "");
    onProfileUpdated(next);
  };

  const handleNameSave = async (event: React.FormEvent) => {
    event.preventDefault();
    clearFeedback();
    setNameLoading(true);
    try {
      const result = await patchJson<{
        profile: MemberProfileSummary;
        message: string;
      }>("/api/members/profile/name", { name });
      applyProfile(result.profile);
      setNameView("display");
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update name.");
    } finally {
      setNameLoading(false);
    }
  };

  const handleEmailStart = async (event: React.FormEvent) => {
    event.preventDefault();
    clearFeedback();
    setEmailLoading(true);
    try {
      const result = await postJson<{ message: string }>(
        "/api/members/profile/email/start",
        { newEmail },
      );
      setEmailView("verify");
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleEmailVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    clearFeedback();
    setEmailLoading(true);
    try {
      const result = await postJson<{
        profile: MemberProfileSummary;
        message: string;
      }>("/api/members/profile/email/verify", {
        newEmail,
        code: emailCode,
      });
      applyProfile(result.profile);
      setEmailView("display");
      setNewEmail("");
      setEmailCode("");
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify code.");
    } finally {
      setEmailLoading(false);
    }
  };

  const resetEmailFlow = () => {
    clearFeedback();
    setEmailView("display");
    setNewEmail("");
    setEmailCode("");
  };

  const displayName = profile.name?.trim() || "—";

  return (
    <div className="mt-2 rounded-2xl border border-ocean-100 bg-white/70 p-5 text-left sm:p-6">
      {message ? (
        <p
          className="mb-4 rounded-lg bg-ocean-50 px-4 py-3 text-sm text-ocean-700"
          role="status"
        >
          {message}
        </p>
      ) : null}

      {error ? (
        <p
          className="mb-4 rounded-lg bg-coral/10 px-4 py-3 text-sm text-coral-dark"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <dl className="space-y-3 text-sm text-ocean-800">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <div className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-ocean-500">
              {membershipContent.profileNameLabel}
            </dt>
            {nameView === "display" ? (
              <dd className="mt-0.5 truncate font-medium text-ocean-900">
                {displayName}
              </dd>
            ) : null}
          </div>
          {nameView === "display" ? (
            <button
              type="button"
              onClick={() => {
                clearFeedback();
                setNameView("edit");
                setName(profile.name?.trim() ?? "");
              }}
              className="shrink-0 text-sm font-semibold text-ocean-700 underline decoration-ocean-300 underline-offset-4 hover:text-ocean-900"
            >
              {membershipContent.profileNameEditLabel}
            </button>
          ) : null}
        </div>

        {nameView === "edit" ? (
          <form onSubmit={handleNameSave} className="space-y-3">
            <label htmlFor="member-profile-name" className="sr-only">
              {membershipContent.profileNameLabel}
            </label>
            <input
              id="member-profile-name"
              type="text"
              required
              maxLength={200}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-ocean-200 bg-white px-4 py-2.5 text-ocean-900 placeholder:text-ocean-400 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={nameLoading}
                className="rounded-full bg-ocean-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ocean-900 disabled:opacity-60"
              >
                {nameLoading
                  ? "Saving…"
                  : membershipContent.profileNameSaveLabel}
              </button>
              <button
                type="button"
                disabled={nameLoading}
                onClick={() => {
                  clearFeedback();
                  setNameView("display");
                  setName(profile.name?.trim() ?? "");
                }}
                className="rounded-full border border-ocean-300 bg-white px-4 py-2 text-sm font-semibold text-ocean-800 transition-colors hover:bg-ocean-50 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-ocean-100 pt-3">
          <div className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-ocean-500">
              {membershipContent.profileEmailLabel}
            </dt>
            {emailView === "display" ? (
              <dd className="mt-0.5 truncate text-ocean-900">{profile.email}</dd>
            ) : null}
          </div>
          {emailView === "display" ? (
            <button
              type="button"
              onClick={() => {
                clearFeedback();
                setEmailView("edit");
                setNewEmail("");
              }}
              className="shrink-0 text-sm font-semibold text-ocean-700 underline decoration-ocean-300 underline-offset-4 hover:text-ocean-900"
            >
              {membershipContent.profileEmailChangeLabel}
            </button>
          ) : null}
        </div>

        {emailView === "edit" ? (
          <form onSubmit={handleEmailStart} className="space-y-3">
            <input
              id="member-profile-new-email"
              type="email"
              required
              autoComplete="email"
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              placeholder={membershipContent.emailPlaceholder}
              className="w-full rounded-xl border border-ocean-200 bg-white px-4 py-2.5 text-ocean-900 placeholder:text-ocean-400 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={emailLoading}
                className="rounded-full bg-ocean-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ocean-900 disabled:opacity-60"
              >
                {emailLoading
                  ? "Sending code…"
                  : membershipContent.profileEmailSendCodeLabel}
              </button>
              <button
                type="button"
                disabled={emailLoading}
                onClick={resetEmailFlow}
                className="rounded-full border border-ocean-300 bg-white px-4 py-2 text-sm font-semibold text-ocean-800 transition-colors hover:bg-ocean-50 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        {emailView === "verify" ? (
          <form onSubmit={handleEmailVerify} className="space-y-3">
            <p className="text-sm text-ocean-600">
              {membershipContent.profileEmailVerifyHint}
            </p>
            <input
              id="member-profile-email-code"
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              required
              value={emailCode}
              onChange={(event) => setEmailCode(event.target.value)}
              placeholder={membershipContent.codePlaceholder}
              className="w-full rounded-xl border border-ocean-200 bg-white px-4 py-2.5 font-mono tracking-widest text-ocean-900 placeholder:font-sans placeholder:tracking-normal placeholder:text-ocean-400 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={emailLoading}
                className="rounded-full bg-ocean-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ocean-900 disabled:opacity-60"
              >
                {emailLoading
                  ? "Confirming…"
                  : membershipContent.profileEmailVerifyLabel}
              </button>
              <button
                type="button"
                disabled={emailLoading}
                onClick={resetEmailFlow}
                className="rounded-full border border-ocean-300 bg-white px-4 py-2 text-sm font-semibold text-ocean-800 transition-colors hover:bg-ocean-50 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <div className="border-t border-ocean-100 pt-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-ocean-500">
            {membershipContent.profilePlanLabel}
          </dt>
          <dd className="mt-0.5 font-medium text-ocean-900">
            {PLAN_LABELS[profile.plan]}
          </dd>
          {profile.plan === "annual" && profile.membershipAnniversary ? (
            <p className="mt-1 text-xs text-ocean-600">
              {membershipContent.profileAnniversaryLabel}:{" "}
              {formatAnniversary(profile.membershipAnniversary)}
            </p>
          ) : null}
          {profile.plan === "annual" && profile.nextRenewalAt ? (
            <p className="mt-0.5 text-xs text-ocean-600">
              {membershipContent.profileNextRenewalLabel}:{" "}
              {formatRenewal(profile.nextRenewalAt)}
            </p>
          ) : null}
        </div>
      </dl>

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
        onClick={onLogout}
        disabled={loggingOut}
        className="mt-5 rounded-full border border-ocean-300 bg-white px-5 py-2.5 text-sm font-semibold text-ocean-800 transition-colors hover:bg-ocean-50 disabled:opacity-60"
      >
        {loggingOut ? "Signing out…" : membershipContent.logoutLabel}
      </button>
    </div>
  );
}
