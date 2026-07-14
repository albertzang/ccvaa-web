import {
  handleMembersApiError,
  membersApiSuccess,
} from "@/lib/members/http";
import {
  getMemberProfileForSession,
  toPublicMemberProfile,
} from "@/lib/members/profile";
import { requireMemberSession } from "@/lib/members/session";

/** GET signed-in member profile (name, plan, Annual renewal fields). */
export async function GET() {
  try {
    const session = await requireMemberSession();
    const profile = await getMemberProfileForSession(session);
    return membersApiSuccess({
      profile: toPublicMemberProfile(profile, session.exp),
    });
  } catch (error) {
    return handleMembersApiError(error);
  }
}
