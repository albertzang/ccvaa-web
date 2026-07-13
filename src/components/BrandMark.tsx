import Link from "next/link";
import { CoastToCoastLogo } from "@/components/CoastToCoastLogo";
import { siteConfig } from "@/lib/site";

/** Shared logo size — public header and admin sidebar must stay in sync. */
export const BRAND_LOGO_CLASSNAME = "h-7 w-auto object-contain sm:h-8";

type BrandMarkProps = {
  priority?: boolean;
  /** Use on-light wordmark (scrolled public header). Default: on-dark. */
  onLight?: boolean;
  subtitleClassName?: string;
  className?: string;
  align?: "start" | "center";
};

/**
 * Logo + “Visual Arts Association” block used on the public site and admin console.
 * Logo size is shared via BRAND_LOGO_CLASSNAME so both surfaces stay in sync.
 * `align="center"` centers the whole group in its parent; logo+subtitle stay
 * start-aligned to each other (same as the public header).
 */
export function BrandMark({
  priority = false,
  onLight = false,
  subtitleClassName = "text-ocean-600",
  className = "",
  align = "start",
}: BrandMarkProps) {
  return (
    <Link
      href="/"
      className={[
        "group flex w-fit flex-col items-start gap-1",
        align === "center" ? "mx-auto" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <CoastToCoastLogo
        priority={priority}
        onLight={onLight}
        className={`${BRAND_LOGO_CLASSNAME} transition-opacity group-hover:opacity-90`}
      />
      <span className={["text-xs", subtitleClassName].filter(Boolean).join(" ")}>
        {siteConfig.navSubtitle}
      </span>
    </Link>
  );
}
