"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { softReload } from "@/lib/members/soft-reload";
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
  initialPlans: JoinPlansProps | null;
  initialPlansError: string | null;
};

/**
 * Session mode: plan picker → Stripe Checkout (identity from verified session).
 * Public mode retained for legacy OTP join path (unused by portal UI).
 * Checkout failures soft-refresh the page (no nav banner) so plans/profile can catch up.
 */
export function JoinForm({
  mode = "public",
  initialPlans,
  initialPlansError,
}: JoinFormProps) {
  const router = useRouter();
  const [plans, setPlans] = useState<JoinPlanOffer[] | null>(
    initialPlans?.plans ?? null,
  );
  const [plansError, setPlansError] = useState<string | null>(
    initialPlansError,
  );
  const [plan, setPlan] = useState<JoinPlanId | "">(
    () => initialPlans?.plans.find((p) => p.available)?.id ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [prevInitialPlans, setPrevInitialPlans] = useState(initialPlans);
  const [prevInitialPlansError, setPrevInitialPlansError] =
    useState(initialPlansError);

  // Soft refresh re-supplies server props — sync during render (not in an effect).
  if (
    initialPlans !== prevInitialPlans ||
    initialPlansError !== prevInitialPlansError
  ) {
    setPrevInitialPlans(initialPlans);
    setPrevInitialPlansError(initialPlansError);
    setPlans(initialPlans?.plans ?? null);
    setPlansError(initialPlansError);
    const available = initialPlans?.plans.filter((p) => p.available) ?? [];
    setPlan((current) =>
      current && available.some((p) => p.id === current)
        ? current
        : (available[0]?.id ?? ""),
    );
  }

  const reloadPlans = async () => {
    setPlansError(null);
    setLoading(true);
    try {
      const data = await fetchJson<{ ok: true } & JoinPlansProps>(
        "/api/members/join/plans",
      );
      setPlans(data.plans);
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
    if (!plan) {
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
    } catch {
      setLoading(false);
      softReload(router);
    }
  };

  return (
    <div className="text-left">
      {plansError ? (
        <button
          type="button"
          onClick={() => void reloadPlans()}
          disabled={loading}
          className="mb-4 text-sm font-medium text-cream/80 underline decoration-cream/40 underline-offset-4 hover:text-cream disabled:opacity-60"
        >
          Retry loading plans
        </button>
      ) : null}

      {plans ? (
        <form onSubmit={handleCheckout} className="space-y-4">
          <fieldset>
            <legend className="sr-only">Choose a plan</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {plans.map((offer) => (
                <label
                  key={offer.id}
                  className={`flex h-full cursor-pointer flex-col rounded-xl border px-4 py-3 text-left transition-colors ${
                    plan === offer.id
                      ? "border-cream/55 bg-white/12 ring-1 ring-cream/35"
                      : "border-white/15 bg-transparent hover:border-white/30 hover:bg-white/5"
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
                    <span className="font-display font-semibold text-cream">
                      {offer.label}
                    </span>
                    <span className="text-sm font-medium text-cream/85">
                      {offer.feeLabel}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm text-cream/70">
                    {offer.description}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={loading || mode !== "session" || !plan}
            className="ml-auto block w-fit rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-coral-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/60 disabled:opacity-60"
          >
            {loading ? "Opening checkout…" : membershipContent.checkoutLabel}
          </button>
        </form>
      ) : null}
    </div>
  );
}
