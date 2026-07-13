import { NextRequest, NextResponse } from "next/server";
import { filterUpstreamCookies } from "@/lib/admin/mail-cookies";

const UPSTREAM_ORIGIN = "https://mail.hover.com";
const PROXY_PREFIX = "/admin/mail";
const HOVER_HELP_URL = "https://mail.hover.com/help/en_US/help.html";

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
  // Keep Hover help docs on upstream origin (CEO: new tab, not proxied).
  const helpMarker = "@@CCVAA_HOVER_HELP@@";
  next = next.replace(/https?:\/\/mail\.hover\.com\/help\/[^"'\s)>]+/gi, helpMarker);
  next = next.replace(/https?:\/\/mail\.hover\.com(?::\d+)?/gi, PROXY_PREFIX);
  next = next.replace(
    /https?:\/\/mail\.hostedemail\.com(?::\d+)?/gi,
    PROXY_PREFIX,
  );
  next = next.replaceAll(helpMarker, HOVER_HELP_URL);

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
  next = rewriteBreakoutTargets(next);
  next = rewriteHelpLinks(next);
  return next;
}

/** Task/menu links must not break out of the iframe via _top / _parent. */
function rewriteBreakoutTargets(input: string) {
  let next = input;
  next = next.replace(/\btarget\s*=\s*["']_top["']/gi, 'target="_self"');
  next = next.replace(/\btarget\s*=\s*["']_parent["']/gi, 'target="_self"');
  // Root href="/" on anchors (not protocol-relative //…).
  next = next.replace(
    /(<a\b[^>]*\bhref=["'])\/(["'])/gi,
    `$1${PROXY_PREFIX}$2`,
  );
  return next;
}

/** Help opens upstream in a new tab — same as native Hover webmail. */
function rewriteHelpLinks(input: string) {
  let next = input;
  next = next.replace(
    /(<a\b[^>]*\bhref=["'])(?:\/admin\/mail)?\/?help\/[^"']*(["'])/gi,
    `$1${HOVER_HELP_URL}$2`,
  );
  next = next.replace(
    /(<a\b[^>]*\bhref=["'])https?:\/\/mail\.hover\.com\/help\/[^"']*(["'])/gi,
    `$1${HOVER_HELP_URL}$2`,
  );
  next = next.replace(
    /(<a\b[^>]*\bhref=["'])(?:\/admin\/mail)\?_task=help[^"']*(["'])/gi,
    `$1${HOVER_HELP_URL}$2`,
  );
  const helpHref = HOVER_HELP_URL.replace(/\//g, "\\/");
  next = next.replace(
    new RegExp(
      `(<a\\b[^>]*\\bhref=["']${helpHref}["'])(?![^>]*\\btarget=)([^>]*>)`,
      "gi",
    ),
    `$1 target="_blank" rel="noopener noreferrer"$2`,
  );
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
 * Roundcube adds href="?…" links dynamically. Under <base href="/admin/mail/"> they
 * resolve to /admin/mail/?… (Next 308 → flash). Fix href/action attributes only —
 * do not intercept clicks; Roundcube handles folder/message nav via AJAX.
 */
const PASSIVE_QUERY_LINK_FIXER = `<script>(function(){var P="/admin/mail",H="${HOVER_HELP_URL}";function fixHelp(a){var h=a.getAttribute("href");if(!h)return;if(/\\/help\\/|help\\.html|_task=help/.test(h)){a.setAttribute("href",H);a.setAttribute("target","_blank");a.setAttribute("rel","noopener noreferrer");}}function fixTarget(a){if(a.getAttribute("href")===H)return;if(/\\/help\\/|help\\.html|_task=help/.test(a.getAttribute("href")||""))return;var t=a.getAttribute("target");if(t==="_top"||t==="_parent")a.setAttribute("target","_self");}function fixHref(a){var h=a.getAttribute("href");if(!h||h.charAt(0)==="#")return;fixHelp(a);if(a.getAttribute("href")===H)return;fixTarget(a);h=a.getAttribute("href");if(h.charAt(0)==="?"||h.indexOf("./?")===0)a.setAttribute("href",P+h.replace(/^\\.\\/?/,""));else if(h.indexOf(P+"/?")>=0)a.setAttribute("href",h.replace(/\\/admin\\/mail\\/\\?/g,P+"?"));else if((h==="/"||h.indexOf("/?")===0)&&h.indexOf(P)!==0)a.setAttribute("href",P+h.slice(1));else if(h.charAt(0)==="/"&&h.indexOf(P)!==0&&h.indexOf("//")!==0&&/_task=/.test(h))a.setAttribute("href",P+h.replace(/^\\//,""));}function fixForm(f){var a=f.getAttribute("action");if(a&&a.charAt(0)==="?")f.setAttribute("action",P+a);else if(a&&(a==="/"||a.indexOf("/?")===0)&&a.indexOf(P)!==0)f.setAttribute("action",P+a.slice(1));var t=f.getAttribute("target");if(t==="_top"||t==="_parent")f.setAttribute("target","_self");}function scan(r){if(!r.querySelectorAll)return;r.querySelectorAll("a[href]").forEach(fixHref);r.querySelectorAll("form[action]").forEach(fixForm);}scan(document);new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType!==1)return;scan(n);if(n.matches){if(n.matches("a[href]"))fixHref(n);if(n.matches("form[action]"))fixForm(n);}});});}).observe(document.documentElement,{childList:true,subtree:true});})();</script>`;

/**
 * Task-bar links (Mail / Files / Calendar / Contacts) sometimes target _top or
 * site-root /?_task=… — redirect those navigations to stay inside the iframe.
 */
const TASK_NAV_GUARD = `<script>(function(){var P="/admin/mail",H="${HOVER_HELP_URL}";function rw(h){if(!h||h===H||/\\/help\\//.test(h)||/_task=help/.test(h))return h;if(h==="/"||h==="")return P;if(h.charAt(0)==="?"||h.indexOf("./?")===0)return P+h.replace(/^\\.\\/?/,"");if(h.indexOf("/?")===0)return P+h.slice(1);if(h.charAt(0)==="/"&&h.indexOf(P)!==0&&h.indexOf("//")!==0&&/_task=/.test(h))return P+h.replace(/^\\//,"");return h;}function taskLink(a){if(!a)return false;var h=a.getAttribute("href")||"";if(!h||h.charAt(0)==="#"||h.indexOf("javascript:")===0)return false;if(/\\/help\\//.test(h)||/_task=help/.test(h))return false;return!!(a.closest("#taskmenu,#layout-menu")||/_task=/.test(h));}document.addEventListener("click",function(e){var el=e.target;if(!el||!el.closest)return;var a=el.closest("a[href]");if(!a||!taskLink(a))return;var h=a.getAttribute("href"),t=a.getAttribute("target"),n=rw(h),top=t==="_top"||t==="_parent";if(!top&&n===h)return;e.preventDefault();e.stopPropagation();if(top)a.setAttribute("target","_self");if(n!==h)a.setAttribute("href",n);window.location.assign(a.getAttribute("href"));},true);})();</script>`;

/**
 * Roundcube occasionally assigns parent/top.location — keep that navigation in
 * the iframe so the /admin shell does not reload.
 */
const FRAME_NAV_GUARD = `<script>(function(){var P="/admin/mail";function rw(u){if(typeof u!=="string")return u;if(u==="/"||u==="")return P;if(u.indexOf("/?")===0)return P+u.slice(1);if(u.charAt(0)==="/"&&u.indexOf(P)!==0&&u.indexOf("//")!==0&&/_task=/.test(u))return P+u.replace(/^\\//,"");return u;}function guard(loc,redirect){try{var d=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(loc),"href");if(!d||!d.set||loc.__ccvaaG)return;Object.defineProperty(loc,"href",{configurable:true,enumerable:true,get:d.get,set:function(v){if(redirect&&window.parent!==window)window.location.href=rw(v);else d.set.call(this,rw(v));}});loc.__ccvaaG=1;}catch(x){}}function boot(){guard(window.location,false);if(window.parent!==window)guard(window.parent.location,true);if(window.top!==window&&window.top!==window.parent)guard(window.top.location,true);}boot();document.addEventListener("DOMContentLoaded",boot);})();</script>`;

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

const HTML_HEAD_INJECT = `${HIDE_BLANK_HEADER}${HASH_LINK_NAV_GUARD}${FRAME_NAV_GUARD}${PASSIVE_QUERY_LINK_FIXER}${TASK_NAV_GUARD}${AUTH_BRIDGE}`;

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
