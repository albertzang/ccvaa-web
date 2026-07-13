import { NextRequest } from "next/server";
import { isMailAuthenticated } from "@/lib/admin/mail-session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authenticated = await isMailAuthenticated(
    request.headers.get("cookie"),
  );
  return Response.json({ authenticated });
}
