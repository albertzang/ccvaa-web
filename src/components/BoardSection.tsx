"use client";

import { useState } from "react";
import { CoastToCoastLogo } from "@/components/CoastToCoastLogo";
import { boardContent } from "@/lib/site";

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

export function BoardSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-16">
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        aria-label={expanded ? "Hide board bios" : "Show board bios"}
        className="group flex w-full items-center justify-between gap-6 border-b border-ocean-100 pb-3 text-left transition-colors hover:border-ocean-200"
      >
        <span className="font-display text-xl font-semibold text-ocean-900 transition-colors group-hover:text-ocean-700 sm:text-2xl">
          {boardContent.title}
        </span>
        <ExpandIcon expanded={expanded} />
      </button>

      <figure className="mt-8 flex justify-center">
        <div
          className="relative flex aspect-[5/3] w-full max-h-72 max-w-[min(100%,calc(18rem*5/3))] flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-ocean-800/40 bg-ocean-950 px-6 shadow-sm sm:max-h-80 sm:max-w-[min(100%,calc(20rem*5/3))]"
          role="img"
          aria-label={boardContent.photoAlt}
        >
          <CoastToCoastLogo className="h-auto w-full max-w-[14rem] sm:max-w-[16rem]" />
          <p className="max-w-xs text-center text-sm leading-relaxed text-ocean-200/90">
            {boardContent.photoPlaceholderNote}
          </p>
        </div>

        <figcaption className="sr-only">{boardContent.photoAlt}</figcaption>
      </figure>

      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        {boardContent.members.map((member) => (
          <li
            key={member.name}
            className="overflow-hidden rounded-2xl border border-ocean-100 bg-white shadow-sm"
          >
            <div className="bg-ocean-100 px-5 py-4 text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-ocean-500">
                {member.role}
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-ocean-800">
                {member.name}
              </p>
            </div>
            {expanded && (
              <div className="border-t border-ocean-100">
                <div
                  className="flex aspect-square flex-col items-center justify-center gap-3 bg-gradient-to-br from-ocean-50 via-white to-ocean-100/60 px-4"
                  role="img"
                  aria-label={member.portraitAlt}
                >
                  <CoastToCoastLogo
                    onLight
                    className="h-auto w-full max-w-[8.5rem]"
                  />
                  <p className="text-center text-xs leading-relaxed text-ocean-500">
                    {boardContent.portraitPlaceholderNote}
                  </p>
                </div>
                <p className="px-5 py-4 text-sm leading-relaxed text-ocean-600">
                  {boardContent.bioPlaceholder}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
