"use client";

import Link from "next/link";
import { CoastToCoastLogo } from "@/components/CoastToCoastLogo";
import { adminSidebarItems, type AdminPanelId } from "@/lib/admin/constants";
import { siteConfig } from "@/lib/site";

type AdminSidebarProps = {
  activePanel: AdminPanelId;
  authenticated: boolean;
  onPanelChange: (panel: AdminPanelId) => void;
  onLogout: () => void;
};

export function AdminSidebar({
  activePanel,
  authenticated,
  onPanelChange,
  onLogout,
}: AdminSidebarProps) {
  const visibleItems = adminSidebarItems.filter(
    (item) => !("requiresAuth" in item && item.requiresAuth) || authenticated,
  );

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-ocean-800 bg-ocean-950 text-cream">
      <div className="border-b border-ocean-800 px-3 py-5">
        <Link href="/" className="group flex w-full flex-col items-start gap-1">
          <CoastToCoastLogo
            priority
            className="h-auto w-full object-contain transition-opacity group-hover:opacity-90"
          />
          <span className="text-xs text-ocean-200">{siteConfig.navSubtitle}</span>
        </Link>
      </div>

      <nav aria-label="Admin navigation" className="flex flex-1 flex-col px-3 py-4">
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const isActive = activePanel === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onPanelChange(item.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-ocean-800 text-cream"
                      : "text-ocean-200 hover:bg-ocean-900 hover:text-cream"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {authenticated && (
        <div className="border-t border-ocean-800 px-3 py-4">
          <button
            type="button"
            onClick={onLogout}
            className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ocean-300 transition-colors hover:bg-ocean-900 hover:text-cream"
          >
            Log out
          </button>
        </div>
      )}
    </aside>
  );
}
