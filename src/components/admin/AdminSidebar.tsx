"use client";

import { BrandMark } from "@/components/BrandMark";
import { adminSidebarItems, type AdminPanelId } from "@/lib/admin/constants";

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
    <aside className="flex w-full shrink-0 flex-col border-b border-ocean-800 bg-ocean-950 text-cream md:h-auto md:w-56 md:border-b-0 md:border-r">
      <div className="border-b border-ocean-800 px-3 py-4 md:py-5">
        <BrandMark
          priority
          align="center"
          subtitleClassName="text-ocean-200"
        />
      </div>

      <nav
        aria-label="Admin navigation"
        className="flex flex-col px-3 py-3 md:flex-1 md:py-4"
      >
        <ul className="flex gap-1 overflow-x-auto md:flex-col md:space-y-1 md:overflow-visible">
          {visibleItems.map((item) => {
            const isActive = activePanel === item.id;
            return (
              <li key={item.id} className="shrink-0 md:w-full">
                <button
                  type="button"
                  onClick={() => onPanelChange(item.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium whitespace-nowrap transition-colors ${
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
          {authenticated && (
            <li className="shrink-0 md:hidden">
              <button
                type="button"
                onClick={onLogout}
                className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium whitespace-nowrap text-ocean-300 transition-colors hover:bg-ocean-900 hover:text-cream"
              >
                Log out
              </button>
            </li>
          )}
        </ul>
      </nav>

      {authenticated && (
        <div className="hidden border-t border-ocean-800 px-3 py-4 md:block">
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
