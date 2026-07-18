import { NextRequest, NextResponse } from "next/server";

import { isFeatureEnabled } from "@/lib/flags/read";

const PROXY_PREFIX = "/admin/mail";
const MEMBERS_API_PREFIX = "/api/members";

/** Roundcube static + app roots that must stay under the mail proxy. */
const ROUNDCUBE_ROOTS = [
  "skins",
  "program",
  "plugins",
  "brands",
  "static",
  "bin",
] as const;

function isAlwaysLiveMembersPath(pathname: string): boolean {
  return (
    pathname === `${MEMBERS_API_PREFIX}/health` ||
    pathname === `${MEMBERS_API_PREFIX}/login/logout` ||
    pathname === `${MEMBERS_API_PREFIX}/newsletter/unsub` ||
    pathname.startsWith(`${MEMBERS_API_PREFIX}/newsletter/unsub/`) ||
    pathname.startsWith(`${MEMBERS_API_PREFIX}/webhooks/`) ||
    pathname.startsWith(`${MEMBERS_API_PREFIX}/esp/`)
  );
}

/**
 * Keep Roundcube root-absolute requests inside /admin/mail.
 */
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (
    pathname.startsWith(`${MEMBERS_API_PREFIX}/`) &&
    !isAlwaysLiveMembersPath(pathname) &&
    !(await isFeatureEnabled("members"))
  ) {
    return NextResponse.json(
      {
        ok: false,
        code: "MEMBERS_FEATURE_UNAVAILABLE",
        message: "The members feature is not available.",
      },
      {
        status: 404,
        headers: { "cache-control": "private, no-store" },
      },
    );
  }

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
    "/api/members/:path*",
    "/admin/mail/",
    "/skins/:path*",
    "/program/:path*",
    "/plugins/:path*",
    "/brands/:path*",
    "/static/:path*",
    "/bin/:path*",
  ],
};
