import {
  handleMembersApiError,
  membersApiSuccess,
} from "@/lib/members/http";
import { updateMemberProfileName } from "@/lib/members/profile";
import {
  requireMemberSession,
  setMemberSessionCookie,
} from "@/lib/members/session";

/** PATCH update display name for the signed-in member. */
export async function PATCH(request: Request) {
  try {
    const session = await requireMemberSession();
    const body = (await request.json()) as unknown;
    const result = await updateMemberProfileName(session, body);
    await setMemberSessionCookie(result.token, result.expiresAt);
    return membersApiSuccess({
      profile: result.session,
      message: "Name updated.",
    });
  } catch (error) {
    return handleMembersApiError(error);
  }
}
