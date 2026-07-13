"use client";

import { useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleItems = adminSidebarItems.filter(
    (item) => !("requiresAuth" in item && item.requiresAuth) || authenticated,
  );

  const activeLabel =
    visibleItems.find((item) => item.id === activePanel)?.label ?? "Menu";

  function selectPanel(panel: AdminPanelId) {
    onPanelChange(panel);
    setMenuOpen(false);
  }

  function handleLogout() {
    setMenuOpen(false);
    onLogout();
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-ocean-800 bg-ocean-950 text-cream md:h-auto md:w-56 md:border-b-0 md:border-r">
      <div className="flex items-center gap-3 border-b border-ocean-800 px-3 py-3 md:block md:py-5">
        <div className="min-w-0 flex-1 md:flex-none">
          <BrandMark
            priority
            align="center"
            subtitleClassName="text-ocean-200"
          />
        </div>

        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-ocean-700 bg-ocean-900 px-3 py-2 text-sm font-medium text-cream md:hidden"
          aria-expanded={menuOpen}
          aria-controls="admin-nav-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="max-w-[7rem] truncate">{activeLabel}</span>
          <span aria-hidden className="text-ocean-300">
            {menuOpen ? "▴" : "▾"}
          </span>
        </button>
      </div>

      <nav
        id="admin-nav-menu"
        aria-label="Admin navigation"
        className={`${
          menuOpen ? "flex" : "hidden"
        } flex-col px-3 py-3 md:flex md:flex-1 md:py-4`}
      >
        <ul className="flex flex-col space-y-1">
          {visibleItems.map((item) => {
            const isActive = activePanel === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => selectPanel(item.id)}
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

        {authenticated && (
          <div className="mt-3 border-t border-ocean-800 pt-3 md:hidden">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ocean-300 transition-colors hover:bg-ocean-900 hover:text-cream"
            >
              Log out
            </button>
          </div>
        )}
      </nav>

      {authenticated && (
        <div className="mt-auto hidden border-t border-ocean-800 px-3 py-4 md:block">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ocean-300 transition-colors hover:bg-ocean-900 hover:text-cream"
          >
            Log out
          </button>
        </div>
      )}
    </aside>
  );
}
