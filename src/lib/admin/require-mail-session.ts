import { isMailAuthenticated } from "@/lib/admin/mail-session";

export class AdminAuthError extends Error {
  readonly code = "ADMIN_AUTH_REQUIRED" as const;

  constructor(message = "Admin mailbox session required.") {
    super(message);
    this.name = "AdminAuthError";
  }
}

/** Fail closed when Hover mail-session is not authenticated. */
export async function requireMailSession(
  cookieHeader: string | null,
): Promise<void> {
  const authenticated = await isMailAuthenticated(cookieHeader);
  if (!authenticated) {
    throw new AdminAuthError();
  }
}
