import { NextRequest, NextResponse } from "next/server";
import { filterUpstreamCookies } from "@/lib/admin/mail-cookies";

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
  next = next.replace(/(href=["'])\?(["'&])/g, `$1${PROXY_PREFIX}?$2`);
  next = next.replace(/(action=["'])\?(["'&])/g, `$1${PROXY_PREFIX}?$2`);
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

/**
 * Roundcube toolbar controls (Mark, More, reply/forward carets, etc.) use
 * href="#" / href="#menu-id". With <base href="/admin/mail/"> the browser
 * resolves those to /admin/mail/#…, drops ?_task=…, and fully reloads the
 * iframe. Keep the base tag for relative assets; block hash-only navigation.
 */
const HASH_LINK_NAV_GUARD = `<script>(function(){document.addEventListener("click",function(e){var t=e.target;if(!t||!t.closest)return;var a=t.closest("a[href]");if(!a)return;var h=a.getAttribute("href");if(h&&h.charAt(0)==="#")e.preventDefault();},true);})();</script>`;

/**
 * Relative query links (href="?…") resolve under <base href="/admin/mail/"> to
 * /admin/mail/?… and Next.js 308-redirects to /admin/mail?… — a full iframe
 * flash. Rewrite to the slashless proxy path before navigation.
 */
const QUERY_LINK_NAV_GUARD = `<script>(function(){var P="/admin/mail";function fix(u){return u.replace(/\\/admin\\/mail\\/\\?/g,P+"?");}document.addEventListener("click",function(e){var t=e.target;if(!t||!t.closest)return;var a=t.closest("a[href]");if(!a)return;var h=a.getAttribute("href");if(!h||h.charAt(0)==="#")return;if(h.charAt(0)==="?"||h.indexOf("./?")===0){e.preventDefault();window.location.assign(P+h.replace(/^\\.\\/?/,""));return;}if(h.indexOf(P+"/?")>=0){e.preventDefault();window.location.assign(fix(h));}},true);document.addEventListener("submit",function(e){var f=e.target;if(!f||!f.getAttribute)return;var act=f.getAttribute("action");if(!act||act.charAt(0)!=="?")return;e.preventDefault();f.action=P+act;f.submit();},true);})();</script>`;

/**
 * Hover's logged-in Roundcube chrome leaves #header empty in the iframe
 * (no logo/user strip). Hide it via CSS so Roundcube JS still finds the node.
 */
const HIDE_BLANK_HEADER = `<style id="ccvaa-hide-blank-header">#header{display:none!important}</style>`;

/**
 * Report mailbox login state to the parent /admin page (same-origin iframe).
 * Fail closed in the parent if messages stop; parent also polls /api/admin/session.
 */
const AUTH_BRIDGE = `<script>(function(){var O=window.location.origin,S="ccvaa-admin-mail",last=null;function loggedIn(){try{if(window.rcmail&&rcmail.env){var t=rcmail.env.task;if(t&&t!=="login")return true;if(t==="login")return false;}}catch(e){}if(document.querySelector("#login-form,form[name=login],#login"))return false;if(document.querySelector("#mainscreen,#mailboxlist,#layout"))return true;return false;}function report(){var auth=loggedIn();if(last===auth)return;last=auth;try{parent.postMessage({source:S,authenticated:auth},O);}catch(e){}}report();document.addEventListener("DOMContentLoaded",report);window.addEventListener("load",report);setInterval(report,2000);})();</script>`;

const HTML_HEAD_INJECT = `${HIDE_BLANK_HEADER}${HASH_LINK_NAV_GUARD}${QUERY_LINK_NAV_GUARD}${AUTH_BRIDGE}`;

function injectBaseTag(html: string) {
  const baseTag = `<base href="${PROXY_PREFIX}/">`;
  // Drop any upstream <base> so we inject a single controlled pair.
  const next = html.replace(/<base\s[^>]*>/i, "");
  if (!/<head[^>]*>/i.test(next)) {
    return `${baseTag}${HTML_HEAD_INJECT}${next}`;
  }
  return next.replace(
    /<head([^>]*)>/i,
    `<head$1>${baseTag}${HTML_HEAD_INJECT}`,
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
