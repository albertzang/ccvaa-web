import {
  handleMembersApiError,
  membersApiSuccess,
} from "@/lib/members/http";
import { verifyMemberLogin } from "@/lib/members/login";
import { setMemberSessionCookie } from "@/lib/members/session";

/** POST verify login OTP → httpOnly member session (never grants `/admin`). */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const result = await verifyMemberLogin(body);
    await setMemberSessionCookie(result.token, result.expiresAt);
    return membersApiSuccess({
      session: result.session,
      message: "Signed in. Your membership session is ready.",
    });
  } catch (error) {
    return handleMembersApiError(error);
  }
}
