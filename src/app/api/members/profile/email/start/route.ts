import {
  handleMembersApiError,
  membersApiSuccess,
} from "@/lib/members/http";
import { startMemberProfileEmailChange } from "@/lib/members/profile";
import { requireMemberSession } from "@/lib/members/session";

/** POST start email change — sends OTP to the new address. */
export async function POST(request: Request) {
  try {
    const session = await requireMemberSession();
    const body = (await request.json()) as unknown;
    const result = await startMemberProfileEmailChange(session, body);
    return membersApiSuccess(result);
  } catch (error) {
    return handleMembersApiError(error);
  }
}
