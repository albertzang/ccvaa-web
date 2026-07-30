import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { resolve } from "node:path";

import { getMembersDb } from "@/db/client";
import { members, memberships, otpChallenges } from "@/db/schema";
import { hashOtpCode } from "@/lib/members/crypto";
import { generateUnsubToken } from "@/lib/members/crypto";
import { canRunMembersSeeds, getMembersRuntimeEnv } from "@/lib/members/env";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

/** Fixed period end for QA — Annual seed member. */
export const SEED_ANNUAL_PERIOD_END = "2026-03-15T00:00:00.000Z";

const SEED_EMAILS = {
  newsletterOnly: "newsletter-only@ccvaa-seed.test",
  founding: "founding@ccvaa-seed.test",
  lifetime: "lifetime@ccvaa-seed.test",
  annual: "annual@ccvaa-seed.test",
} as const;

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

async function upsertCurrentMembership(
  memberId: string,
  values: Omit<typeof memberships.$inferInsert, "memberId" | "id">,
) {
  const db = getMembersDb();
  const existing = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(eq(memberships.memberId, memberId))
    .limit(1);

  if (existing[0]) {
    await db
      .update(memberships)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(memberships.id, existing[0].id));
    return;
  }

  await db.insert(memberships).values({ memberId, ...values });
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
    newsletterStatus: "on",
    unsubToken: "seed-unsub-newsletter-only",
  });

  const foundingId = await upsertMember(SEED_EMAILS.founding, {
    newsletterStatus: "off",
    stripeCustomerId: "cus_seed_founding_test",
  });
  await upsertCurrentMembership(foundingId, {
    plan: "founding",
    status: "active",
    stripeSubscriptionId: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  });

  const lifetimeId = await upsertMember(SEED_EMAILS.lifetime, {
    newsletterStatus: "on",
    unsubToken: generateUnsubToken(),
    stripeCustomerId: "cus_seed_lifetime_test",
  });
  await upsertCurrentMembership(lifetimeId, {
    plan: "lifetime",
    status: "active",
    stripeSubscriptionId: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  });

  const annualId = await upsertMember(SEED_EMAILS.annual, {
    newsletterStatus: "on",
    unsubToken: "seed-unsub-annual-member",
    stripeCustomerId: "cus_seed_annual_test",
  });
  await upsertCurrentMembership(annualId, {
    plan: "annual",
    status: "active",
    stripeSubscriptionId: "sub_seed_annual_test",
    currentPeriodEnd: new Date(SEED_ANNUAL_PERIOD_END),
    cancelAtPeriodEnd: false,
  });

  const db = getMembersDb();

  await db.insert(otpChallenges).values({
    email: SEED_EMAILS.annual,
    codeHash: hashOtpCode("123456"),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  void newsletterOnlyId;

  console.log("Seed complete:");
  console.log(`  Newsletter-only: ${SEED_EMAILS.newsletterOnly}`);
  console.log(`  Founding:        ${SEED_EMAILS.founding}`);
  console.log(`  Lifetime:        ${SEED_EMAILS.lifetime}`);
  console.log(
    `  Annual:          ${SEED_EMAILS.annual} (period end ${SEED_ANNUAL_PERIOD_END})`,
  );
  console.log("  OTP sample for annual email: 123456 (dev seed only)");
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
