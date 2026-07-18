import { NextRequest } from "next/server";

import {
  adminApiSuccess,
  handleAdminApiError,
} from "@/lib/admin/http";
import {
  deleteAdminRosterMember,
  updateAdminRosterMember,
} from "@/lib/admin/roster";
import { requireMailSession } from "@/lib/admin/require-mail-session";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/** PATCH a roster member. Mail-session gated; Zod-validated body. */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireMailSession(request.headers.get("cookie"));
    const { id } = await context.params;
    const body: unknown = await request.json();
    const member = await updateAdminRosterMember(id, body);
    return adminApiSuccess({ member });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

/** DELETE a roster member. Mail-session gated. */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireMailSession(request.headers.get("cookie"));
    const { id } = await context.params;
    const result = await deleteAdminRosterMember(id);
    return adminApiSuccess(result);
  } catch (error) {
    return handleAdminApiError(error);
  }
}
