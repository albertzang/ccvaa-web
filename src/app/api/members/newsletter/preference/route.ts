import {
  handleMembersApiError,
  membersApiSuccess,
} from "@/lib/members/http";
import { updateNewsletterPreferenceForSession } from "@/lib/members/newsletter";
import { requireMemberSession } from "@/lib/members/session";

/**
 * POST session-authenticated newsletter preference toggle.
 * Body: `{ status: "on" | "off" }` — no OTP while verified session is active.
 * Legacy email lookup/unsubscribe actions are no longer used by the public UI.
 */
export async function POST(request: Request) {
  try {
    const session = await requireMemberSession();
    const body = (await request.json()) as unknown;
    const result = await updateNewsletterPreferenceForSession(session, body);
    return membersApiSuccess(result);
  } catch (error) {
    return handleMembersApiError(error);
  }
}
