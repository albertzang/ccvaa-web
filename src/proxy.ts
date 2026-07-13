import { NextRequest, NextResponse } from "next/server";

const PROXY_PREFIX = "/admin/mail";

/** Roundcube static + app roots that must stay under the mail proxy. */
const ROUNDCUBE_ROOTS = [
  "skins",
  "program",
  "plugins",
  "brands",
  "static",
  "bin",
] as const;

/**
 * Keep Roundcube root-absolute requests inside /admin/mail.
 */
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // <base href="/admin/mail/"> resolves href="?…" to /admin/mail/?…; Next 308s to
  // /admin/mail?… and the iframe flashes. Rewrite internally — no redirect.
  if (pathname === `${PROXY_PREFIX}/`) {
    const url = request.nextUrl.clone();
    url.pathname = PROXY_PREFIX;
    return NextResponse.rewrite(url);
  }

  if (pathname === "/" && searchParams.has("_task")) {
    const url = request.nextUrl.clone();
    url.pathname = PROXY_PREFIX;
    return NextResponse.rewrite(url);
  }

  // Defensive: iframe task nav must not land on /admin/?_task=… (reloads shell).
  if (pathname === "/admin" && searchParams.has("_task")) {
    const url = request.nextUrl.clone();
    url.pathname = PROXY_PREFIX;
    return NextResponse.rewrite(url);
  }

  for (const root of ROUNDCUBE_ROOTS) {
    if (pathname === `/${root}` || pathname.startsWith(`/${root}/`)) {
      const url = request.nextUrl.clone();
      url.pathname = `${PROXY_PREFIX}${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin",
    "/admin/mail/",
    "/skins/:path*",
    "/program/:path*",
    "/plugins/:path*",
    "/brands/:path*",
    "/static/:path*",
    "/bin/:path*",
  ],
};
