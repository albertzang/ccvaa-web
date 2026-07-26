"use client";

import { useEffect, useState } from "react";

import type { HeroCounts } from "@/lib/members/hero-counts";
import { HERO_COUNTS_REFRESH_EVENT } from "@/lib/members/refresh-hero-counts";
import { heroContent, siteConfig } from "@/lib/site";

const exactCountFormatter = new Intl.NumberFormat(siteConfig.locale);
const compactCountFormatter = new Intl.NumberFormat(siteConfig.locale, {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
});

function formatCompactCount(value: number): string {
  return compactCountFormatter.format(value);
}

function HeroCtaBadge({ value }: { value: number }) {
  return (
    <span
      className="absolute -right-2 -top-2 inline-flex h-7 min-w-7 max-w-[2.85rem] shrink-0 items-center justify-center overflow-hidden rounded-full bg-ocean-950 px-1 text-[10px] font-semibold tabular-nums lining-nums leading-none text-cream ring-2 ring-cream/90"
      aria-hidden="true"
    >
      <span className="block max-w-full truncate text-center">
        {formatCompactCount(value)}
      </span>
    </span>
  );
}

const ctaBaseClass =
  "relative inline-flex min-h-12 min-w-[9.5rem] items-center justify-center rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-ocean-950";

type HeroCtasProps = {
  initialCounts: HeroCounts;
  /** Anchor for Sub/Join (`#hero` logged out, `#membership` when verified). */
  href?: string;
  className?: string;
};

export function HeroCtas({
  initialCounts,
  href = "#membership",
  className = "mt-8 flex flex-wrap items-center gap-x-5 gap-y-5",
}: HeroCtasProps) {
  const [counts, setCounts] = useState(initialCounts);
  const [prevInitialCounts, setPrevInitialCounts] = useState(initialCounts);
  if (
    initialCounts.newsletterSubscribers !==
      prevInitialCounts.newsletterSubscribers ||
    initialCounts.paidMembers !== prevInitialCounts.paidMembers
  ) {
    setPrevInitialCounts(initialCounts);
    setCounts(initialCounts);
  }

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/api/members/hero-counts", {
          cache: "no-store",
        });
        const data = (await response.json()) as
          | { ok: true } & HeroCounts
          | { ok: false; message?: string };
        if (!response.ok || data.ok === false || cancelled) {
          return;
        }
        setCounts({
          newsletterSubscribers: data.newsletterSubscribers,
          paidMembers: data.paidMembers,
        });
      } catch {
        // Keep last good counts on transient failure.
      }
    };

    const onRefresh = () => {
      void load();
    };
    window.addEventListener(HERO_COUNTS_REFRESH_EVENT, onRefresh);
    return () => {
      cancelled = true;
      window.removeEventListener(HERO_COUNTS_REFRESH_EVENT, onRefresh);
    };
  }, []);

  return (
    <div className={className}>
      <a
        href={href}
        className={`${ctaBaseClass} bg-coral text-white hover:bg-coral-dark`}
        aria-label={`${heroContent.subscribeLabel}, ${exactCountFormatter.format(counts.newsletterSubscribers)} ${heroContent.newsletterCountLabel}`}
      >
        {heroContent.subscribeLabel}
        <HeroCtaBadge value={counts.newsletterSubscribers} />
      </a>
      <a
        href={href}
        className={`${ctaBaseClass} border border-cream/55 bg-cream/15 text-cream backdrop-blur-sm hover:bg-cream/25`}
        aria-label={`${heroContent.joinLabel}, ${exactCountFormatter.format(counts.paidMembers)} ${heroContent.paidMembersCountLabel}`}
      >
        {heroContent.joinLabel}
        <HeroCtaBadge value={counts.paidMembers} />
      </a>
    </div>
  );
}
