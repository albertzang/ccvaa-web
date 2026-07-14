import {
  handleMembersApiError,
  membersApiSuccess,
} from "@/lib/members/http";
import { clearMemberSessionCookie } from "@/lib/members/session";

/** POST clear member session cookie. Does not affect admin/Hover auth. */
export async function POST() {
  try {
    await clearMemberSessionCookie();
    return membersApiSuccess({
      authenticated: false,
      grantsAdmin: false,
      message: "Signed out of membership.",
    });
  } catch (error) {
    return handleMembersApiError(error);
  }
}
