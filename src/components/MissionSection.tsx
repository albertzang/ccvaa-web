import { missionContent } from "@/lib/site";

export function MissionSection() {
  return (
    <section id="mission" className="scroll-mt-20 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ocean-900 sm:text-4xl">
            {missionContent.title}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ocean-700">
            {missionContent.statement}
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          {missionContent.values.map((value) => (
            <div
              key={value.title}
              className="flex gap-4 rounded-2xl bg-ocean-50 p-6"
            >
              <div
                className="mt-1 h-2 w-2 shrink-0 rounded-full bg-coral"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-display text-lg font-semibold text-ocean-900">
                  {value.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ocean-600">
                  {value.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
