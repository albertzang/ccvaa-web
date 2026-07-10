import { aboutContent } from "@/lib/site";

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

        <div className="mt-16">
          <h3 className="font-display text-xl font-semibold text-ocean-900 sm:text-2xl">
            {aboutContent.purposesHeading}
          </h3>

          <ol className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {aboutContent.purposes.map((purpose, index) => (
              <li
                key={purpose.title}
                className="overflow-hidden rounded-2xl border border-ocean-100 bg-white shadow-sm"
              >
                <h4 className="bg-ocean-100 px-4 py-2 font-display text-base font-semibold lining-nums tabular-nums text-ocean-700 select-none sm:px-4 sm:py-2.5">
                  {index + 1}. {purpose.title}
                </h4>
                <p className="px-4 py-4 text-sm leading-relaxed text-ocean-600 sm:px-4 sm:py-4">
                  {purpose.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
