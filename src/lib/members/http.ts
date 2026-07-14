import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { MembersDbError } from "@/lib/members/errors";
import { MembersEnvError } from "@/lib/members/env";
import {
  isMembersJoinError,
  MembersJoinError,
} from "@/lib/members/join";
import {
  isMembersNewsletterError,
  MembersNewsletterError,
} from "@/lib/members/newsletter";
import {
  MembersOtpError,
  MembersRateLimitError,
} from "@/lib/members/otp-challenges";
import { MembersEmailError } from "@/lib/members/resend";

type MembersApiErrorBody = {
  ok: false;
  code: string;
  message: string;
};

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

export function handleMembersApiError(error: unknown) {
  if (error instanceof ZodError) {
    const message = error.issues[0]?.message ?? "Invalid request.";
    return membersApiError("MEMBERS_VALIDATION_ERROR", message, 400);
  }

  if (error instanceof MembersEnvError) {
    return membersApiError(error.code, error.message, 503);
  }

  if (error instanceof MembersDbError) {
    return membersApiError(error.code, error.message, 503);
  }

  if (error instanceof MembersEmailError) {
    const status =
      error.code === "MEMBERS_EMAIL_UNAVAILABLE" ? 503 : 502;
    return membersApiError(error.code, error.message, status);
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

  console.error("Unhandled members API error:", error);
  return membersApiError(
    "MEMBERS_INTERNAL_ERROR",
    "Something went wrong. Please try again later.",
    500,
  );
}
