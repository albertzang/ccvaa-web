"use client";

import { useEffect, useState } from "react";

import type { HeroCounts } from "@/lib/members/hero-counts";
import { HERO_COUNTS_REFRESH_EVENT } from "@/lib/members/refresh-hero-counts";
import { membershipContent, siteConfig } from "@/lib/site";

const countFormatter = new Intl.NumberFormat(siteConfig.locale);

type MembershipSocialProofProps = {
  initialCounts: HeroCounts;
};

/** Quiet social proof above the membership form (verified). */
export function MembershipSocialProof({
  initialCounts,
}: MembershipSocialProofProps) {
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

  const text = `${countFormatter.format(counts.newsletterSubscribers)} ${membershipContent.socialProofSubscribers} · ${countFormatter.format(counts.paidMembers)} ${membershipContent.socialProofMembers}`;

  return (
    <p
      className="shrink-0 text-right text-sm font-medium tracking-wide text-cream/75"
      aria-live="polite"
    >
      {text}
    </p>
  );
}
