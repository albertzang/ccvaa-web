import { aboutContent } from "@/lib/site";
import { BoardSection } from "@/components/BoardSection";
import { PurposesSection } from "@/components/PurposesSection";

export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-24 bg-cream py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-3xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ocean-900 sm:text-4xl">
            {aboutContent.title}
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-ocean-700">
            {aboutContent.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <BoardSection />

        <PurposesSection />
      </div>
    </section>
  );
}
