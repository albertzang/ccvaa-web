import Image from "next/image";
import { siteConfig } from "@/lib/site";

type CoastToCoastLogoProps = {
  className?: string;
  priority?: boolean;
  onLight?: boolean;
};

export function CoastToCoastLogo({
  className,
  priority = false,
  onLight = false,
}: CoastToCoastLogoProps) {
  const { logo } = siteConfig;

  return (
    <Image
      src={onLight ? logo.srcOnLight : logo.src}
      alt={logo.alt}
      width={logo.width}
      height={logo.height}
      priority={priority}
      unoptimized
      className={className}
    />
  );
}
