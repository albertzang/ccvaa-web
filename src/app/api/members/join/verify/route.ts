import {
  handleMembersApiError,
  membersApiSuccess,
} from "@/lib/members/http";
import { verifyJoinAndCreateCheckout } from "@/lib/members/join";

/** POST verify Join OTP → Stripe Checkout Session URL. */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const origin = new URL(request.url).origin;
    const result = await verifyJoinAndCreateCheckout(body, {
      requestOrigin: origin,
    });
    return membersApiSuccess({
      email: result.email,
      plan: result.plan,
      checkoutUrl: result.checkoutUrl,
    });
  } catch (error) {
    return handleMembersApiError(error);
  }
}
