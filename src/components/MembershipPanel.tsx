"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { JoinForm, type JoinPlansProps } from "@/components/JoinForm";
import { MembershipSocialProof } from "@/components/MembershipSocialProof";
import type { HeroCounts } from "@/lib/members/hero-counts";
import { refreshHeroCounts } from "@/lib/members/refresh-hero-counts";
import { otpCodeSchema } from "@/lib/members/zod/otp";
import { membershipContent } from "@/lib/site";

const gateEmailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email.")
  .email("Enter a valid email address.")
  .max(320);

export type MemberProfileSummary = {
  authenticated: true;
  memberId: string;
  email: string;
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
  initialHeroCounts?: HeroCounts | null;
};

type ApiError = {
  ok: false;
  code: string;
  message: string;
};

const SESSION_POLL_MS = 1500;
const SESSION_MAX_ATTEMPTS = 8;

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

async function fetchMemberProfile() {
  const response = await fetch("/api/members/profile", { cache: "no-store" });
  const data = (await response.json()) as
    | { ok: true; profile: MemberProfileSummary }
    | ApiError;
  if (!response.ok || (data as ApiError).ok === false) {
    const err = data as ApiError;
    throw new Error(err.message ?? "Could not load membership profile.");
  }
  return (data as { ok: true; profile: MemberProfileSummary }).profile;
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

/** Logged-in: looks read-only until focused / clicked for in-place edit. Width from content. */
const quietInputClass =
  "box-border h-9 max-w-full min-w-[12ch] field-sizing-content w-auto cursor-text rounded-md border border-transparent bg-cream/10 px-2.5 text-sm leading-none text-cream/95 transition-colors placeholder:text-cream/40 hover:bg-cream/15 focus:border-white/30 focus:bg-cream/20 focus:outline-none focus:ring-0";

const quietLabelClass =
  "mb-0.5 block text-[10px] font-medium uppercase tracking-wider text-cream/65";

/** Same h-9 as quiet inputs; primary = Enter default. */
const glassPrimaryBtnClass =
  "inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-cream px-3 text-xs font-semibold leading-none text-ocean-950 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/60 disabled:opacity-60";

const glassSecondaryBtnClass =
  "inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-cream/65 bg-transparent px-3 text-xs font-medium leading-none text-cream transition-colors hover:border-cream hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/45 disabled:opacity-60";

export function MembershipPanel({
  joinedLanding,
  unsubLanding,
  initialProfile,
  initialProfileError,
  initialPlans,
  initialPlansError,
  initialHeroCounts = null,
}: MembershipPanelProps) {
  const router = useRouter();
  const emailId = useId();
  const codeId = useId();
  const toggleId = useId();

  const [profile, setProfile] = useState<MemberProfileSummary | null>(
    () =>
      initialProfile ??
      (unsubLanding?.kind === "success" ? unsubLanding.profile ?? null : null),
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
  /** Client field validation — reserved chip under the identity row (not top banner). */
  const [fieldError, setFieldError] = useState<string | null>(null);
  /** API / system errors only — top banner. */
  const [error, setError] = useState<string | null>(() =>
    unsubLanding?.kind === "invalid"
      ? membershipContent.unsubLandingInvalid
      : (initialProfileError ?? null),
  );
  const [loading, setLoading] = useState(false);
  const [newsletterBusy, setNewsletterBusy] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [joinReturnError, setJoinReturnError] = useState<string | null>(null);

  const verified = Boolean(profile?.authenticated);
  const savedEmail = profile?.email ?? "";
  const emailDirty =
    verified &&
    email.trim().toLowerCase() !== savedEmail.trim().toLowerCase();
  /** Email-change API path: dirty value or OTP already in flight. */
  const emailChangeMode = verified && (emailDirty || codeSent);

  useEffect(() => {
    if (!joinedLanding) {
      return;
    }
    // Session checkout is the common path: already verified (plan none) → pay →
    // return with session_id. Must still poll join/session to refresh paid plan;
    // skipping on authenticated left JoinForm stuck after successful checkout.
    if (profile?.authenticated && profile.plan !== "none") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    // Need Stripe session_id, or an existing session to re-read DB plan.
    if (!sessionId && !profile?.authenticated) {
      return;
    }

    let cancelled = false;

    const applyReadyProfile = (next: MemberProfileSummary) => {
      setProfile(next);
      setEmail(next.email);
      // Drop joined/session_id from the URL — cookie + plan are the source of truth.
      window.history.replaceState({}, "", "/#membership");
      if (next.plan !== "none") {
        refreshHeroCounts();
      }
    };

    const run = async () => {
      setJoinReturnError(null);

      for (let attempt = 0; attempt < SESSION_MAX_ATTEMPTS; attempt += 1) {
        if (cancelled) {
          return;
        }
        try {
          if (sessionId) {
            const result = await postJoinSession(sessionId);
            if (cancelled) {
              return;
            }
            if (result.status === "ready") {
              applyReadyProfile(result.profile);
              return;
            }
          } else {
            // Landed on ?joined=1 without session_id: re-read DB plan so perks
            // appear once the webhook has activated.
            const next = await fetchMemberProfile();
            if (cancelled) {
              return;
            }
            if (next.plan !== "none") {
              applyReadyProfile(next);
              return;
            }
          }
        } catch (err) {
          if (cancelled) {
            return;
          }
          setJoinReturnError(
            err instanceof Error
              ? err.message
              : "Could not open your membership session.",
          );
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, SESSION_POLL_MS));
      }
      if (!cancelled) {
        setJoinReturnError(membershipContent.joinedSessionTimeout);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [joinedLanding, profile?.authenticated, profile?.plan]);

  const clearFeedback = () => {
    setFieldError(null);
    setError(null);
  };

  const firstZodMessage = (parsed: {
    success: boolean;
    error?: { issues: { message: string }[] };
  }) =>
    parsed.success
      ? null
      : (parsed.error?.issues[0]?.message ?? "Please check the form.");

  /** Client checks → reserved chip under identity row (form uses noValidate). */
  const validateSendCode = (): boolean => {
    const emailIssue = firstZodMessage(gateEmailSchema.safeParse(email));
    if (emailIssue) {
      setFieldError(emailIssue);
      return false;
    }
    return true;
  };

  const validateVerifyCode = (): boolean => {
    const emailIssue = firstZodMessage(gateEmailSchema.safeParse(email));
    if (emailIssue) {
      setFieldError(emailIssue);
      return false;
    }
    if (!otpCodeSchema.safeParse(code).success) {
      setFieldError(
        code.trim()
          ? "Enter a 6-digit code."
          : membershipContent.verifyHint,
      );
      return false;
    }
    return true;
  };

  const handleSendCode = async () => {
    clearFeedback();
    if (!validateSendCode()) {
      return;
    }
    setLoading(true);
    try {
      if (verified && emailChangeMode) {
        await postJson<{ message: string }>(
          "/api/members/profile/email/start",
          { newEmail: email },
        );
        setCodeSent(true);
      } else {
        await postJson<{ message: string }>("/api/members/verify/start", {
          email,
        });
        setCodeSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    clearFeedback();
    if (!validateVerifyCode()) {
      return;
    }
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
      } else {
        const result = await postJson<{
          profile: MemberProfileSummary;
          message: string;
        }>("/api/members/verify/verify", {
          email,
          code,
        });
        setProfile(result.profile);
        setEmail(result.profile.email);
        setCode("");
        setCodeSent(false);
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
      refreshHeroCounts();
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
      setEmail("");
      setCode("");
      setCodeSent(false);
      setFieldError(null);
      setError(null);
      router.refresh();
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

  /** Top slot: API / join-return / logout / invalid-unsub errors only (no info toasts). */
  const topBanner = error
    ? {
        text: error,
        dismiss: () => setError(null),
      }
    : joinReturnError
      ? {
          text: joinReturnError,
          dismiss: () => setJoinReturnError(null),
        }
      : logoutError
        ? {
            text: logoutError,
            dismiss: () => setLogoutError(null),
          }
        : null;

  // Gate OTP lives in Hero when logged out; this panel is verified-only.
  if (!verified) {
    return null;
  }

  return (
    <div className="relative rounded-3xl border border-white/12 bg-black/28 px-5 py-5 backdrop-blur-md sm:px-8 sm:py-6">
      {topBanner ? (
        <div className="absolute inset-x-5 top-0 z-10 -translate-y-[calc(100%+0.5rem)] sm:inset-x-8">
          <div
            className="relative rounded-lg bg-coral-dark py-2.5 pl-4 pr-10 text-sm font-medium text-cream shadow-lg ring-1 ring-coral/70 sm:py-3"
            role="alert"
          >
            <p>{topBanner.text}</p>
            <button
              type="button"
              onClick={topBanner.dismiss}
              className="absolute right-2 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-md text-cream/80 transition-colors hover:bg-cream/15 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/60"
              aria-label="Dismiss message"
            >
              <span aria-hidden="true" className="text-lg leading-none">
                ×
              </span>
            </button>
          </div>
        </div>
      ) : null}

      <div className="text-left">

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (codeSent) {
            void handleVerify();
            return;
          }
          void handleSendCode();
        }}
        className="w-full"
      >
        {/* Error (left) + social proof (right) — reserved height so show/hide doesn’t shift. */}
        <div className="mb-1.5 flex min-h-5 items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            {fieldError ? (
              <p
                className="w-fit max-w-full rounded-md bg-coral px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm ring-1 ring-cream/25"
                role="alert"
              >
                {fieldError}
              </p>
            ) : null}
          </div>
          {initialHeroCounts ? (
            <MembershipSocialProof initialCounts={initialHeroCounts} />
          ) : null}
        </div>
        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
          <div className="min-w-0">
            <label htmlFor={emailId} className={quietLabelClass}>
              Email
            </label>
            <input
              id={emailId}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (fieldError) {
                  setFieldError(null);
                }
              }}
              placeholder={membershipContent.emailPlaceholder}
              size={Math.max(
                email.trim().length,
                membershipContent.emailPlaceholder.length,
                12,
              )}
              className={quietInputClass}
            />
          </div>

          {codeSent ? (
            <div className="min-w-0">
              <label htmlFor={codeId} className={quietLabelClass}>
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
                onChange={(event) => {
                  setCode(event.target.value);
                  if (fieldError) {
                    setFieldError(null);
                  }
                }}
                placeholder={membershipContent.codePlaceholder}
                size={Math.max(code.length, 6)}
                className={`${quietInputClass} min-w-[6ch] font-mono tracking-widest placeholder:font-sans placeholder:tracking-normal`}
              />
            </div>
          ) : null}

          {emailDirty || codeSent ? (
            <div className="flex h-9 flex-nowrap items-center gap-2 pb-px">
              <button
                type="submit"
                disabled={
                  loading || (!codeSent && !email.trim())
                }
                className={glassPrimaryBtnClass}
              >
                {loading
                  ? codeSent
                    ? "Verifying…"
                    : "Sending…"
                  : codeSent
                    ? membershipContent.emailVerifyLabel
                    : membershipContent.changeEmailLabel}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  clearFeedback();
                  setCodeSent(false);
                  setCode("");
                  setEmail(savedEmail);
                }}
                className={glassSecondaryBtnClass}
              >
                Cancel
              </button>
            </div>
          ) : null}
        </div>
      </form>

      <div className="mt-5 space-y-4">
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-[1fr_auto] sm:gap-8">
          <div className="min-w-0">
            <p className={quietLabelClass}>
              {membershipContent.newsletterToggleLabel}
            </p>
            {/* px/py match quiet inputs so label→value spacing & inset align with Email */}
            <p className="px-1.5 py-1 text-sm leading-relaxed text-cream/95">
              {membershipContent.newsletterToggleDescription}
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 self-stretch sm:min-h-full">
            <p
              className={`text-sm font-semibold ${
                newsletterOn ? "text-cream" : "text-cream/70"
              }`}
            >
              {newsletterOn
                ? membershipContent.newsletterOnLabel
                : membershipContent.newsletterOffLabel}
            </p>
            <button
              id={toggleId}
              type="button"
              role="switch"
              aria-checked={newsletterOn}
              aria-label={membershipContent.newsletterToggleLabel}
              disabled={newsletterBusy}
              onClick={() => void handleNewsletterToggle()}
              className={`flex h-8 w-14 shrink-0 items-center rounded-full border p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/55 disabled:opacity-60 ${
                newsletterOn
                  ? "border-coral bg-coral"
                  : "border-cream/55 bg-white/10"
              }`}
            >
              <span
                className={`h-6 w-6 rounded-full bg-cream shadow transition-transform ${
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

        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={loggingOut}
          className={glassSecondaryBtnClass}
        >
          {loggingOut ? "Signing out…" : membershipContent.logoutLabel}
        </button>
      </div>
      </div>
    </div>
  );
}
