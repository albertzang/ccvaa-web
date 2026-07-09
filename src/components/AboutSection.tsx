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
                className="flex overflow-hidden rounded-2xl border border-ocean-100 bg-white shadow-sm"
              >
                <div
                  className="flex w-14 shrink-0 items-center justify-center border-r border-ocean-100 bg-ocean-100 sm:w-16"
                  aria-hidden="true"
                >
                  <span className="font-display text-xl font-semibold text-ocean-700 sm:text-2xl">
                    {index + 1}
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-center px-5 py-5 sm:px-6 sm:py-6">
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
