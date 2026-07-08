import Link from "next/link";
import { navigation, siteConfig } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-ocean-100/80 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex flex-col">
          <span className="font-display text-lg font-semibold tracking-tight text-ocean-900 transition-colors group-hover:text-ocean-700">
            {siteConfig.shortName}
          </span>
          <span className="hidden text-xs text-ocean-600 sm:block">
            Visual Arts Association
          </span>
        </Link>

        <nav aria-label="Main navigation">
          <ul className="flex items-center gap-1 sm:gap-2">
            {navigation.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-full px-3 py-2 text-sm font-medium text-ocean-800 transition-colors hover:bg-ocean-50 hover:text-ocean-900 sm:px-4"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
