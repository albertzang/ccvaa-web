import {
  handleMembersApiError,
  membersApiSuccess,
} from "@/lib/members/http";
import { getJoinPlans } from "@/lib/members/join";

/** GET available Join plans (Founding+Annual or Lifetime+Annual). Fail closed without Stripe/DB. */
export async function GET() {
  try {
    const plans = await getJoinPlans();
    return membersApiSuccess(plans);
  } catch (error) {
    return handleMembersApiError(error);
  }
}
