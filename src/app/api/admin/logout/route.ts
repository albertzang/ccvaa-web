import { NextRequest } from "next/server";
import { clearUpstreamCookieHeaders } from "@/lib/admin/mail-cookies";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const requestIsHttps = request.nextUrl.protocol === "https:";
  const response = Response.json({ ok: true });
  for (const cookie of clearUpstreamCookieHeaders(
    request.headers.get("cookie"),
    requestIsHttps,
  )) {
    response.headers.append("Set-Cookie", cookie);
  }
  return response;
}
