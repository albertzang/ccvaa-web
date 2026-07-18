import {
  handleMembersApiError,
  membersApiSuccess,
} from "@/lib/members/http";
import { createJoinCheckoutForSession } from "@/lib/members/join";
import { requireMemberSession } from "@/lib/members/session";

/** POST session-authenticated Join → Stripe Checkout (no OTP). */
export async function POST(request: Request) {
  try {
    const session = await requireMemberSession();
    const body = (await request.json()) as unknown;
    const result = await createJoinCheckoutForSession(session, body, {
      requestOrigin: request.url,
    });
    return membersApiSuccess({
      checkoutUrl: result.checkoutUrl,
      email: result.email,
      plan: result.plan,
    });
  } catch (error) {
    return handleMembersApiError(error);
  }
}
