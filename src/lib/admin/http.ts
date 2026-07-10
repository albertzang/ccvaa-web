import { NextRequest } from "next/server";

export function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function jsonError(
  message: string,
  status: number,
  extra?: Record<string, unknown>,
) {
  return Response.json({ error: message, ...extra }, { status });
}
