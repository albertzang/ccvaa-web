import { purposesContent } from "@/lib/site";

export function PurposesSection() {
  return (
    <section id="purposes" className="scroll-mt-20 bg-cream py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-3xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ocean-900 sm:text-4xl">
            {purposesContent.title}
          </h2>
          <p className="mt-6 text-base leading-relaxed text-ocean-700">
            {purposesContent.introduction}
          </p>
        </div>

        <ol className="mt-12 space-y-6">
          {purposesContent.purposes.map((purpose, index) => (
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
                <h3 className="font-display text-lg font-semibold text-ocean-900">
                  {purpose.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ocean-600">
                  {purpose.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
