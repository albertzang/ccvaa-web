/**
 * Members platform env — Neon connection string required for DB access.
 *
 * Env split:
 * - Local Dev: `.env.local` → `DATABASE_URL` (Neon dev branch or local Postgres)
 * - Vercel Preview: Preview env vars (Neon branch recommended)
 * - Vercel Production: Production env vars (Neon main branch)
 *
 * Future tickets (placeholders in `.env.example` only — not read at runtime here):
 * - Stripe test/live keys, Resend, Mailosaur, ESP
 */

export type MembersRuntimeEnv = "development" | "preview" | "production" | "test";

export function getMembersRuntimeEnv(): MembersRuntimeEnv {
  if (process.env.NODE_ENV === "test") {
    return "test";
  }
  if (process.env.VERCEL_ENV === "production") {
    return "production";
  }
  if (process.env.VERCEL_ENV === "preview") {
    return "preview";
  }
  return "development";
}

export function isProductionRuntime(): boolean {
  return getMembersRuntimeEnv() === "production";
}

/** True when seed scripts are allowed (never on Production). */
export function canRunMembersSeeds(): boolean {
  return !isProductionRuntime();
}

export function getDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL?.trim();
  return url || undefined;
}

export function requireDatabaseUrl(): string {
  const url = getDatabaseUrl();
  if (!url) {
    throw new MembersEnvError(
      "DATABASE_URL is not configured. Set a Neon connection string in .env.local (Dev) or Vercel env (Preview/Production).",
    );
  }
  return url;
}

export class MembersEnvError extends Error {
  readonly code = "MEMBERS_ENV_MISSING" as const;

  constructor(message: string) {
    super(message);
    this.name = "MembersEnvError";
  }
}
