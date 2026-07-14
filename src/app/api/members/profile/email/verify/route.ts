import {
  handleMembersApiError,
  membersApiSuccess,
} from "@/lib/members/http";
import { verifyMemberProfileEmailChange } from "@/lib/members/profile";
import {
  requireMemberSession,
  setMemberSessionCookie,
} from "@/lib/members/session";

/** POST verify OTP and apply email change for the signed-in member. */
export async function POST(request: Request) {
  try {
    const session = await requireMemberSession();
    const body = (await request.json()) as unknown;
    const result = await verifyMemberProfileEmailChange(session, body);
    await setMemberSessionCookie(result.token, result.expiresAt);
    return membersApiSuccess({
      profile: result.session,
      message: "Email updated.",
    });
  } catch (error) {
    return handleMembersApiError(error);
  }
}
