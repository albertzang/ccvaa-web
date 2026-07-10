"use client";

const scaffolds = [
  {
    id: "members",
    title: "Members",
    description:
      "Member directory and roster tools will live here. Scaffold only for this iteration.",
  },
  {
    id: "financial",
    title: "Financial dashboard",
    description:
      "Income, expenses, and reporting overview will live here. Scaffold only for this iteration.",
  },
  {
    id: "events",
    title: "Events & posts",
    description:
      "List and CRUD forms for events and posts will live here. Scaffold only for this iteration.",
  },
] as const;

export function AdminScaffoldSections() {
  return (
    <div className="space-y-16">
      {scaffolds.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="scroll-mt-28"
        >
          <h2 className="border-b border-ocean-100 pb-3 font-display text-xl font-semibold text-ocean-900 sm:text-2xl">
            {section.title}
          </h2>
          <div className="mt-8 rounded-2xl border border-dashed border-ocean-200 bg-white/70 px-6 py-10 text-center shadow-sm">
            <p className="text-sm font-medium uppercase tracking-wider text-ocean-500">
              Coming soon
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ocean-600">
              {section.description}
            </p>
          </div>
        </section>
      ))}
    </div>
  );
}
