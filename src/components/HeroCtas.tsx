"use client";

import { useEffect, useState } from "react";

import type { HeroCounts } from "@/lib/members/hero-counts";
import { HERO_COUNTS_REFRESH_EVENT } from "@/lib/members/refresh-hero-counts";
import { heroContent, membershipContent, siteConfig } from "@/lib/site";

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
  /** Anchor for Sub/Join when interactive (`#membership` when verified). */
  href?: string;
  className?: string;
  /**
   * When false, plain social-proof text (open hero gate — not clickable).
   * When true, coral/outline links that scroll to `href`.
   */
  interactive?: boolean;
};

export function HeroCtas({
  initialCounts,
  href = "#membership",
  className = "mt-8 flex flex-wrap items-center gap-x-5 gap-y-5",
  interactive = true,
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

  const subscribeLabel = `${heroContent.subscribeLabel}, ${exactCountFormatter.format(counts.newsletterSubscribers)} ${heroContent.newsletterCountLabel}`;
  const joinLabel = `${heroContent.joinLabel}, ${exactCountFormatter.format(counts.paidMembers)} ${heroContent.paidMembersCountLabel}`;

  if (!interactive) {
    // Typography only — no pill chrome / badges (those read as buttons).
    return (
      <p
        className="font-display text-base font-semibold tracking-tight text-cream sm:text-lg"
        aria-live="polite"
      >
        {exactCountFormatter.format(counts.newsletterSubscribers)}{" "}
        {membershipContent.socialProofSubscribers}
        <span className="mx-2 text-cream/50" aria-hidden="true">
          ·
        </span>
        {exactCountFormatter.format(counts.paidMembers)}{" "}
        {membershipContent.socialProofMembers}
      </p>
    );
  }

  return (
    <div className={className}>
      <a
        href={href}
        className={`${ctaBaseClass} bg-coral text-white hover:bg-coral-dark`}
        aria-label={subscribeLabel}
      >
        {heroContent.subscribeLabel}
        <HeroCtaBadge value={counts.newsletterSubscribers} />
      </a>
      <a
        href={href}
        className={`${ctaBaseClass} border border-cream/55 bg-cream/15 text-cream backdrop-blur-sm hover:bg-cream/25`}
        aria-label={joinLabel}
      >
        {heroContent.joinLabel}
        <HeroCtaBadge value={counts.paidMembers} />
      </a>
    </div>
  );
}
