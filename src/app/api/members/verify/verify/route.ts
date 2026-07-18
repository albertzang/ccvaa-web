import {
  handleMembersApiError,
  membersApiSuccess,
} from "@/lib/members/http";
import { setMemberSessionCookie } from "@/lib/members/session";
import { confirmEmailVerification } from "@/lib/members/verify-email";

/** POST verify email OTP → upsert member + httpOnly verified session. */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const result = await confirmEmailVerification(body);
    await setMemberSessionCookie(result.token, result.expiresAt);
    return membersApiSuccess({
      session: result.session,
      profile: result.profile,
      message: result.message,
    });
  } catch (error) {
    return handleMembersApiError(error);
  }
}
