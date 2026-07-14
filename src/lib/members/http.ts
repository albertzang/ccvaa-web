import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  isMembersDbError,
  isMembersSchemaUnavailableError,
  MembersDbError,
  wrapMembersDbError,
} from "@/lib/members/errors";
import { MembersEnvError } from "@/lib/members/env";
import {
  isMembersJoinError,
  MembersJoinError,
} from "@/lib/members/join";
import {
  isMembersLoginError,
  MembersLoginError,
} from "@/lib/members/login";
import {
  isMembersNewsletterError,
  MembersNewsletterError,
} from "@/lib/members/newsletter";
import {
  MembersOtpError,
  MembersRateLimitError,
} from "@/lib/members/otp-challenges";
import { MembersEmailError } from "@/lib/members/resend";
import { MembersSessionError } from "@/lib/members/session";

type MembersApiErrorBody = {
  ok: false;
  code: string;
  message: string;
};

type CodedError = Error & { code: string };

function getCodedError(error: unknown): CodedError | null {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error) ||
    typeof (error as { code: unknown }).code !== "string" ||
    !("message" in error) ||
    typeof (error as { message: unknown }).message !== "string"
  ) {
    return null;
  }
  return error as CodedError;
}

function isMembersEnvError(error: unknown): error is MembersEnvError {
  return (
    error instanceof MembersEnvError ||
    (getCodedError(error)?.code === "MEMBERS_ENV_MISSING" &&
      (error as { name?: unknown }).name === "MembersEnvError")
  );
}

function isMembersEmailError(error: unknown): error is MembersEmailError {
  const code = getCodedError(error)?.code;
  return (
    error instanceof MembersEmailError ||
    code === "MEMBERS_EMAIL_UNAVAILABLE" ||
    code === "MEMBERS_EMAIL_SEND_FAILED"
  );
}

export function membersApiSuccess<T extends Record<string, unknown>>(
  data: T,
  status = 200,
) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

export function membersApiError(
  code: string,
  message: string,
  status: number,
) {
  const body: MembersApiErrorBody = { ok: false, code, message };
  return NextResponse.json(body, { status });
}

/**
 * Maps members API failures to stable JSON + status.
 * Env / email / DB / unmigrated schema → fail closed with 503 (not generic 500).
 */
export function handleMembersApiError(error: unknown) {
  if (error instanceof ZodError) {
    const message = error.issues[0]?.message ?? "Invalid request.";
    return membersApiError("MEMBERS_VALIDATION_ERROR", message, 400);
  }

  if (isMembersEnvError(error)) {
    return membersApiError("MEMBERS_ENV_MISSING", error.message, 503);
  }

  if (isMembersDbError(error) || error instanceof MembersDbError) {
    return membersApiError("MEMBERS_DB_UNAVAILABLE", error.message, 503);
  }

  if (isMembersEmailError(error)) {
    const coded = getCodedError(error);
    const code =
      coded?.code === "MEMBERS_EMAIL_SEND_FAILED"
        ? "MEMBERS_EMAIL_SEND_FAILED"
        : "MEMBERS_EMAIL_UNAVAILABLE";
    const status = code === "MEMBERS_EMAIL_UNAVAILABLE" ? 503 : 502;
    return membersApiError(code, error.message, status);
  }

  if (error instanceof MembersRateLimitError) {
    return membersApiError(error.code, error.message, 429);
  }

  if (error instanceof MembersOtpError) {
    const status =
      error.code === "MEMBERS_OTP_NOT_FOUND" ? 404 : 400;
    return membersApiError(error.code, error.message, status);
  }

  if (
    error instanceof MembersNewsletterError ||
    isMembersNewsletterError(error)
  ) {
    const status =
      error.code === "MEMBERS_NEWSLETTER_ALREADY_SUBSCRIBED" ? 409 : 400;
    return membersApiError(error.code, error.message, status);
  }

  if (error instanceof MembersJoinError || isMembersJoinError(error)) {
    const status =
      error.code === "MEMBERS_ALREADY_MEMBER"
        ? 409
        : error.code === "MEMBERS_FOUNDING_FULL" ||
            error.code === "MEMBERS_JOIN_PLAN_UNAVAILABLE"
          ? 409
          : error.code === "MEMBERS_JOIN_UNAVAILABLE"
            ? 503
            : 502;
    return membersApiError(error.code, error.message, status);
  }

  if (
    error instanceof MembersLoginError ||
    isMembersLoginError(error)
  ) {
    const status =
      error.code === "MEMBERS_LOGIN_NOT_ELIGIBLE" ? 404 : 503;
    return membersApiError(error.code, error.message, status);
  }

  if (error instanceof MembersSessionError) {
    return membersApiError(error.code, error.message, 401);
  }

  if (isMembersSchemaUnavailableError(error)) {
    const wrapped = wrapMembersDbError(error);
    return membersApiError(wrapped.code, wrapped.message, 503);
  }

  console.error("Unhandled members API error:", error);
  return membersApiError(
    "MEMBERS_INTERNAL_ERROR",
    "Something went wrong. Please try again later.",
    500,
  );
}
