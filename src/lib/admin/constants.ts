export const ADMIN_MAIL_URL = "https://mail.hover.com";
/** Same-origin proxy so Hover webmail can render inside the admin iframe */
export const ADMIN_MAIL_EMBED_PATH = "/admin/mail";

/** postMessage source from injected mail iframe bridge */
export const ADMIN_MAIL_AUTH_MESSAGE_SOURCE = "ccvaa-admin-mail";

export const adminNavItems = [
  { id: "members", label: "Members", href: "#members" },
  { id: "financial", label: "Financial", href: "#financial" },
  { id: "events", label: "Events", href: "#events" },
] as const;
