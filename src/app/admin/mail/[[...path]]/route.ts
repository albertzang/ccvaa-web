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
 * Iteration 7: same-origin iframe lets Roundcube set top/parent.location to
 * `/?_task=…`, which unloads the React /admin shell (proxy rewrites root to
 * mail HTML). Capture the real parent first, then make parent/top return the
 * iframe window so breakout assignments only navigate the iframe. AUTH_BRIDGE
 * must postMessage via __ccvaaRealParent (not the redefined parent).
 */
const FRAME_PARENT_ISOLATION = `<script>(function(){
if(window.__ccvaaFrameIsolated)return;
window.__ccvaaFrameIsolated=1;
var realParent=window.parent,realTop=window.top;
window.__ccvaaRealParent=realParent;
window.__ccvaaRealTop=realTop;
try{
  Object.defineProperty(window,"parent",{configurable:!0,enumerable:!0,get:function(){return window;}});
  Object.defineProperty(window,"top",{configurable:!0,enumerable:!0,get:function(){return window;}});
}catch(e){}
})();</script>`;

/**
 * Belt-and-suspenders (Iteration 6+): Calendar/Mail/Files/Contacts use
 *   onclick="return rcmail.command('switch-task', task, this, event)"
 * Steal those clicks + patch rcmail helpers so nav stays in the iframe.
 * Help stays a new-tab upstream URL. FRAME_PARENT_ISOLATION is the primary fix.
 *
 * Iteration 9: task switches ask the parent to preload-then-swap (double-buffer)
 * so the current document stays painted until the next task HTML is ready.
 *
 * Iteration 10: before preload/swap away from dirty compose, run Roundcube's
 * confirm_dialog (Hover discard UI). Only swap after confirm or when clean —
 * otherwise blanking the iframe trips Chrome's beforeunload "Leave site?".
 */
const SWITCH_TASK_FRAME_PATCH = `<script>(function(){
var P="/admin/mail",H="${HOVER_HELP_URL}",O=window.location.origin,S="ccvaa-admin-mail";
function isHelp(u){return!u?!1:u===H||/\\/help\\//.test(u)||/help\\.html/.test(u)||/_task=help/.test(u);}
function rw(u){
  if(typeof u!=="string"||!u||isHelp(u))return u;
  if(/^https?:\\/\\//i.test(u)){
    try{
      var abs=new URL(u,location.href);
      if(abs.origin===location.origin)return rw(abs.pathname+abs.search+abs.hash);
    }catch(e){}
    return u;
  }
  if(u==="/"||u==="")return P;
  if(u.charAt(0)==="?"||u.indexOf("./?")===0)return P+u.replace(/^\\.\\/?/,"");
  if(u.indexOf("/?")===0)return P+u.slice(1);
  if(u.indexOf(P+"/?")===0)return P+"?"+u.slice((P+"/?").length);
  if(u.indexOf(P)===0)return u;
  if(u.indexOf("//")===0)return u;
  if(u.indexOf("/admin?")===0)return P+u.slice(6);
  if(u.indexOf("/admin/?")===0)return P+u.slice(7);
  if(u==="/admin")return P;
  if(u.charAt(0)==="/"&&/_task=/.test(u))return P+u.replace(/^\\//,"");
  return u;
}
function go(u){var n=rw(u);if(!n||isHelp(n))return;try{window.location.assign(n);}catch(e){window.location.href=n;}}
function composeDirty(){
  var rc=window.rcmail;
  try{
    if(!rc||rc.task!=="mail"||!rc.env||rc.env.action!=="compose"||rc.env.server_error)return!1;
    if(rc.compose_skip_unsavedcheck||rc.env.is_sent)return!1;
    if(typeof rc.compose_field_hash!=="function")return!1;
    return rc.cmp_hash!=rc.compose_field_hash();
  }catch(e){return!1;}
}
function withComposeConfirm(fn){
  var rc=window.rcmail;
  if(!composeDirty()){fn();return;}
  function proceed(){
    try{if(rc&&typeof rc.remove_compose_data==="function")rc.remove_compose_data(rc.env.compose_id);}catch(e){}
    if(rc)rc.compose_skip_unsavedcheck=!0;
    fn();
  }
  try{
    if(rc&&typeof rc.confirm_dialog==="function"){
      rc.confirm_dialog(rc.get_label("notsentwarning"),"discard",proceed);
      return;
    }
  }catch(e){}
  try{
    if(window.confirm(rc&&rc.get_label?rc.get_label("notsentwarning"):"Discard unsaved message?"))proceed();
  }catch(e2){}
}
function doRequestSwap(n){
  var rp=window.__ccvaaRealParent,href;
  try{href=new URL(n,location.href).href;}catch(e){href=n;}
  try{
    if(rp&&rp!==window){
      rp.postMessage({source:S,action:"preload-task",url:href},O);
      return;
    }
  }catch(e){}
  go(n);
}
function requestSwap(u){
  var n=rw(u);if(!n||isHelp(n))return;
  withComposeConfirm(function(){doRequestSwap(n);});
}
function taskAnchor(a){
  if(!a||!a.getAttribute)return!1;
  var h=a.getAttribute("href")||"",oc=a.getAttribute("onclick")||"";
  if(!h||h.charAt(0)==="#"||h.indexOf("javascript:")===0)return!1;
  if(isHelp(h))return!1;
  if(oc.indexOf("switch-task")>=0)return!0;
  if(a.closest&&a.closest("#taskmenu,#taskbar,.taskbar,#layout-menu,#topline"))return/_task=/.test(h);
  return!1;
}
document.addEventListener("click",function(e){
  var el=e.target;if(!el||!el.closest)return;
  var a=el.closest("a[href]");if(!a||!taskAnchor(a))return;
  var h=a.getAttribute("href"),n=rw(h);
  e.preventDefault();e.stopPropagation();
  if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  if(a.getAttribute("target")==="_top"||a.getAttribute("target")=="_parent")a.setAttribute("target","_self");
  if(n&&n!==h)a.setAttribute("href",n);
  requestSwap(a.getAttribute("href"));
},true);
function guardLoc(loc){
  if(!loc||loc.__ccvaaG)return;
  try{
    var proto=Object.getPrototypeOf(loc);
    var d=Object.getOwnPropertyDescriptor(proto,"href")||Object.getOwnPropertyDescriptor(loc,"href");
    if(d&&d.set){
      Object.defineProperty(loc,"href",{
        configurable:!0,enumerable:!0,
        get:d.get?function(){return d.get.call(loc);}:function(){return String(loc);},
        set:function(v){d.set.call(loc,rw(v));}
      });
    }
    var as=loc.assign,rp=loc.replace;
    if(typeof as==="function")loc.assign=function(v){as.call(loc,rw(v));};
    if(typeof rp==="function")loc.replace=function(v){rp.call(loc,rw(v));};
    loc.__ccvaaG=1;
  }catch(x){}
}
function guardBreakouts(){guardLoc(window.location);}
function patchRcmail(){
  var rc=window.rcmail;if(!rc||rc.__ccvaaTaskPatch)return!!rc;
  rc.__ccvaaTaskPatch=1;
  if(typeof rc.switch_task==="function"){
    var st=rc.switch_task.bind(rc);
    rc.switch_task=function(task){
      if(!task||task==="logout")return st(task);
      var url;
      try{url=rc.get_task_url(task);}catch(e){url=P+"?_task="+encodeURIComponent(task);}
      if(task==="mail"&&url.indexOf("_mbox=")<0)url+="&_mbox=INBOX";
      requestSwap(url);
    };
  }
  if(typeof rc.redirect==="function"){
    rc.redirect=function(url,lock){
      if(lock!==!1){try{rc.set_busy(!0,"loading");}catch(e){}}
      if(typeof url!=="string"){try{url=rc.env.comm_path;}catch(e){url=P;}}
      go(url);
    };
  }
  if(typeof rc.location_href==="function"){
    var lh=rc.location_href.bind(rc);
    rc.location_href=function(url,target,frame,replace){
      if(!target||target===window.parent||target===window.top||target===window.__ccvaaRealParent||target===window.__ccvaaRealTop)target=window;
      if(typeof url==="string")url=rw(url);
      return lh(url,target,frame,replace);
    };
  }
  if(typeof rc.command==="function"){
    var cmd=rc.command.bind(rc);
    rc.command=function(command,props,obj,event,allow_disabled){
      if(command==="switch-task"&&props&&props!=="logout"&&props!=="help"){
        if(typeof rc.switch_task==="function")rc.switch_task(props);
        else requestSwap(P+"?_task="+encodeURIComponent(props));
        return!1;
      }
      return cmd(command,props,obj,event,allow_disabled);
    };
  }
  return!0;
}
guardBreakouts();
document.addEventListener("DOMContentLoaded",guardBreakouts);
var n=0,t=setInterval(function(){if(patchRcmail()||++n>200)clearInterval(t);},25);
})();</script>`;

