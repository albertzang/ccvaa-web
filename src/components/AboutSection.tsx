import { aboutContent } from "@/lib/site";

export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-20 bg-cream py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ocean-900 sm:text-4xl">
            {aboutContent.title}
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-ocean-700">
            {aboutContent.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {aboutContent.highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-ocean-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <h3 className="font-display text-lg font-semibold text-ocean-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ocean-600">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
