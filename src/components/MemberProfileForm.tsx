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

  return (
    <div className="mt-10 rounded-2xl border border-ocean-100 bg-white/70 p-6 text-left sm:p-8">
      <h3 className="font-display text-xl font-semibold text-ocean-900">
        {membershipContent.signedInTitle}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ocean-600">
        {membershipContent.signedInDescription}
      </p>

      {message ? (
        <p
          className="mt-4 rounded-lg bg-ocean-50 px-4 py-3 text-sm text-ocean-700"
          role="status"
        >
          {message}
        </p>
      ) : null}

      {error ? (
        <p
          className="mt-4 rounded-lg bg-coral/10 px-4 py-3 text-sm text-coral-dark"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <dl className="mt-6 space-y-2 text-sm text-ocean-800">
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-medium text-ocean-600">
            {membershipContent.profilePlanLabel}
          </dt>
          <dd>{PLAN_LABELS[profile.plan]}</dd>
        </div>
        {profile.plan === "annual" && profile.membershipAnniversary ? (
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-ocean-600">
              {membershipContent.profileAnniversaryLabel}
            </dt>
            <dd>{formatAnniversary(profile.membershipAnniversary)}</dd>
          </div>
        ) : null}
        {profile.plan === "annual" && profile.nextRenewalAt ? (
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-ocean-600">
              {membershipContent.profileNextRenewalLabel}
            </dt>
            <dd>{formatRenewal(profile.nextRenewalAt)}</dd>
          </div>
        ) : null}
      </dl>

      <form onSubmit={handleNameSave} className="mt-8 space-y-4">
        <div>
          <label
            htmlFor="member-profile-name"
            className="block text-sm font-medium text-ocean-700"
          >
            {membershipContent.profileNameLabel}
          </label>
          <input
            id="member-profile-name"
            type="text"
            required
            maxLength={200}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-xl border border-ocean-200 bg-white px-4 py-3 text-ocean-900 placeholder:text-ocean-400 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-200"
          />
        </div>
        <button
          type="submit"
          disabled={nameLoading}
          className="rounded-full bg-ocean-800 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-ocean-900 disabled:opacity-60"
        >
          {nameLoading ? "Saving…" : membershipContent.profileNameSaveLabel}
        </button>
      </form>

      <div className="mt-8 border-t border-ocean-100 pt-8">
        <p className="text-sm font-medium text-ocean-700">
          {membershipContent.profileEmailLabel}
        </p>
        {emailView === "display" ? (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="text-sm text-ocean-800">{profile.email}</p>
            <button
              type="button"
              onClick={() => {
                clearFeedback();
                setEmailView("edit");
                setNewEmail("");
              }}
              className="rounded-full border border-ocean-300 bg-white px-4 py-2 text-sm font-semibold text-ocean-800 transition-colors hover:bg-ocean-50"
            >
              {membershipContent.profileEmailChangeLabel}
            </button>
          </div>
        ) : null}

        {emailView === "edit" ? (
          <form onSubmit={handleEmailStart} className="mt-4 space-y-4">
            <input
              id="member-profile-new-email"
              type="email"
              required
              autoComplete="email"
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              placeholder={membershipContent.emailPlaceholder}
              className="w-full rounded-xl border border-ocean-200 bg-white px-4 py-3 text-ocean-900 placeholder:text-ocean-400 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={emailLoading}
                className="rounded-full bg-ocean-800 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-ocean-900 disabled:opacity-60"
              >
                {emailLoading
                  ? "Sending code…"
                  : membershipContent.profileEmailSendCodeLabel}
              </button>
              <button
                type="button"
                disabled={emailLoading}
                onClick={resetEmailFlow}
                className="rounded-full border border-ocean-300 bg-white px-6 py-3 text-sm font-semibold text-ocean-800 transition-colors hover:bg-ocean-50 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        {emailView === "verify" ? (
          <form onSubmit={handleEmailVerify} className="mt-4 space-y-4">
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
              className="w-full rounded-xl border border-ocean-200 bg-white px-4 py-3 font-mono tracking-widest text-ocean-900 placeholder:font-sans placeholder:tracking-normal placeholder:text-ocean-400 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={emailLoading}
                className="rounded-full bg-ocean-800 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-ocean-900 disabled:opacity-60"
              >
                {emailLoading
                  ? "Confirming…"
                  : membershipContent.profileEmailVerifyLabel}
              </button>
              <button
                type="button"
                disabled={emailLoading}
                onClick={resetEmailFlow}
                className="rounded-full border border-ocean-300 bg-white px-6 py-3 text-sm font-semibold text-ocean-800 transition-colors hover:bg-ocean-50 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-ocean-200 bg-ocean-50/50 px-4 py-5">
        <h4 className="font-display text-base font-semibold text-ocean-900">
          {membershipContent.profilePerksTitle}
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-ocean-600">
          {membershipContent.profilePerksDescription}
        </p>
      </div>

      <p className="mt-6 text-xs text-ocean-500">
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
        onClick={onLogout}
        disabled={loggingOut}
        className="mt-6 rounded-full border border-ocean-300 bg-white px-6 py-3 text-sm font-semibold text-ocean-800 transition-colors hover:bg-ocean-50 disabled:opacity-60"
      >
        {loggingOut ? "Signing out…" : membershipContent.logoutLabel}
      </button>
    </div>
  );
}
