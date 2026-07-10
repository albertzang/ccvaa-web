export const ADMIN_OTP_LENGTH = 6;
export const ADMIN_OTP_TTL_MS = 10 * 60 * 1000;
export const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;
export const ADMIN_SESSION_COOKIE = "ccvaa_admin_session";

/** OTP request: 1 per minute, 5 per hour per IP */
export const OTP_REQUEST_COOLDOWN_MS = 60 * 1000;
export const OTP_REQUEST_HOUR_LIMIT = 5;
export const OTP_REQUEST_HOUR_WINDOW_MS = 60 * 60 * 1000;

/** OTP verify: 5 attempts per challenge, then lockout */
export const OTP_VERIFY_MAX_ATTEMPTS = 5;
export const OTP_VERIFY_IP_LIMIT = 20;
export const OTP_VERIFY_IP_WINDOW_MS = 15 * 60 * 1000;

export const ADMIN_MAIL_URL = "https://mail.hover.com";
/** Same-origin proxy so Hover webmail can render inside the admin iframe */
export const ADMIN_MAIL_EMBED_PATH = "/admin/mail";

export const adminNavItems = [
  { id: "members", label: "Members", href: "#members" },
  { id: "financial", label: "Financial", href: "#financial" },
  { id: "events", label: "Events", href: "#events" },
] as const;
