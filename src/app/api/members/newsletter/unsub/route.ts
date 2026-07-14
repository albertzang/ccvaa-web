import {
  handleMembersApiError,
  membersApiSuccess,
} from "@/lib/members/http";
import { redeemUnsubToken } from "@/lib/members/newsletter";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const result = await redeemUnsubToken(body);
    return membersApiSuccess(result);
  } catch (error) {
    return handleMembersApiError(error);
  }
}
