import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AdminAuthError } from "@/lib/admin/require-mail-session";
import {
  isAdminRosterError,
} from "@/lib/admin/roster";
import {
  isMembersDbError,
  isMembersSchemaUnavailableError,
  MembersDbError,
  wrapMembersDbError,
} from "@/lib/members/errors";

type AdminApiErrorBody = {
  ok: false;
  code: string;
  message: string;
};

export function adminApiSuccess<T extends Record<string, unknown>>(
  data: T,
  status = 200,
) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

export function adminApiError(code: string, message: string, status: number) {
  const body: AdminApiErrorBody = { ok: false, code, message };
  return NextResponse.json(body, { status });
}

/** Maps admin API failures to stable JSON + status. */
export function handleAdminApiError(error: unknown) {
  if (error instanceof ZodError) {
    const message = error.issues[0]?.message ?? "Invalid request.";
    return adminApiError("ADMIN_VALIDATION_ERROR", message, 400);
  }

  if (error instanceof AdminAuthError) {
    return adminApiError(error.code, error.message, 401);
  }

  if (isAdminRosterError(error)) {
    const status = error.code === "ADMIN_ROSTER_NOT_FOUND" ? 404 : 400;
    return adminApiError(error.code, error.message, status);
  }

  if (isMembersDbError(error) || error instanceof MembersDbError) {
    return adminApiError("MEMBERS_DB_UNAVAILABLE", error.message, 503);
  }

  if (isMembersSchemaUnavailableError(error)) {
    const wrapped = wrapMembersDbError(error);
    return adminApiError(wrapped.code, wrapped.message, 503);
  }

  console.error("Unhandled admin API error:", error);
  return adminApiError(
    "ADMIN_INTERNAL_ERROR",
    "Something went wrong. Please try again later.",
    500,
  );
}
