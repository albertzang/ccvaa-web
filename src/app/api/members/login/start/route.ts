import {
  handleMembersApiError,
  membersApiSuccess,
} from "@/lib/members/http";
import { startMemberLogin } from "@/lib/members/login";

/** POST start member login OTP (active paid members only). */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const result = await startMemberLogin(body);
    return membersApiSuccess(result);
  } catch (error) {
    return handleMembersApiError(error);
  }
}
