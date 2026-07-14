import { NextResponse } from "next/server";

import { pingMembersDb } from "@/db/client";
import { MembersDbError } from "@/lib/members/errors";
import { getDatabaseUrl, MembersEnvError } from "@/lib/members/env";

/**
 * Platform health for Members DB — no public UI in members-0001.
 * Returns 503 when DATABASE_URL is missing or Neon is unreachable (fail closed).
 */
export async function GET() {
  if (!getDatabaseUrl()) {
    return NextResponse.json(
      {
        ok: false,
        code: "MEMBERS_ENV_MISSING",
        message:
          "DATABASE_URL is not configured. Members platform is unavailable.",
      },
      { status: 503 },
    );
  }

  try {
    await pingMembersDb();
    return NextResponse.json({ ok: true, service: "members-db" });
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

    return NextResponse.json({ ok: false, code, message }, { status: 503 });
  }
}
