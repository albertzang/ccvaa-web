import Image from "next/image";
import { heroContent } from "@/lib/site";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-ocean-950 text-white min-h-[max(32rem,calc(100vw*762/1400))]"
    >
      <Image
        src="/images/hero-background.webp"
        alt=""
        fill
        priority
        unoptimized
        className="object-cover object-[35%_50%]"
        sizes="100vw"
      />

      <div
        className="pointer-events-none absolute inset-0 bg-ocean-950/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ocean-950/30 via-ocean-950/10 to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-[max(32rem,calc(100vw*762/1400))] max-w-6xl flex-col justify-center px-6 pb-16 pt-24 sm:pb-20 sm:pt-28">
        <p className="text-sm font-medium uppercase tracking-widest text-ocean-200">
          {heroContent.eyebrow}
        </p>

        <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          {heroContent.headline}
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ocean-100 sm:text-xl">
          {heroContent.subheadline}
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href={heroContent.primaryCta.href}
            className="inline-flex items-center justify-center rounded-full bg-coral px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-coral/25 transition-all hover:bg-coral-dark hover:shadow-coral/40"
          >
            {heroContent.primaryCta.label}
          </a>
          <a
            href={heroContent.secondaryCta.href}
            className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
          >
            {heroContent.secondaryCta.label}
          </a>
        </div>
      </div>
    </section>
  );
}
