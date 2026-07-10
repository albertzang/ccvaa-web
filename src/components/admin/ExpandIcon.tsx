"use client";

type ExpandIconProps = {
  expanded: boolean;
};

export function ExpandIcon({ expanded }: ExpandIconProps) {
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
