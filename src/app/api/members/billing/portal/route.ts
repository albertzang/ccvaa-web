import {
  handleMembersApiError,
  membersApiError,
  membersApiSuccess,
} from "@/lib/members/http";
import {
  createBillingPortalSession,
  isMembersBillingPortalError,
} from "@/lib/members/billing-portal";
import { requireMemberSession } from "@/lib/members/session";

/**
 * POST — create Stripe Customer Portal session when stripe_customer_id is set.
 * Returns `{ url }` for client redirect. Fail closed without customer / Stripe.
 */
export async function POST(request: Request) {
  try {
    const session = await requireMemberSession();
    const result = await createBillingPortalSession(session, {
      requestOrigin: request.url,
    });
    return membersApiSuccess(result);
  } catch (error) {
    if (isMembersBillingPortalError(error)) {
      const status =
        error.code === "MEMBERS_BILLING_NO_CUSTOMER" ? 400 : 502;
      return membersApiError(error.code, error.message, status);
    }
    return handleMembersApiError(error);
  }
}
