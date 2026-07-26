import type { ReactNode } from "react";
import Image from "next/image";

import { HeroGateCtas } from "@/components/HeroGateCtas";
import { getHeroCounts } from "@/lib/members/hero-counts";
import { heroContent } from "@/lib/site";

/** Hero image is 2000×1313 — sticky background height (membership still scrolls over it). */
export const HERO_STAGE_HEIGHT_CLASS =
  "h-[max(32rem,calc(100vw*1313/2000))]";
/** Stage must be ≥ sticky height or the image bleeds into About. */
const HERO_STAGE_MIN_HEIGHT_CLASS =
  "min-h-[max(32rem,calc(100vw*1313/2000))]";
const HERO_STAGE_PULL_CLASS = "-mt-[max(32rem,calc(100vw*1313/2000))]";

type HeroProps = {
  membersEnabled: boolean;
  /** Show OTP gate in hero (logged-out). */
  showMembershipGate?: boolean;
  /**
   * Verified member: compact hero under the nav so `#membership` gets the
   * sticky-image frame. Logged-out keeps a tall, centered hero.
   */
  compact?: boolean;
  /** Membership section — only when verified (scrolls over sticky hero background). */
  footer?: ReactNode;
};

export async function Hero({
  membersEnabled,
  showMembershipGate = false,
  compact = false,
  footer,
}: HeroProps) {
  const counts = membersEnabled ? await getHeroCounts() : null;

  return (
    <div id="hero-stage" className={`relative ${HERO_STAGE_MIN_HEIGHT_CLASS}`}>
      {/* Sticky background: pinned while hero + membership scroll over it */}
      <div
        className={`sticky top-0 overflow-hidden bg-ocean-950 ${HERO_STAGE_HEIGHT_CLASS}`}
        aria-hidden="true"
      >
        <Image
          src="/images/hero-background.webp"
          alt=""
          fill
          priority
          unoptimized
          className="object-cover object-left"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-ocean-950/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-ocean-950/55 via-ocean-950/20 to-white/5" />
      </div>

      <div className={`relative z-10 ${HERO_STAGE_PULL_CLASS}`}>
        <section
          id="hero"
          className={
            compact
              ? "text-white"
              : `flex ${HERO_STAGE_HEIGHT_CLASS} items-center text-white`
          }
        >
          {compact ? (
            /* Quiet brand ribbon — membership owns focus in the sticky frame. */
            <div className="relative mx-auto flex w-full max-w-6xl select-none flex-col gap-3 px-6 pt-20 pb-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:pt-24 sm:pb-3">
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-widest text-cream/55">
                  {heroContent.eyebrow}
                </p>
                <h1 className="mt-1 max-w-xl font-display text-lg font-medium leading-snug tracking-tight text-cream/75 sm:text-xl">
                  {heroContent.headline}
                </h1>
              </div>
              {counts ? (
                <HeroGateCtas
                  initialCounts={counts}
                  showGate={false}
                  quiet
                />
              ) : null}
            </div>
          ) : (
            <div className="relative mx-auto w-full max-w-6xl select-none px-6 pt-20 pb-10 sm:pt-24 sm:pb-12">
              <p className="text-sm font-medium uppercase tracking-widest text-ocean-100/90">
                {heroContent.eyebrow}
              </p>

              <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {heroContent.headline}
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ocean-50/95 sm:text-xl">
                {heroContent.subheadline}
              </p>

              {counts ? (
                <HeroGateCtas
                  initialCounts={counts}
                  showGate={showMembershipGate}
                />
              ) : null}
            </div>
          )}
        </section>

        {footer}
      </div>
    </div>
  );
}
