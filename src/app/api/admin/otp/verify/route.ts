import { NextRequest } from "next/server";
import {
  ADMIN_OTP_LENGTH,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_MS,
  OTP_VERIFY_IP_LIMIT,
  OTP_VERIFY_IP_WINDOW_MS,
} from "@/lib/admin/constants";
import { getClientIp, jsonError } from "@/lib/admin/http";
import { verifyOtpChallenge } from "@/lib/admin/otp";
import { checkRateLimit } from "@/lib/admin/rate-limit";
import {
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/admin/session";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  const ipLimit = checkRateLimit({
    key: `otp-verify-ip:${ip}`,
    limit: OTP_VERIFY_IP_LIMIT,
    windowMs: OTP_VERIFY_IP_WINDOW_MS,
  });
  if (!ipLimit.ok) {
    return jsonError("Too many verification attempts. Try again later.", 429, {
      retryAfterMs: ipLimit.retryAfterMs,
    });
  }

  let body: { code?: string };
  try {
    body = (await request.json()) as { code?: string };
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const code = body.code?.trim() ?? "";
  if (!/^\d{6}$/.test(code) || code.length !== ADMIN_OTP_LENGTH) {
    return jsonError("Enter the 6-digit code from your email.", 400);
  }

  const result = verifyOtpChallenge(ip, code);
  if (!result.ok) {
    const messages = {
      missing: "No active code found. Request a new one.",
      expired: "That code has expired. Request a new one.",
      locked: "Too many incorrect attempts. Request a new code.",
      invalid: "Incorrect code. Please try again.",
    } as const;
    return jsonError(messages[result.reason], 401);
  }

  let token: string;
  try {
    token = createSessionToken();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Session configuration error.";
    return jsonError(message, 500);
  }

  const options = sessionCookieOptions(Math.floor(ADMIN_SESSION_TTL_MS / 1000));
  const response = Response.json({ ok: true });
  response.headers.append(
    "Set-Cookie",
    [
      `${ADMIN_SESSION_COOKIE}=${token}`,
      `Path=${options.path}`,
      `Max-Age=${options.maxAge}`,
      `SameSite=${options.sameSite}`,
      options.httpOnly ? "HttpOnly" : "",
      options.secure ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; "),
  );
  return response;
}
