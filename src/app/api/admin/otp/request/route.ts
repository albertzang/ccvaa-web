import { NextRequest } from "next/server";
import {
  OTP_REQUEST_COOLDOWN_MS,
  OTP_REQUEST_HOUR_LIMIT,
  OTP_REQUEST_HOUR_WINDOW_MS,
} from "@/lib/admin/constants";
import { sendAdminOtpEmail } from "@/lib/admin/email";
import { getClientIp, jsonError } from "@/lib/admin/http";
import { createOtpChallenge, generateOtpCode } from "@/lib/admin/otp";
import { checkRateLimit, peekRateLimit } from "@/lib/admin/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  const cooldown = await peekRateLimit({
    key: `otp-request-cooldown:${ip}`,
    limit: 1,
    windowMs: OTP_REQUEST_COOLDOWN_MS,
  });
  if (cooldown.remaining === 0) {
    return jsonError("Please wait before requesting another code.", 429, {
      retryAfterMs: cooldown.retryAfterMs,
    });
  }

  const hourly = await checkRateLimit({
    key: `otp-request-hour:${ip}`,
    limit: OTP_REQUEST_HOUR_LIMIT,
    windowMs: OTP_REQUEST_HOUR_WINDOW_MS,
  });
  if (!hourly.ok) {
    return jsonError("Too many code requests. Try again later.", 429, {
      retryAfterMs: hourly.retryAfterMs,
    });
  }

  await checkRateLimit({
    key: `otp-request-cooldown:${ip}`,
    limit: 1,
    windowMs: OTP_REQUEST_COOLDOWN_MS,
  });

  const code = generateOtpCode();
  await createOtpChallenge(ip, code);

  try {
    const result = await sendAdminOtpEmail(code);
    return Response.json({
      ok: true,
      expiresInSeconds: 600,
      cooldownMs: OTP_REQUEST_COOLDOWN_MS,
      mode: result.mode,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send login code.";
    return jsonError(message, 500);
  }
}
