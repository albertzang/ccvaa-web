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

function HeroCtaBadge({
  value,
  tone,
}: {
  value: number;
  tone: "on-coral" | "on-glass";
}) {
  const toneClass =
    tone === "on-coral"
      ? "bg-ocean-950 text-ocean-50 ring-2 ring-white/85"
      : "bg-coral text-white ring-2 ring-white/90";

  return (
    <span
      className={`absolute -right-2 -top-2 inline-flex h-7 min-w-7 max-w-[2.85rem] shrink-0 items-center justify-center overflow-hidden rounded-full px-1 text-[10px] font-semibold tabular-nums lining-nums leading-none ${toneClass}`}
      aria-hidden="true"
    >
      <span className="block max-w-full truncate text-center">
        {formatCompactCount(value)}
      </span>
    </span>
  );
}

export async function Hero() {
  const counts = await getHeroCounts();

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

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-5">
          <a
            href="#contact"
            className="relative inline-flex rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-coral-dark"
            aria-label={`${heroContent.subscribeLabel}, ${exactCountFormatter.format(counts.newsletterSubscribers)} ${heroContent.newsletterCountLabel}`}
          >
            {heroContent.subscribeLabel}
            <HeroCtaBadge
              value={counts.newsletterSubscribers}
              tone="on-coral"
            />
          </a>
          <a
            href="#membership"
            className="relative inline-flex rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            aria-label={`${heroContent.joinLabel}, ${exactCountFormatter.format(counts.paidMembers)} ${heroContent.paidMembersCountLabel}`}
          >
            {heroContent.joinLabel}
            <HeroCtaBadge value={counts.paidMembers} tone="on-glass" />
          </a>
        </div>
      </div>
    </section>
  );
}
