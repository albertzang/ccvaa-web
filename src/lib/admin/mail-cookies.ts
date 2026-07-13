/** Cookies that belong to Roundcube / Hover webmail. */
export const UPSTREAM_COOKIE_ALLOWLIST = [
  /^roundcube_/i,
  /^bi_wm/i,
  /^HMAC_/i,
  /^_ssid/i,
];

export function isUpstreamCookieName(name: string) {
  return UPSTREAM_COOKIE_ALLOWLIST.some((pattern) => pattern.test(name));
}

/** Parse Cookie header into name → value map. */
export function parseCookieHeader(cookieHeader: string | null) {
  const map = new Map<string, string>();
  if (!cookieHeader) return map;
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const name = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (name) map.set(name, value);
  }
  return map;
}

/** Forward only Hover/Roundcube cookies upstream (never our app cookies). */
export function filterUpstreamCookies(cookieHeader: string | null) {
  if (!cookieHeader) return "";
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => {
      const name = part.split("=")[0]?.trim() ?? "";
      return Boolean(name) && isUpstreamCookieName(name);
    })
    .join("; ");
}

/** True if a Roundcube session id cookie is present (not proof it is valid). */
export function hasRoundcubeSessionCookie(cookieHeader: string | null) {
  const cookies = parseCookieHeader(cookieHeader);
  for (const name of cookies.keys()) {
    if (/^roundcube_sessid$/i.test(name)) return true;
  }
  return false;
}

/** Set-Cookie headers that clear every upstream mail cookie on this host. */
export function clearUpstreamCookieHeaders(
  cookieHeader: string | null,
  requestIsHttps: boolean,
) {
  const cookies = parseCookieHeader(cookieHeader);
  const headers: string[] = [];
  for (const name of cookies.keys()) {
    if (!isUpstreamCookieName(name)) continue;
    headers.push(
      [
        `${name}=`,
        "Path=/",
        "Max-Age=0",
        "SameSite=Lax",
        "HttpOnly",
        requestIsHttps ? "Secure" : "",
      ]
        .filter(Boolean)
        .join("; "),
    );
  }
  return headers;
}
