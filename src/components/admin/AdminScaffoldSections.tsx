"use client";

import type { AdminPanelId } from "@/lib/admin/constants";

const scaffolds = [
  {
    id: "members" as const,
    title: "Members",
    description:
      "Member directory and roster tools will live here. Scaffold only for this iteration.",
  },
  {
    id: "financial" as const,
    title: "Financial dashboard",
    description:
      "Income, expenses, and reporting overview will live here. Scaffold only for this iteration.",
  },
  {
    id: "events" as const,
    title: "Events & posts",
    description:
      "List and CRUD forms for events and posts will live here. Scaffold only for this iteration.",
  },
] as const;

type ScaffoldPanelId = Exclude<AdminPanelId, "mail">;

type AdminScaffoldPanelProps = {
  panelId: ScaffoldPanelId;
};

export function AdminScaffoldPanel({ panelId }: AdminScaffoldPanelProps) {
  const section = scaffolds.find((item) => item.id === panelId);
  if (!section) return null;

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
      <h2 className="shrink-0 border-b border-ocean-100 pb-3 font-display text-xl font-semibold text-ocean-900 sm:text-2xl">
        {section.title}
      </h2>
      <div className="mt-8 flex flex-1 items-start justify-center">
        <div className="w-full max-w-2xl rounded-2xl border border-dashed border-ocean-200 bg-white/70 px-6 py-10 text-center shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wider text-ocean-500">
            Coming soon
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ocean-600">
            {section.description}
          </p>
        </div>
      </div>
    </section>
  );
}
