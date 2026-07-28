import { and, eq, inArray, sql } from "drizzle-orm";

import { getMembersDb } from "@/db/client";
import { memberships, type Membership } from "@/db/schema";
import { withMembersDbError } from "@/lib/members/errors";
import type {
  MembershipPlan,
  MembershipStatus,
  PaidMembershipPlan,
} from "@/lib/members/zod/membership";

/** Current = active or past_due (≤1 per member via partial unique index). */
export async function getCurrentMembership(
  memberId: string,
): Promise<Membership | null> {
  return withMembersDbError(async () => {
    const db = getMembersDb();
    const rows = await db
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.memberId, memberId),
          inArray(memberships.status, ["active", "past_due"]),
        ),
      )
      .limit(1);
    return rows[0] ?? null;
  }, "Failed to load current membership.");
}

export function sessionPlanFromMembership(
  row: Membership | null,
): MembershipPlan {
  return row ? row.plan : "none";
}

export function perksActive(row: Membership | null): boolean {
  return row?.status === "active";
}

/** Join when there is no current (active/past_due) membership. */
export function canJoinMembership(row: Membership | null): boolean {
  return row === null;
}

export async function countActiveFoundingMemberships(): Promise<number> {
  return withMembersDbError(async () => {
    const db = getMembersDb();
    const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(memberships)
      .where(
        and(
          eq(memberships.plan, "founding"),
          eq(memberships.status, "active"),
        ),
      );
    return rows[0]?.count ?? 0;
  }, "Failed to count founding members.");
}

export async function countActivePaidMemberships(): Promise<number> {
  return withMembersDbError(async () => {
    const db = getMembersDb();
    const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(memberships)
      .where(eq(memberships.status, "active"));
    return rows[0]?.count ?? 0;
  }, "Failed to count paid members.");
}

export async function findMembershipBySubscriptionId(
  stripeSubscriptionId: string,
): Promise<Membership | null> {
  return withMembersDbError(async () => {
    const db = getMembersDb();
    const rows = await db
      .select()
      .from(memberships)
      .where(eq(memberships.stripeSubscriptionId, stripeSubscriptionId))
      .limit(1);
    return rows[0] ?? null;
  }, "Failed to look up membership by subscription id.");
}

/**
 * Cancels any current (active/past_due) row before inserting a new current one.
 * Used when activating a fresh Join after a prior cancelled/past period.
 */
export async function cancelCurrentMemberships(
  memberId: string,
): Promise<void> {
  const db = getMembersDb();
  const now = new Date();
  await db
    .update(memberships)
    .set({ status: "cancelled", updatedAt: now })
    .where(
      and(
        eq(memberships.memberId, memberId),
        inArray(memberships.status, ["active", "past_due"]),
      ),
    );
}

export type UpsertCurrentMembershipInput = {
  memberId: string;
  plan: PaidMembershipPlan;
  status?: MembershipStatus;
  stripeSubscriptionId?: string | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
};

/**
 * Ensures one current membership row: updates existing current of same plan
 * family, or cancels current and inserts a new row.
 */
export async function upsertCurrentMembership(
  input: UpsertCurrentMembershipInput,
): Promise<Membership> {
  return withMembersDbError(async () => {
    const db = getMembersDb();
    const now = new Date();
    const status = input.status ?? "active";
    const current = await getCurrentMembership(input.memberId);

    if (current) {
      const [updated] = await db
        .update(memberships)
        .set({
          plan: input.plan,
          status,
          stripeSubscriptionId:
            input.stripeSubscriptionId !== undefined
              ? input.stripeSubscriptionId
              : current.stripeSubscriptionId,
          currentPeriodEnd:
            input.currentPeriodEnd !== undefined
              ? input.currentPeriodEnd
              : current.currentPeriodEnd,
          cancelAtPeriodEnd:
            input.cancelAtPeriodEnd !== undefined
              ? input.cancelAtPeriodEnd
              : current.cancelAtPeriodEnd,
          updatedAt: now,
        })
        .where(eq(memberships.id, current.id))
        .returning();
      if (!updated) {
        throw new Error("Failed to update current membership.");
      }
      return updated;
    }

    const [inserted] = await db
      .insert(memberships)
      .values({
        memberId: input.memberId,
        plan: input.plan,
        status,
        stripeSubscriptionId: input.stripeSubscriptionId ?? null,
        currentPeriodEnd: input.currentPeriodEnd ?? null,
        cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
      })
      .returning();
    if (!inserted) {
      throw new Error("Failed to create membership.");
    }
    return inserted;
  }, "Failed to upsert membership.");
}
