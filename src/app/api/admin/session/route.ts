import { getAdminSession } from "@/lib/admin/session";

export async function GET() {
  const authenticated = await getAdminSession();
  return Response.json({ authenticated });
}
