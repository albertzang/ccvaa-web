import {
  handleMembersApiError,
  membersApiSuccess,
} from "@/lib/members/http";
import { establishMemberSessionFromCheckout } from "@/lib/members/join";
import { setMemberSessionCookie } from "@/lib/members/session";

/**
 * POST after Checkout success return — establishes member session from
 * Stripe Checkout session id (webhook race → pending). Never grants `/admin`.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const result = await establishMemberSessionFromCheckout(body);

    if (result.status === "pending") {
      return membersApiSuccess({
        status: "pending" as const,
        message: result.message,
      });
    }

    await setMemberSessionCookie(result.token, result.expiresAt);
    return membersApiSuccess({
      status: "ready" as const,
      session: result.session,
      profile: result.profile,
      message: result.message,
    });
  } catch (error) {
    return handleMembersApiError(error);
  }
}
