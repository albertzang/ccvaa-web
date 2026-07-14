import {
  handleMembersApiError,
  membersApiError,
  membersApiSuccess,
} from "@/lib/members/http";
import {
  lookupNewsletterPreference,
  unsubscribeFromNewsletter,
} from "@/lib/members/newsletter";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: string;
      email?: string;
    };

    if (body.action === "lookup") {
      const result = await lookupNewsletterPreference(body);
      return membersApiSuccess(result);
    }

    if (body.action === "unsubscribe") {
      const result = await unsubscribeFromNewsletter(body);
      return membersApiSuccess(result);
    }

    return membersApiError(
      "MEMBERS_VALIDATION_ERROR",
      "Invalid action. Use lookup or unsubscribe.",
      400,
    );
  } catch (error) {
    return handleMembersApiError(error);
  }
}
