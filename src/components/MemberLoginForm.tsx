"use client";

import { useState } from "react";

import { type MemberProfileSummary } from "@/components/MemberProfileForm";
import { membershipContent } from "@/lib/site";

type ApiError = {
  ok: false;
  code: string;
  message: string;
};

type View = "email" | "verify";

type MemberLoginFormProps = {
  onAuthenticated: (profile: MemberProfileSummary) => void;
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

export function MemberLoginForm({ onAuthenticated }: MemberLoginFormProps) {
  const [view, setView] = useState<View>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clearFeedback = () => {
    setMessage(null);
    setError(null);
  };

  const handleStart = async (event: React.FormEvent) => {
    event.preventDefault();
    clearFeedback();
    setLoading(true);
    try {
      const result = await postJson<{ message: string }>(
        "/api/members/login/start",
        { email },
      );
      setView("verify");
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send login code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    clearFeedback();
    setLoading(true);
    try {
      const result = await postJson<{ message: string }>(
        "/api/members/login/verify",
        { email, code },
      );
      setMessage(result.message);

      const profileResponse = await fetch("/api/members/profile");
      const profileData = (await profileResponse.json()) as
        | { ok: true; profile: MemberProfileSummary }
        | ApiError;
      if (
        profileResponse.ok &&
        profileData.ok !== false &&
        "profile" in profileData
      ) {
        onAuthenticated(profileData.profile);
        return;
      }

      throw new Error(
        (profileData as ApiError).message ??
          "Signed in, but could not load your profile.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify code.");
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 rounded-2xl border border-ocean-100 bg-white/70 p-6 text-left sm:p-8">
      <h3 className="font-display text-xl font-semibold text-ocean-900">
        {membershipContent.loginTitle}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ocean-600">
        {membershipContent.loginDescription}
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

      {view === "email" ? (
        <form onSubmit={handleStart} className="mt-6 space-y-4">
          <div>
            <label htmlFor="member-login-email" className="sr-only">
              Email
            </label>
            <input
              id="member-login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={membershipContent.emailPlaceholder}
              className="w-full rounded-xl border border-ocean-200 bg-white px-4 py-3 text-ocean-900 placeholder:text-ocean-400 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-ocean-800 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-ocean-900 disabled:opacity-60"
          >
            {loading ? "Sending code…" : membershipContent.loginSendLabel}
          </button>
        </form>
      ) : null}

      {view === "verify" ? (
        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          <p className="text-sm text-ocean-600">{membershipContent.loginVerifyHint}</p>
          <div>
            <label htmlFor="member-login-code" className="sr-only">
              Login code
            </label>
            <input
              id="member-login-code"
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              required
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder={membershipContent.codePlaceholder}
              className="w-full rounded-xl border border-ocean-200 bg-white px-4 py-3 font-mono tracking-widest text-ocean-900 placeholder:font-sans placeholder:tracking-normal placeholder:text-ocean-400 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-ocean-800 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-ocean-900 disabled:opacity-60"
            >
              {loading ? "Signing in…" : membershipContent.loginVerifyLabel}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                clearFeedback();
                setView("email");
                setCode("");
              }}
              className="rounded-full border border-ocean-300 bg-white px-6 py-3 text-sm font-semibold text-ocean-800 transition-colors hover:bg-ocean-50 disabled:opacity-60"
            >
              Back
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
