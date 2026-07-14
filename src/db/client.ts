import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "@/db/schema";
import { MembersDbError } from "@/lib/members/errors";
import { requireDatabaseUrl } from "@/lib/members/env";

export type MembersDatabase = NeonHttpDatabase<typeof schema>;

let cachedDb: MembersDatabase | null = null;

/**
 * Returns a Drizzle client for the Members Neon database.
 * Fails closed when DATABASE_URL is missing — never returns a silent no-op client.
 */
export function getMembersDb(): MembersDatabase {
  if (cachedDb) {
    return cachedDb;
  }

  let databaseUrl: string;
  try {
    databaseUrl = requireDatabaseUrl();
  } catch (error) {
    throw new MembersDbError(
      error instanceof Error ? error.message : "Members database is not configured.",
      { cause: error },
    );
  }

  const sql = neon(databaseUrl);
  cachedDb = drizzle(sql, { schema });
  return cachedDb;
}

/** Clears the cached client (tests or env reload). */
export function resetMembersDbCache(): void {
  cachedDb = null;
}

/**
 * Verifies DATABASE_URL is set and the database responds to a trivial query.
 * Used by health checks and ops scripts.
 */
export async function pingMembersDb(): Promise<void> {
  const db = getMembersDb();
  try {
    await db.execute(sql`select 1 as ok`);
  } catch (error) {
    throw new MembersDbError("Members database ping failed.", { cause: error });
  }
}
