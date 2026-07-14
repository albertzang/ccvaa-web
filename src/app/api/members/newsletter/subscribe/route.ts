import {
  handleMembersApiError,
  membersApiSuccess,
} from "@/lib/members/http";
import { subscribeToNewsletter } from "@/lib/members/newsletter";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const result = await subscribeToNewsletter(
      body as Parameters<typeof subscribeToNewsletter>[0],
    );
    return membersApiSuccess(result);
  } catch (error) {
    return handleMembersApiError(error);
  }
}
