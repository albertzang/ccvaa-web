import { NextRequest } from "next/server";

import {
  adminApiSuccess,
  handleAdminApiError,
} from "@/lib/admin/http";
import { listAdminRoster } from "@/lib/admin/roster";
import { requireMailSession } from "@/lib/admin/require-mail-session";

export const dynamic = "force-dynamic";

/** GET admin member roster (search + plan/newsletter filters). Mail-session gated. */
export async function GET(request: NextRequest) {
  try {
    await requireMailSession(request.headers.get("cookie"));
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const result = await listAdminRoster(params);
    return adminApiSuccess(result);
  } catch (error) {
    return handleAdminApiError(error);
  }
}
