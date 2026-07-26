"use client";

import { useState } from "react";

import { HeroGateCtas } from "@/components/HeroGateCtas";
import type { HeroCounts } from "@/lib/members/hero-counts";
import { heroContent } from "@/lib/site";

type HeroLoggedOutProps = {
  initialCounts: HeroCounts;
  showGate: boolean;
};

/**
 * Logged-out hero body: brand + membership gate.
 * API error chip sits in a reserved, centered slot just above the eyebrow
 * (inside existing top padding — does not change nav ↔ eyebrow spacing).
 */
export function HeroLoggedOut({
  initialCounts,
  showGate,
}: HeroLoggedOutProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  return (
    <div className="relative mx-auto w-full max-w-6xl select-none px-6 pt-20 pb-10 sm:pt-24 sm:pb-12">
      <div
        className="absolute inset-x-6 top-20 z-10 flex min-h-5 -translate-y-full items-center justify-center sm:top-24"
        aria-live="polite"
      >
        {apiError ? (
          <p
            className="w-fit max-w-full rounded-md bg-coral px-2 py-0.5 text-center text-[10px] font-semibold text-white shadow-sm ring-1 ring-cream/25"
            role="alert"
          >
            {apiError}
          </p>
        ) : null}
      </div>

      <p className="text-sm font-medium uppercase tracking-widest text-ocean-100/90">
        {heroContent.eyebrow}
      </p>

      <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
        {heroContent.headline}
      </h1>

      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ocean-50/95 sm:text-xl">
        {heroContent.subheadline}
      </p>

      <HeroGateCtas
        initialCounts={initialCounts}
        showGate={showGate}
        onApiError={setApiError}
      />
    </div>
  );
}
