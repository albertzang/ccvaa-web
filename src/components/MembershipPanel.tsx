"use client";

import { useEffect, useId, useRef, useState } from "react";

import { JoinForm, type JoinPlansProps } from "@/components/JoinForm";
import { membershipContent } from "@/lib/site";

export type MemberProfileSummary = {
  authenticated: true;
  memberId: string;
  email: string;
  name: string | null;
  plan: "none" | "founding" | "lifetime" | "annual";
  newsletterStatus: "off" | "pending" | "on";
  membershipAnniversary: string | null;
  nextRenewalAt: string | null;
  expiresAt: string;
  grantsAdmin: false;
};

export type UnsubLanding =
  | {
      kind: "success";
      already: boolean;
      email: string;
      profile?: MemberProfileSummary;
    }
  | { kind: "invalid" };

type MembershipPanelProps = {
  joinedLanding?: boolean;
  unsubLanding?: UnsubLanding;
  initialProfile: MemberProfileSummary | null;
  initialProfileError: string | null;
  initialPlans: JoinPlansProps | null;
  initialPlansError: string | null;
};

type ApiError = {
  ok: false;
  code: string;
  message: string;
};

const SESSION_POLL_MS = 1500;
const SESSION_MAX_ATTEMPTS = 8;
const NAME_SAVE_DEBOUNCE_MS = 600;

const PLAN_LABELS: Record<
  Exclude<MemberProfileSummary["plan"], "none">,
  string
