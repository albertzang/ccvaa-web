import {
  handleMembersApiError,
  membersApiSuccess,
} from "@/lib/members/http";
import { confirmNewsletterSubscription } from "@/lib/members/newsletter";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const result = await confirmNewsletterSubscription(body);
    return membersApiSuccess(result);
  } catch (error) {
    return handleMembersApiError(error);
  }
}
