import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";

const UPSTREAM_ORIGIN = "https://mail.hover.com";
const PROXY_PREFIX = "/admin/mail";

const ROUNDCUBE_ROOTS = [
  "skins",
  "program",
  "plugins",
  "brands",
  "static",
  "bin",
] as const;

/** Cookies that belong to Roundcube / Hover webmail — never forward our admin cookie. */
const UPSTREAM_COOKIE_ALLOWLIST = [
  /^roundcube_/i,
  /^bi_wm/i,
  /^HMAC_/i,
  /^_ssid/i,
];

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params;
  const upstreamPath = path.length > 0 ? `/${path.join("/")}` : "/";
  const upstreamUrl = new URL(
    `${upstreamPath}${request.nextUrl.search}`,
    UPSTREAM_ORIGIN,
  );
  const requestIsHttps = request.nextUrl.protocol === "https:";

  const headers = new Headers();
  // Roundcube AJAX (inbox refresh / keep-alive) sends CSRF in X-Roundcube-Request
  // only — dropping it makes Hover return HTTP 403 on refresh.
  for (const name of [
    "accept",
    "accept-language",
    "content-type",
    "user-agent",
    "x-requested-with",
    "x-roundcube-request",
  ]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const upstreamCookie = filterUpstreamCookies(request.headers.get("cookie"));
  if (upstreamCookie) headers.set("cookie", upstreamCookie);

  headers.set("origin", UPSTREAM_ORIGIN);
  headers.set("referer", `${UPSTREAM_ORIGIN}/`);

  const init: RequestInit = {
    method: request.method,
    headers,
    // Let the browser follow redirects so Set-Cookie sticks (Chrome is strict).
    redirect: "manual",
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = Buffer.from(await request.arrayBuffer());
  }

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, init);
  } catch {
    return NextResponse.json(
      { error: "Unable to reach Hover webmail." },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (
      lower === "x-frame-options" ||
      lower === "content-security-policy" ||
      lower === "content-security-policy-report-only" ||
      lower === "clear-site-data" ||
      lower === "content-encoding" ||
      lower === "content-length" ||
      lower === "transfer-encoding" ||
      lower === "set-cookie"
    ) {
      return;
    }
    if (lower === "location") {
      responseHeaders.set("location", rewriteLocation(value));
      return;
    }
    responseHeaders.set(key, value);
  });

  const cookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : [];
  for (const cookie of cookies) {
    responseHeaders.append(
      "set-cookie",
      rewriteCookie(cookie, requestIsHttps),
    );
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  const shouldRewrite =
    contentType.includes("text/html") ||
    contentType.includes("text/css") ||
    contentType.includes("application/json") ||
    contentType.includes("javascript") ||
    contentType.includes("ecmascript");

  if (shouldRewrite) {
    let body = await upstream.text();
    body = rewritePayload(body, requestIsHttps);
    if (contentType.includes("text/html")) {
      body = injectBaseTag(body);
      responseHeaders.set("content-type", "text/html; charset=utf-8");
      responseHeaders.set("cache-control", "no-store, no-cache, must-revalidate");
      responseHeaders.set("pragma", "no-cache");
    }
    return new NextResponse(body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

function filterUpstreamCookies(cookieHeader: string | null) {
  if (!cookieHeader) return "";
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => {
      const name = part.split("=")[0]?.trim() ?? "";
      if (!name || name === ADMIN_SESSION_COOKIE) return false;
      return UPSTREAM_COOKIE_ALLOWLIST.some((pattern) => pattern.test(name));
    })
    .join("; ");
}

function rewriteCookie(cookie: string, requestIsHttps: boolean) {
  const nameValue = cookie.split(";", 1)[0]?.trim() ?? cookie;
  const attrs = [
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    requestIsHttps ? "Secure" : "",
  ].filter(Boolean);

  // Preserve Max-Age / Expires when present so sessions still expire normally.
  const maxAge = cookie.match(/;\s*Max-Age=([^;]*)/i)?.[1]?.trim();
  const expires = cookie.match(/;\s*Expires=([^;]*)/i)?.[1]?.trim();
  if (maxAge) attrs.push(`Max-Age=${maxAge}`);
  if (expires) attrs.push(`Expires=${expires}`);

  return `${nameValue}; ${attrs.join("; ")}`;
}

function rewriteLocation(location: string) {
  try {
    const url = new URL(location, UPSTREAM_ORIGIN);
    if (
      url.hostname === "mail.hover.com" ||
      url.hostname === "mail.hostedemail.com"
    ) {
      const path = url.pathname === "/" ? "" : url.pathname;
      return `${PROXY_PREFIX}${path}${url.search}${url.hash}`;
    }
  } catch {
    // keep original
  }
  if (location.startsWith("/?")) {
    return `${PROXY_PREFIX}${location.slice(1)}`;
  }
  if (location.startsWith("/")) {
    return `${PROXY_PREFIX}${location}`;
  }
  return location;
}

function rewritePayload(input: string, requestIsHttps: boolean) {
  let next = input;
  next = next.replace(/https?:\/\/mail\.hover\.com(?::\d+)?/gi, PROXY_PREFIX);
  next = next.replace(
    /https?:\/\/mail\.hostedemail\.com(?::\d+)?/gi,
    PROXY_PREFIX,
  );

  for (const root of ROUNDCUBE_ROOTS) {
    const pattern = new RegExp(`([=["'(])/(${root})(/|["'?\\s)]|$)`, "g");
    next = next.replace(pattern, `$1${PROXY_PREFIX}/$2$3`);
  }

  // Prefer /admin/mail?... (no trailing slash) so Next does not 308 AJAX POSTs.
  next = next.replace(/(=["'])\/\?/g, `$1${PROXY_PREFIX}?`);
  next = next.replace(/([:"'])\/\?/g, `$1${PROXY_PREFIX}?`);
  next = next.replace(/(action=["'])\/(["'?])/g, `$1${PROXY_PREFIX}$2`);
  next = next.replaceAll('"comm_path":"/?', `"comm_path":"${PROXY_PREFIX}?`);
  next = next.replaceAll("'comm_path':'/?", `'comm_path':'${PROXY_PREFIX}?`);
  next = next.replaceAll('"comm_path":"/', `"comm_path":"${PROXY_PREFIX}/`);
  next = next.replaceAll("'comm_path':'/", `'comm_path':'${PROXY_PREFIX}/`);

  // Keep Roundcube's cookie flags aligned with what we actually set in the browser.
  next = next.replace(
    /"cookie_secure"\s*:\s*(true|false)/gi,
    `"cookie_secure":${requestIsHttps ? "true" : "false"}`,
  );
  next = next.replace(/"cookie_path"\s*:\s*"[^"]*"/gi, `"cookie_path":"/"`);
  next = next.replace(/"cookie_domain"\s*:\s*"[^"]*"/gi, `"cookie_domain":""`);

  next = next.replace(
    /url\(\s*(['"]?)\/(skins|program|plugins|brands|static|bin)\//gi,
    `url($1${PROXY_PREFIX}/$2/`,
  );

  // Collapse /admin/mail/?… → /admin/mail?… (absolute URL rewrite leaves a slash).
  next = next.replaceAll(`${PROXY_PREFIX}/?`, `${PROXY_PREFIX}?`);
  next = next.replaceAll(`${PROXY_PREFIX}${PROXY_PREFIX}`, PROXY_PREFIX);
  return next;
}

function injectBaseTag(html: string) {
  if (/<base\s/i.test(html)) {
    return html.replace(/<base\s[^>]*>/i, `<base href="${PROXY_PREFIX}/">`);
  }
  return html.replace(
    /<head([^>]*)>/i,
    `<head$1><base href="${PROXY_PREFIX}/">`,
  );
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function HEAD(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}
