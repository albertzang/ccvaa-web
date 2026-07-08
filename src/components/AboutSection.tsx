import { aboutContent } from "@/lib/site";

export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-20 bg-cream py-20 sm:py-28">
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

          <ol className="mt-8 space-y-6">
            {aboutContent.purposes.map((purpose, index) => (
              <li
                key={purpose.title}
                className="flex gap-5 rounded-2xl border border-ocean-100 bg-white p-6 shadow-sm"
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ocean-900 font-display text-sm font-semibold text-white"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <div>
                  <h4 className="font-display text-lg font-semibold text-ocean-900">
                    {purpose.title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-ocean-600">
                    {purpose.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
