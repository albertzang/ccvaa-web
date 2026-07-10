"use client";

import Link from "next/link";
import { CoastToCoastLogo } from "@/components/CoastToCoastLogo";
import { adminNavItems } from "@/lib/admin/constants";
import { siteConfig } from "@/lib/site";

type AdminHeaderProps = {
  authenticated: boolean;
  onLogout: () => void;
};

export function AdminHeader({ authenticated, onLogout }: AdminHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ocean-100/80 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="group flex flex-col gap-1">
          <CoastToCoastLogo
            priority
            onLight
            className="h-7 w-auto transition-opacity group-hover:opacity-90 sm:h-8"
          />
          <span className="text-xs text-ocean-600">
            {siteConfig.navSubtitle}
            <span className="text-ocean-400"> · Admin</span>
          </span>
        </Link>

        <nav aria-label="Admin navigation">
          <ul className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
            <li>
              <a
                href="#mail"
                className="rounded-full px-3 py-2 text-sm font-medium text-ocean-800 transition-colors hover:bg-ocean-50 hover:text-ocean-900 sm:px-4"
              >
                Mail
              </a>
            </li>
            {!authenticated && (
              <li>
                <a
                  href="#login"
                  className="rounded-full px-3 py-2 text-sm font-medium text-ocean-800 transition-colors hover:bg-ocean-50 hover:text-ocean-900 sm:px-4"
                >
                  Login
                </a>
              </li>
            )}
            {authenticated &&
              adminNavItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className="rounded-full px-3 py-2 text-sm font-medium text-ocean-800 transition-colors hover:bg-ocean-50 hover:text-ocean-900 sm:px-4"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            {authenticated && (
              <li>
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-full px-3 py-2 text-sm font-medium text-ocean-600 transition-colors hover:bg-ocean-50 hover:text-ocean-900 sm:px-4"
                >
                  Log out
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
