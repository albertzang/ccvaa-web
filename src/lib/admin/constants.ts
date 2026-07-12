export const ADMIN_MAIL_URL = "https://mail.hover.com";
/** Same-origin proxy so Hover webmail can render inside the admin iframe */
export const ADMIN_MAIL_EMBED_PATH = "/admin/mail";

/** postMessage source from injected mail iframe bridge */
export const ADMIN_MAIL_AUTH_MESSAGE_SOURCE = "ccvaa-admin-mail";

export type AdminPanelId = "mail" | "members" | "financial" | "events";

export const adminSidebarItems = [
  { id: "mail" as const, label: "Mail" },
  { id: "members" as const, label: "Members", requiresAuth: true },
  { id: "financial" as const, label: "Financial", requiresAuth: true },
  { id: "events" as const, label: "Events", requiresAuth: true },
] as const;