> = {
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

function unsubMessage(unsubLanding: UnsubLanding): string {
  if (unsubLanding.kind === "invalid") {
    return membershipContent.unsubLandingInvalid;
  }
  return unsubLanding.already
    ? membershipContent.unsubLandingAlready
    : membershipContent.unsubLandingSuccess;
}

const inputClass =
  "w-full rounded-xl border border-ocean-200 bg-white px-3 py-2.5 text-sm text-ocean-900 placeholder:text-ocean-400 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-200 sm:px-4 sm:py-3";

const primaryBtnClass =
  "rounded-full bg-ocean-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ocean-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-400 disabled:opacity-60 sm:px-5";

const secondaryBtnClass =
  "rounded-full border border-ocean-300 bg-white px-4 py-2.5 text-sm font-semibold text-ocean-800 transition-colors hover:bg-ocean-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-300 disabled:opacity-60 sm:px-5";

export function MembershipPanel({
  joinedLanding,
  unsubLanding,
  initialProfile,
  initialProfileError,
  initialPlans,
  initialPlansError,
}: MembershipPanelProps) {
  const nameId = useId();
  const emailId = useId();
  const codeId = useId();
  const toggleId = useId();

  const [profile, setProfile] = useState<MemberProfileSummary | null>(
    () =>
      initialProfile ??
      (unsubLanding?.kind === "success" ? unsubLanding.profile ?? null : null),
  );
  const [name, setName] = useState(
    () =>
      initialProfile?.name?.trim() ??
      (unsubLanding?.kind === "success"
        ? unsubLanding.profile?.name?.trim() ?? ""
        : ""),
  );
  const [email, setEmail] = useState(
    () =>
      initialProfile?.email ??
      (unsubLanding?.kind === "success"
        ? unsubLanding.profile?.email ?? unsubLanding.email
        : ""),
  );
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [emailChangeMode, setEmailChangeMode] = useState(false);
  const [message, setMessage] = useState<string | null>(() =>
    unsubLanding ? unsubMessage(unsubLanding) : null,
  );
  const [error, setError] = useState<string | null>(
    initialProfileError ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [nameSaveState, setNameSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [newsletterBusy, setNewsletterBusy] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [joinReturnMessage, setJoinReturnMessage] = useState<string | null>(
    null,
  );
  const [joinReturnError, setJoinReturnError] = useState<string | null>(null);
  const [establishingSession, setEstablishingSession] = useState(false);

  const nameSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedName = useRef(
    initialProfile?.name?.trim() ??
      (unsubLanding?.kind === "success"
        ? unsubLanding.profile?.name?.trim() ?? ""
        : ""),
  );
  const verified = Boolean(profile?.authenticated);

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
            setName(result.profile.name?.trim() ?? "");
            setEmail(result.profile.email);
            lastSavedName.current = result.profile.name?.trim() ?? "";
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

  useEffect(() => {
    if (!verified) {
      return;
    }

    const trimmed = name.trim();
    if (!trimmed || trimmed === lastSavedName.current) {
      return;
    }

    if (nameSaveTimer.current) {
      clearTimeout(nameSaveTimer.current);
    }

    nameSaveTimer.current = setTimeout(() => {
      void (async () => {
        setNameSaveState("saving");
        setError(null);
        try {
          const result = await patchJson<{
            profile: MemberProfileSummary;
            message: string;
          }>("/api/members/profile/name", { name: trimmed });
          setProfile(result.profile);
          lastSavedName.current = result.profile.name?.trim() ?? trimmed;
          setNameSaveState("saved");
          window.setTimeout(() => setNameSaveState("idle"), 2000);
        } catch (err) {
          setNameSaveState("error");
          setError(
            err instanceof Error
              ? err.message
              : membershipContent.nameSaveErrorLabel,
          );
        }
      })();
    }, NAME_SAVE_DEBOUNCE_MS);

    return () => {
      if (nameSaveTimer.current) {
        clearTimeout(nameSaveTimer.current);
      }
    };
  }, [name, verified]);

  const clearFeedback = () => {
    setMessage(null);
    setError(null);
  };

  const handleSendCode = async () => {
    clearFeedback();
    setLoading(true);
    try {
      if (verified && emailChangeMode) {
        const result = await postJson<{ message: string }>(
          "/api/members/profile/email/start",
          { newEmail: email },
        );
        setCodeSent(true);
        setMessage(result.message);
      } else {
        const result = await postJson<{ message: string }>(
          "/api/members/verify/start",
          { email },
        );
        setCodeSent(true);
        setMessage(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    clearFeedback();
    setLoading(true);
    try {
      if (verified && emailChangeMode) {
        const result = await postJson<{
          profile: MemberProfileSummary;
          message: string;
        }>("/api/members/profile/email/verify", {
          newEmail: email,
          code,
        });
        setProfile(result.profile);
        setEmail(result.profile.email);
        setCode("");
        setCodeSent(false);
        setEmailChangeMode(false);
        setMessage(result.message);
      } else {
        const result = await postJson<{
          profile: MemberProfileSummary;
          message: string;
        }>("/api/members/verify/verify", {
          email,
          code,
          name,
        });
        setProfile(result.profile);
        setName(result.profile.name?.trim() ?? name);
        setEmail(result.profile.email);
        lastSavedName.current = result.profile.name?.trim() ?? name.trim();
        setCode("");
        setCodeSent(false);
        setMessage(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify code.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletterToggle = async () => {
    if (!profile) {
      return;
    }
    const next = profile.newsletterStatus === "on" ? "off" : "on";
    setNewsletterBusy(true);
    setError(null);
    try {
      const result = await postJson<{
        status: "on" | "off";
        message: string;
      }>("/api/members/newsletter/preference", { status: next });
      setProfile({
        ...profile,
        newsletterStatus: result.status,
      });
      setMessage(result.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not update newsletter preference.",
      );
    } finally {
      setNewsletterBusy(false);
    }
  };

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
      setName("");
      setEmail("");
      setCode("");
      setCodeSent(false);
      setEmailChangeMode(false);
      lastSavedName.current = "";
      setMessage(null);
    } catch (err) {
      setLogoutError(
        err instanceof Error ? err.message : "Could not sign out.",
      );
    } finally {
      setLoggingOut(false);
    }
  };

  const newsletterOn = profile?.newsletterStatus === "on";
  const isPaidMember =
    profile?.authenticated &&
    profile.plan !== "none";

  return (
    <div className="text-left">
      {joinedLanding || establishingSession || joinReturnMessage || joinReturnError ? (
        <div className="mb-4 space-y-3">
          {joinReturnMessage || (joinedLanding && !joinReturnError) ? (
            <p
              className="rounded-lg bg-white/90 px-4 py-3 text-sm text-ocean-700"
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

      {message ? (
        <p
          className={`mb-4 rounded-lg px-4 py-3 text-sm ${
            unsubLanding?.kind === "invalid" &&
            message === membershipContent.unsubLandingInvalid
              ? "bg-coral/10 text-coral-dark"
              : "bg-white/90 text-ocean-700"
          }`}
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

      <form
        onSubmit={(event) => {
          if (codeSent || (verified && emailChangeMode && codeSent)) {
            void handleVerify(event);
            return;
          }
          event.preventDefault();
          void handleSendCode();
        }}
        className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end"
      >
        <div className="min-w-0 flex-1 basis-full sm:basis-[12rem] lg:basis-[10rem]">
          <label
            htmlFor={nameId}
            className="mb-1 block text-xs font-medium uppercase tracking-wide text-ocean-500"
          >
            Name
          </label>
          <input
            id={nameId}
            type="text"
            required
            autoComplete="name"
            maxLength={200}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={membershipContent.namePlaceholder}
            className={inputClass}
          />
          {verified && nameSaveState !== "idle" ? (
            <p className="mt-1 text-xs text-ocean-500" aria-live="polite">
              {nameSaveState === "saving"
                ? membershipContent.nameSavingLabel
                : nameSaveState === "saved"
                  ? membershipContent.nameSavedLabel
                  : membershipContent.nameSaveErrorLabel}
            </p>
          ) : null}
        </div>

        <div className="min-w-0 flex-[1.4] basis-full sm:basis-[14rem]">
          <label
            htmlFor={emailId}
            className="mb-1 block text-xs font-medium uppercase tracking-wide text-ocean-500"
          >
            Email
          </label>
          <input
            id={emailId}
            type="email"
            required
            autoComplete="email"
            value={email}
            readOnly={verified && !emailChangeMode}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={membershipContent.emailPlaceholder}
            className={`${inputClass} ${verified && !emailChangeMode ? "bg-ocean-50/80" : ""}`}
          />
        </div>

        {codeSent || (verified && emailChangeMode) ? (
          <div className="min-w-0 flex-1 basis-full sm:basis-[9rem] lg:basis-[8rem]">
            <label
              htmlFor={codeId}
              className="mb-1 block text-xs font-medium uppercase tracking-wide text-ocean-500"
            >
              Code
            </label>
            <input
              id={codeId}
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              required={codeSent}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder={membershipContent.codePlaceholder}
              className={`${inputClass} font-mono tracking-widest placeholder:font-sans placeholder:tracking-normal`}
            />
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 lg:pb-0.5">
          {!verified || emailChangeMode ? (
            <button
              type="button"
              disabled={loading || !email.trim()}
              onClick={() => void handleSendCode()}
              className={secondaryBtnClass}
            >
              {loading && !codeSent
                ? "Sending…"
                : membershipContent.sendCodeLabel}
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                clearFeedback();
                setEmailChangeMode(true);
                setCodeSent(false);
                setCode("");
                setEmail(profile?.email ?? "");
              }}
              className={secondaryBtnClass}
            >
              {membershipContent.changeEmailLabel}
            </button>
          )}

          {codeSent ? (
            <button type="submit" disabled={loading} className={primaryBtnClass}>
              {loading
                ? "Verifying…"
                : verified && emailChangeMode
                  ? membershipContent.emailVerifyLabel
                  : membershipContent.verifyEmailLabel}
            </button>
          ) : null}

          {verified && emailChangeMode ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                clearFeedback();
                setEmailChangeMode(false);
                setCodeSent(false);
                setCode("");
                setEmail(profile?.email ?? "");
              }}
              className={secondaryBtnClass}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {!verified ? (
        <div className="mt-5 rounded-2xl border border-ocean-200/70 bg-gradient-to-br from-cream/80 via-white/55 to-ocean-100/50 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-md sm:p-8">
          <h3 className="font-display text-xl font-semibold tracking-tight text-ocean-900 sm:text-2xl">
            {membershipContent.gateHeadline}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-ocean-600 sm:text-base">
            {membershipContent.gateSupport}
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-ocean-200/70 bg-gradient-to-br from-cream/70 via-white/60 to-ocean-100/40 p-5 backdrop-blur-md sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-ocean-500">
                  {membershipContent.newsletterToggleLabel}
                </p>
                <p className="mt-1 text-sm text-ocean-600">
                  {membershipContent.newsletterToggleDescription}
                </p>
                <p className="mt-2 text-sm font-medium text-ocean-800">
                  {newsletterOn
                    ? membershipContent.newsletterOnLabel
                    : membershipContent.newsletterOffLabel}
                </p>
              </div>
              <button
                id={toggleId}
                type="button"
                role="switch"
                aria-checked={newsletterOn}
                aria-label={membershipContent.newsletterToggleLabel}
                disabled={newsletterBusy}
                onClick={() => void handleNewsletterToggle()}
                className={`relative h-8 w-14 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-400 disabled:opacity-60 ${
                  newsletterOn ? "bg-ocean-800" : "bg-ocean-200"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    newsletterOn ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {isPaidMember && profile ? (
            <div className="rounded-2xl border border-ocean-200/70 bg-white/70 p-5 sm:p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-ocean-500">
                {membershipContent.profilePlanLabel}
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-ocean-900">
                {PLAN_LABELS[profile.plan as Exclude<MemberProfileSummary["plan"], "none">]}
              </p>
              {profile.plan === "annual" && profile.membershipAnniversary ? (
                <p className="mt-2 text-xs text-ocean-600">
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
              <p className="mt-4 text-sm text-ocean-700">
                {membershipContent.perksComingSoon}
              </p>
            </div>
          ) : (
            <JoinForm
              mode="session"
              joinedLanding={false}
              initialPlans={initialPlans}
              initialPlansError={initialPlansError}
            />
          )}

          {logoutError ? (
            <p
              className="rounded-lg bg-coral/10 px-4 py-3 text-sm text-coral-dark"
              role="alert"
            >
              {logoutError}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className={secondaryBtnClass}
          >
            {loggingOut ? "Signing out…" : membershipContent.logoutLabel}
          </button>
        </div>
      )}
    </div>
  );
}
