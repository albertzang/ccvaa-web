import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";

export async function POST() {
  const response = Response.json({ ok: true });
  response.headers.append(
    "Set-Cookie",
    [
      `${ADMIN_SESSION_COOKIE}=`,
      "Path=/",
      "Max-Age=0",
      "SameSite=Lax",
      "HttpOnly",
      process.env.NODE_ENV === "production" ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; "),
  );
  return response;
}