/**
 * Hover's logged-in Roundcube chrome leaves #header empty in the iframe
 * (no logo/user strip). Hide it via CSS so Roundcube JS still finds the node.
 */
const HIDE_BLANK_HEADER = `<style id="ccvaa-hide-blank-header">#header{display:none!important}</style>`;

/**
 * Report mailbox login state to the real parent /admin page.
 * Uses __ccvaaRealParent because FRAME_PARENT_ISOLATION redefines window.parent.
 * Do not post false while Roundcube is still booting (unknown); only false when
 * login UI / task is clear. Skip reports during unload/pagehide (task-bar nav).
 * Parent sticky-auth + /api/admin/session poll remain the fail-closed backstop.
 */
const AUTH_BRIDGE = `<script>(function(){var O=window.location.origin,S="ccvaa-admin-mail",last=null,unloading=!1,realParent=window.__ccvaaRealParent;function authState(){try{if(window.rcmail&&rcmail.env){var t=rcmail.env.task;if(t&&t!=="login")return!0;if(t==="login")return!1;}}catch(e){}if(document.querySelector("#login-form,form[name=login],#login"))return!1;if(document.querySelector("#mainscreen,#mailboxlist,#layout"))return!0;return null;}function report(){if(unloading)return;var auth=authState();if(auth===null||last===auth)return;last=auth;try{if(realParent&&realParent!==window)realParent.postMessage({source:S,authenticated:auth},O);}catch(e){}}function markUnload(){unloading=!0;}window.addEventListener("pagehide",markUnload);window.addEventListener("beforeunload",markUnload);document.addEventListener("DOMContentLoaded",report);window.addEventListener("load",report);setTimeout(report,0);setInterval(report,1500);})();</script>`;

const HTML_HEAD_INJECT = `${FRAME_PARENT_ISOLATION}${HIDE_BLANK_HEADER}${HASH_LINK_NAV_GUARD}${SWITCH_TASK_FRAME_PATCH}${PASSIVE_QUERY_LINK_FIXER}${AUTH_BRIDGE}`;

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
