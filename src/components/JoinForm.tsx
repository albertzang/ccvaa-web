"use client";

import { useState } from "react";

import { membershipContent } from "@/lib/site";

type JoinPlanId = "founding" | "lifetime" | "annual";

type JoinPlanOffer = {
  id: JoinPlanId;
  label: string;
  description: string;
  feeCents: number;
  feeLabel: string;
  interval: "one_time" | "year";
  available: boolean;
};

export type JoinPlansProps = {
  foundingCap: number;
  foundingSeatsTaken: number;
  foundingSeatsRemaining: number;
  offeringOneTime: "founding" | "lifetime";
  plans: JoinPlanOffer[];
};

type ApiError = {
  ok: false;
  code: string;
  message: string;
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = (await response.json()) as T | ApiError;
  if (!response.ok || (data as ApiError).ok === false) {
    const err = data as ApiError;
    throw new Error(err.message ?? "Request failed.");
  }
  return data as T;
}

type JoinFormProps = {
  mode?: "public" | "session";
  joinedLanding?: boolean;
  initialPlans: JoinPlansProps | null;
  initialPlansError: string | null;
};

/**
 * Session mode: plan picker → Stripe Checkout (identity from verified session).
 * Public mode retained for legacy OTP join path (unused by portal UI).
 */
export function JoinForm({
  mode = "public",
  joinedLanding,
  initialPlans,
  initialPlansError,
}: JoinFormProps) {
  const [plans, setPlans] = useState<JoinPlanOffer[] | null>(
    initialPlans?.plans ?? null,
  );
  const [plansError, setPlansError] = useState<string | null>(
    initialPlansError,
  );
  const [plan, setPlan] = useState<JoinPlanId | "">(
    () => initialPlans?.plans.find((p) => p.available)?.id ?? "",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [seatsNote, setSeatsNote] = useState<string | null>(() => {
    if (!initialPlans) return null;
    return initialPlans.offeringOneTime === "founding"
      ? `${initialPlans.foundingSeatsRemaining} of ${initialPlans.foundingCap} Founding seats remaining.`
      : "Founding seats are full — Lifetime and Annual are available.";
  });

  const clearFeedback = () => {
    setMessage(null);
    setError(null);
  };

  const reloadPlans = async () => {
    setPlansError(null);
    setLoading(true);
    try {
      const data = await fetchJson<{ ok: true } & JoinPlansProps>(
        "/api/members/join/plans",
      );
      setPlans(data.plans);
      setSeatsNote(
        data.offeringOneTime === "founding"
          ? `${data.foundingSeatsRemaining} of ${data.foundingCap} Founding seats remaining.`
          : "Founding seats are full — Lifetime and Annual are available.",
      );
      const firstAvailable = data.plans.find((p) => p.available);
      setPlan((current) => current || firstAvailable?.id || "");
    } catch (err) {
      setPlans(null);
      setPlansError(
        err instanceof Error
          ? err.message
          : "Membership join is unavailable right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (event: React.FormEvent) => {
    event.preventDefault();
    clearFeedback();
    if (!plan) {
      setError("Choose a membership plan.");
      return;
    }
    setLoading(true);
    try {
      const result = await fetchJson<{ checkoutUrl: string }>(
        "/api/members/join/checkout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        },
      );
      window.location.assign(result.checkoutUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not open checkout.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-ocean-200/70 bg-white/70 p-5 text-left sm:p-6">
      {joinedLanding ? (
        <p
          className="rounded-lg bg-white px-4 py-3 text-sm text-ocean-700"
          role="status"
        >
          {membershipContent.joinedSuccess}
        </p>
      ) : null}

      {seatsNote && !plansError ? (
        <p className={`${joinedLanding ? "mt-3" : ""} text-xs text-ocean-500`}>
          {seatsNote}
        </p>
      ) : null}

      {message ? (
        <p
          className="mt-3 rounded-lg bg-ocean-50 px-4 py-3 text-sm text-ocean-700"
          role="status"
        >
          {message}
        </p>
      ) : null}

      {error || plansError ? (
        <p
          className="mt-3 rounded-lg bg-coral/10 px-4 py-3 text-sm text-coral-dark"
          role="alert"
        >
          {error ?? plansError}
        </p>
      ) : null}

      {plansError ? (
        <button
          type="button"
          onClick={() => void reloadPlans()}
          disabled={loading}
          className="mt-3 text-sm font-medium text-ocean-700 underline decoration-ocean-300 underline-offset-4 hover:text-ocean-900 disabled:opacity-60"
        >
          Retry loading plans
        </button>
      ) : null}

      {plans ? (
        <form onSubmit={handleCheckout} className="mt-4 space-y-4">
          <fieldset>
            <legend className="sr-only">Choose a plan</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {plans.map((offer) => (
                <label
                  key={offer.id}
                  className={`flex h-full cursor-pointer flex-col rounded-xl border px-4 py-3 text-left transition-colors ${
                    plan === offer.id
                      ? "border-ocean-500 bg-ocean-50 ring-1 ring-ocean-500"
                      : "border-ocean-200 bg-white hover:border-ocean-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="membership-plan"
                    value={offer.id}
                    checked={plan === offer.id}
                    onChange={() => setPlan(offer.id)}
                    className="sr-only"
                  />
                  <span className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-display font-semibold text-ocean-900">
                      {offer.label}
                    </span>
                    <span className="text-sm font-medium text-ocean-700">
                      {offer.feeLabel}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm text-ocean-600">
                    {offer.description}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <p className="text-xs text-ocean-500">{membershipContent.consentNote}</p>

          <button
            type="submit"
            disabled={loading || mode !== "session"}
            className="rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-coral-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/60 disabled:opacity-60"
          >
            {loading ? "Opening checkout…" : membershipContent.checkoutLabel}
          </button>
        </form>
      ) : null}
    </div>
  );
}
