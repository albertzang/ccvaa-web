import { NextResponse } from "next/server";

import { pingMembersDb } from "@/db/client";
import { MembersDbError } from "@/lib/members/errors";
import {
  getDatabaseUrl,
  isMailosaurConfigured,
  MembersEnvError,
} from "@/lib/members/env";
import { isResendConfigured } from "@/lib/members/resend";

/**
 * Platform health for Members — DB + transactional email config.
 * Returns 503 when DATABASE_URL is missing or Neon is unreachable (fail closed).
 * Resend/Mailosaur status is informational only (does not affect HTTP status).
 */
export async function GET() {
  const resendConfigured = isResendConfigured();
  const mailosaurConfigured = isMailosaurConfigured();

  if (!getDatabaseUrl()) {
    return NextResponse.json(
      {
        ok: false,
        code: "MEMBERS_ENV_MISSING",
        message:
          "DATABASE_URL is not configured. Members platform is unavailable.",
        db: { ok: false, code: "MEMBERS_ENV_MISSING" },
        email: {
          resend: resendConfigured ? "configured" : "missing",
          mailosaur: mailosaurConfigured ? "configured" : "missing",
        },
      },
      { status: 503 },
    );
  }

  try {
    await pingMembersDb();
    return NextResponse.json({
      ok: true,
      service: "members-platform",
      db: { ok: true },
      email: {
        resend: resendConfigured ? "configured" : "missing",
        mailosaur: mailosaurConfigured ? "configured" : "missing",
      },
    });
  } catch (error) {
    const message =
      error instanceof MembersEnvError || error instanceof MembersDbError
        ? error.message
        : "Members database is unavailable.";

    const code =
      error instanceof MembersEnvError
        ? error.code
        : error instanceof MembersDbError
          ? error.code
          : "MEMBERS_DB_UNAVAILABLE";

    return NextResponse.json(
      {
        ok: false,
        code,
        message,
        db: { ok: false, code },
        email: {
          resend: resendConfigured ? "configured" : "missing",
          mailosaur: mailosaurConfigured ? "configured" : "missing",
        },
      },
      { status: 503 },
    );
  }
}
