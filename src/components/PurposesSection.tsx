"use client";

import { useState } from "react";
import { aboutContent } from "@/lib/site";

function ExpandIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-ocean-400 transition-colors duration-200 group-hover:text-ocean-700"
    >
      <path
        d="M3.5 9h11"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      {!expanded && (
        <path
          d="M9 3.5v11"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function PurposesSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-16">
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        aria-label={expanded ? "Hide purposes" : "Show purposes"}
        className="group flex w-full items-center justify-between gap-6 border-b border-ocean-100 pb-3 text-left transition-colors hover:border-ocean-200"
      >
        <span className="font-display text-xl font-semibold text-ocean-900 transition-colors group-hover:text-ocean-700 sm:text-2xl">
          {aboutContent.purposesHeading}
        </span>
        <ExpandIcon expanded={expanded} />
      </button>

      <ol className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {aboutContent.purposes.map((purpose, index) => (
          <li
            key={purpose.title}
            className="overflow-hidden rounded-2xl border border-ocean-100 bg-white shadow-sm"
          >
            <h4 className="bg-ocean-100 px-4 py-2 font-display text-base font-semibold lining-nums tabular-nums text-ocean-700 sm:px-4 sm:py-2.5">
              {index + 1}. {purpose.title}
            </h4>
            {expanded && (
              <p className="border-t border-ocean-100 px-4 py-4 text-sm leading-relaxed text-ocean-600 sm:px-4 sm:py-4">
                {purpose.description}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
