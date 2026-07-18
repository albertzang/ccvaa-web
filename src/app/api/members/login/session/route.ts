import {
  handleMembersApiError,
  membersApiSuccess,
} from "@/lib/members/http";
import {
  readMemberSession,
  toPublicMemberSession,
} from "@/lib/members/session";

/**
 * GET current member session (if any).
 * `grantsAdmin` is always false — `/admin` uses Hover mailbox session only.
 */
export async function GET() {
  try {
    const payload = await readMemberSession();
    if (!payload) {
      return membersApiSuccess({
        authenticated: false,
        grantsAdmin: false,
      });
    }
    return membersApiSuccess(toPublicMemberSession(payload));
  } catch (error) {
    return handleMembersApiError(error);
  }
}
