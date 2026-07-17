import {
  handleMembersApiError,
  membersApiSuccess,
} from "@/lib/members/http";
import { startEmailVerification } from "@/lib/members/verify-email";

/** POST start email verification OTP for the membership portal gate. */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const result = await startEmailVerification(body);
    return membersApiSuccess(result);
  } catch (error) {
    return handleMembersApiError(error);
  }
}
