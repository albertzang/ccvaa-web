export const ADMIN_MAIL_URL = "https://mail.hover.com";
/** Same-origin proxy so Hover webmail can render inside the admin iframe */
export const ADMIN_MAIL_EMBED_PATH = "/admin/mail";

/** postMessage source from injected mail iframe bridge */
export const ADMIN_MAIL_AUTH_MESSAGE_SOURCE = "ccvaa-admin-mail";

/** Parent MailSection: preload next Roundcube task HTML, then swap iframes */
export const ADMIN_MAIL_PRELOAD_TASK_ACTION = "preload-task";

export type AdminPanelId = "mail" | "members" | "financial" | "events";

export const adminSidebarItems = [
  { id: "mail" as const, label: "Webmail" },
  { id: "members" as const, label: "Members", requiresAuth: true },
  { id: "events" as const, label: "Events", requiresAuth: true },
  { id: "financial" as const, label: "Financial", requiresAuth: true },
] as const;
