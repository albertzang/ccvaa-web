import {
  filterUpstreamCookies,
  hasRoundcubeSessionCookie,
} from "@/lib/admin/mail-cookies";

const UPSTREAM_ORIGIN = "https://mail.hover.com";

/**
 * Fail-closed: mailbox is authenticated only when Roundcube session cookie
 * exists and a lightweight upstream probe looks like a logged-in UI (not login).
 */
export async function isMailAuthenticated(
  cookieHeader: string | null,
): Promise<boolean> {
  if (!hasRoundcubeSessionCookie(cookieHeader)) return false;

  const upstreamCookie = filterUpstreamCookies(cookieHeader);
  if (!upstreamCookie) return false;

  try {
    const upstream = await fetch(`${UPSTREAM_ORIGIN}/?_task=mail`, {
      method: "GET",
      headers: {
        accept: "text/html,application/xhtml+xml",
        cookie: upstreamCookie,
        "user-agent":
          "Mozilla/5.0 (compatible; CCVAA-Admin-Mail-Session-Probe/1.0)",
      },
      redirect: "manual",
      cache: "no-store",
    });

    const location = upstream.headers.get("location") ?? "";
    if (/_task=login/i.test(location) || /\/\?_task=login/i.test(location)) {
      return false;
    }

    if (upstream.status >= 400) return false;

    const contentType = upstream.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("json")) {
      return false;
    }

    const body = await upstream.text();
    return looksLoggedIn(body);
  } catch {
    return false;
  }
}

function looksLoggedIn(body: string): boolean {
  const lower = body.toLowerCase();

  if (
    /"task"\s*:\s*"login"/i.test(body) ||
    /'task'\s*:\s*'login'/i.test(body) ||
    /name=["']login["']/i.test(body) ||
    /id=["']login-form["']/i.test(body) ||
    (/_task=login/i.test(body) && /type=["']password["']/i.test(body))
  ) {
    return false;
  }

  if (
    /"task"\s*:\s*"(mail|settings|addressbook|calendar)"/i.test(body) ||
    /id=["']mainscreen["']/i.test(body) ||
    /id=["']mailboxlist["']/i.test(body) ||
    /id=["']layout["']/i.test(body) ||
    /rcmail\.env\.user/i.test(body)
  ) {
    return true;
  }

  if (lower.includes('type="password"') || lower.includes("type='password'")) {
    return false;
  }

  return false;
}
