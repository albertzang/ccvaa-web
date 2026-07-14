import { createHash } from "node:crypto";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { resolve } from "node:path";

import { getMembersDb } from "@/db/client";
import { members, otpChallenges, unsubTokens } from "@/db/schema";
import { canRunMembersSeeds, getMembersRuntimeEnv } from "@/lib/members/env";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

/** Fixed anniversary for QA — Annual seed member renews on this calendar date. */
export const SEED_ANNUAL_ANNIVERSARY = "2025-03-15";
export const SEED_ANNUAL_NEXT_RENEWAL = "2026-03-15T00:00:00.000Z";

const SEED_EMAILS = {
  newsletterOnly: "newsletter-only@ccvaa-seed.test",
  founding: "founding@ccvaa-seed.test",
  lifetime: "lifetime@ccvaa-seed.test",
  annual: "annual@ccvaa-seed.test",
} as const;

function hashOtp(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

async function upsertMember(
  email: string,
  values: Omit<typeof members.$inferInsert, "email">,
) {
  const db = getMembersDb();
  const existing = await db
    .select({ id: members.id })
    .from(members)
    .where(eq(members.email, email))
    .limit(1);

  if (existing[0]) {
    await db
      .update(members)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(members.id, existing[0].id));
    return existing[0].id;
  }

  const inserted = await db
    .insert(members)
    .values({ email, ...values })
    .returning({ id: members.id });
  return inserted[0]!.id;
}

async function main() {
  if (!canRunMembersSeeds()) {
    console.error(
      `Refusing to seed in ${getMembersRuntimeEnv()} runtime. Seeds are non-Production only.`,
    );
    process.exit(1);
  }

  console.log(`Seeding members data (${getMembersRuntimeEnv()})…`);

  const newsletterOnlyId = await upsertMember(SEED_EMAILS.newsletterOnly, {
    name: "Newsletter Only",
    newsletterStatus: "on",
    newsletterConfirmedAt: new Date("2025-01-01T12:00:00.000Z"),
    membershipPlan: "none",
    membershipStatus: "none",
    membershipAnniversary: null,
    nextRenewalAt: null,
  });

  await upsertMember(SEED_EMAILS.founding, {
    name: "Founding Member",
    newsletterStatus: "off",
    membershipPlan: "founding",
    membershipStatus: "active",
    membershipAnniversary: null,
    nextRenewalAt: null,
  });

  await upsertMember(SEED_EMAILS.lifetime, {
    name: "Lifetime Member",
    newsletterStatus: "on",
    newsletterConfirmedAt: new Date("2025-02-01T12:00:00.000Z"),
    membershipPlan: "lifetime",
    membershipStatus: "active",
    membershipAnniversary: null,
    nextRenewalAt: null,
  });

  const annualId = await upsertMember(SEED_EMAILS.annual, {
    name: "Annual Member",
    newsletterStatus: "on",
    newsletterConfirmedAt: new Date("2025-03-01T12:00:00.000Z"),
    membershipPlan: "annual",
    membershipStatus: "active",
    membershipAnniversary: SEED_ANNUAL_ANNIVERSARY,
    nextRenewalAt: new Date(SEED_ANNUAL_NEXT_RENEWAL),
    stripeCustomerId: "cus_seed_annual_test",
  });

  const db = getMembersDb();

  await db.insert(otpChallenges).values({
    email: SEED_EMAILS.annual,
    purpose: "login",
    codeHash: hashOtp("123456"),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  for (const row of [
    { memberId: newsletterOnlyId, token: "seed-unsub-newsletter-only" },
    { memberId: annualId, token: "seed-unsub-annual-member" },
  ]) {
    await db
      .insert(unsubTokens)
      .values(row)
      .onConflictDoNothing({ target: unsubTokens.token });
  }

  console.log("Seed complete:");
  console.log(`  Newsletter-only: ${SEED_EMAILS.newsletterOnly}`);
  console.log(`  Founding:        ${SEED_EMAILS.founding}`);
  console.log(`  Lifetime:        ${SEED_EMAILS.lifetime}`);
  console.log(
    `  Annual:          ${SEED_EMAILS.annual} (anniversary ${SEED_ANNUAL_ANNIVERSARY}, next renewal ${SEED_ANNUAL_NEXT_RENEWAL})`,
  );
  console.log("  OTP sample for annual login: 123456 (dev seed only)");
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
