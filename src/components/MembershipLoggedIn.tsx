"use client";

import { useState } from "react";

import {
  MembershipPanel,
  type MemberProfileSummary,
  type UnsubLanding,
} from "@/components/MembershipPanel";
import { type JoinPlansProps } from "@/components/JoinForm";
import { NavMessageBanner } from "@/components/NavMessageBanner";
import type { HeroCounts } from "@/lib/members/hero-counts";
import { heroContent } from "@/lib/site";

type MembershipLoggedInProps = {
  joinedLanding?: boolean;
  unsubLanding?: UnsubLanding;
  initialProfile: MemberProfileSummary | null;
  initialProfileError: string | null;
  initialPlans: JoinPlansProps | null;
  initialPlansError: string | null;
  initialHeroCounts: HeroCounts | null;
};

/**
 * Verified membership body: brand + glass panel.
 * API errors use the shared fixed chip under the navbar (`NavMessageBanner`).
 */
export function MembershipLoggedIn({
  joinedLanding,
  unsubLanding,
  initialProfile,
  initialProfileError,
  initialPlans,
  initialPlansError,
  initialHeroCounts,
}: MembershipLoggedInProps) {
  const [banner, setBanner] = useState<string | null>(null);

  return (
    <div className="relative mx-auto w-full max-w-6xl px-6 pt-20 pb-10 sm:pt-24 sm:pb-14">
      <NavMessageBanner message={banner} />

      <div className="mx-auto max-w-3xl">
        <div className="mb-5 select-none sm:mb-6">
          <p className="text-[10px] font-medium uppercase tracking-widest text-cream/55">
            {heroContent.eyebrow}
          </p>
          <h1 className="mt-1 max-w-xl font-display text-lg font-medium leading-snug tracking-tight text-cream/75 sm:text-xl">
            {heroContent.headline}
          </h1>
        </div>
        <MembershipPanel
          joinedLanding={joinedLanding}
          unsubLanding={unsubLanding}
          initialProfile={initialProfile}
          initialProfileError={initialProfileError}
          initialPlans={initialPlans}
          initialPlansError={initialPlansError}
          initialHeroCounts={initialHeroCounts}
          onBanner={setBanner}
        />
      </div>
    </div>
  );
}
