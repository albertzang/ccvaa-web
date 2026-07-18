import { NextResponse } from "next/server";

import { MembersDbError } from "@/lib/members/errors";
import {
  MembersEnvError,
  requireDatabaseUrl,
} from "@/lib/members/env";
import {
  isMembersNewsletterError,
  redeemUnsubToken,
} from "@/lib/members/newsletter";
import {
  createMemberSessionToken,
  isMemberSessionSecretConfigured,
  setMemberSessionCookieOnResponse,
} from "@/lib/members/session";
import { unsubTokenValueSchema } from "@/lib/members/zod/unsub-token";

export type UnsubLandingStatus = "1" | "already" | "invalid";

/**
 * One-click unsubscribe landing (Route Handler).
 *
 * Email footers still use `/?unsub=<token>#membership`. The home page redirects
 * here so cookie writes stay outside the RSC page (Next.js constraint).
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token") ?? undefined;
  const origin = requestUrl.origin;

  const redirectHome = (status: UnsubLandingStatus) =>
    NextResponse.redirect(
      new URL(`/?unsubscribed=${status}#membership`, origin),
    );

  const parsed = unsubTokenValueSchema.safeParse(token);
  if (!parsed.success) {
    return redirectHome("invalid");
  }

  try {
    requireDatabaseUrl();
    const result = await redeemUnsubToken({ token: parsed.data });
    const status: UnsubLandingStatus = result.alreadyUnsubscribed
      ? "already"
      : "1";
    const response = redirectHome(status);

    if (isMemberSessionSecretConfigured()) {
      const { token: sessionToken, expiresAt } = createMemberSessionToken({
        memberId: result.memberId,
        email: result.email,
        name: result.name,
        plan: result.plan,
      });
      setMemberSessionCookieOnResponse(response, sessionToken, expiresAt);
    }

    return response;
  } catch (error) {
    if (
      isMembersNewsletterError(error) ||
      error instanceof MembersEnvError ||
      error instanceof MembersDbError
    ) {
      return redirectHome("invalid");
    }
    throw error;
  }
}
