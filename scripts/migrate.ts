import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { neon } from "@neondatabase/serverless";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  console.error(
    "DATABASE_URL is required. Set a Neon connection string in .env.local.",
  );
  process.exit(1);
}

async function main() {
  const sql = neon(databaseUrl!);
  const db = drizzle(sql);
  const migrationsFolder = resolve(process.cwd(), "drizzle");

  console.log(`Running migrations from ${migrationsFolder}…`);
  await migrate(db, { migrationsFolder });
  console.log("Migrations complete.");
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
