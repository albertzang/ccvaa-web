"use client";

import { useState } from "react";

import { HeroGateCtas } from "@/components/HeroGateCtas";
import { NavMessageBanner } from "@/components/NavMessageBanner";
import type { HeroCounts } from "@/lib/members/hero-counts";
import { heroContent } from "@/lib/site";

type HeroLoggedOutProps = {
  initialCounts: HeroCounts;
  showGate: boolean;
};

/**
 * Logged-out hero body: brand + membership gate.
 * API errors use the shared fixed chip under the navbar (`NavMessageBanner`).
 */
export function HeroLoggedOut({
  initialCounts,
  showGate,
}: HeroLoggedOutProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  return (
    <div className="relative mx-auto w-full max-w-6xl select-none px-6 pt-20 pb-10 sm:pt-24 sm:pb-12">
      <NavMessageBanner message={apiError} />

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
