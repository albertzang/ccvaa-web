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
        "group flex flex-col gap-1",
        align === "center" ? "items-center text-center" : "items-start",
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
