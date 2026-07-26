import {
  handleMembersApiError,
  membersApiSuccess,
} from "@/lib/members/http";
import { getHeroCounts } from "@/lib/members/hero-counts";

/** GET live hero Subscribe/Join counters for client refresh after sub/unsub/join. */
export async function GET() {
  try {
    const counts = await getHeroCounts();
    return membersApiSuccess(counts);
  } catch (error) {
    return handleMembersApiError(error);
  }
}
