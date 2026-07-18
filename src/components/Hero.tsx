import Image from "next/image";
import { getHeroCounts } from "@/lib/members/hero-counts";
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

export async function Hero({ membersEnabled }: { membersEnabled: boolean }) {
  const counts = membersEnabled ? await getHeroCounts() : null;

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-ocean-950 text-white min-h-[max(32rem,calc(100vw*1313/2000))]"
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

      <div
        className="pointer-events-none absolute inset-0 bg-ocean-950/15"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ocean-950/55 via-ocean-950/20 to-white/5"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-[max(32rem,calc(100vw*1313/2000))] max-w-6xl select-none flex-col justify-center px-6 pb-16 pt-24 sm:pb-20 sm:pt-28">
        <p className="text-sm font-medium uppercase tracking-widest text-ocean-100/90">
          {heroContent.eyebrow}
        </p>

        <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          {heroContent.headline}
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ocean-50/95 sm:text-xl">
          {heroContent.subheadline}
        </p>

        {counts && (
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-5">
            <a
              href="#membership"
              className={`${ctaBaseClass} bg-coral text-white hover:bg-coral-dark`}
              aria-label={`${heroContent.subscribeLabel}, ${exactCountFormatter.format(counts.newsletterSubscribers)} ${heroContent.newsletterCountLabel}`}
            >
              {heroContent.subscribeLabel}
              <HeroCtaBadge value={counts.newsletterSubscribers} />
            </a>
            <a
              href="#membership"
              className={`${ctaBaseClass} border border-cream/55 bg-cream/15 text-cream backdrop-blur-sm hover:bg-cream/25`}
              aria-label={`${heroContent.joinLabel}, ${exactCountFormatter.format(counts.paidMembers)} ${heroContent.paidMembersCountLabel}`}
            >
              {heroContent.joinLabel}
              <HeroCtaBadge value={counts.paidMembers} />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
