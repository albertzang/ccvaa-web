import {
  handleMembersApiError,
  membersApiSuccess,
} from "@/lib/members/http";
import { startJoin } from "@/lib/members/join";
import { joinMembershipInputSchema } from "@/lib/members/zod/membership";

/** POST start Join — send email_verify OTP after plan/seat checks. */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const parsed = joinMembershipInputSchema.parse(body);
    const result = await startJoin(parsed);
    return membersApiSuccess({
      email: result.email,
      plan: result.plan,
      expiresAt: result.expiresAt.toISOString(),
      message: result.message,
    });
  } catch (error) {
    return handleMembersApiError(error);
  }
}
