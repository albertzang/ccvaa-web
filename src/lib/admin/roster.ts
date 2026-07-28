import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  type SQL,
} from "drizzle-orm";

import { getMembersDb } from "@/db/client";
import { members, memberships } from "@/db/schema";
import { withMembersDbError } from "@/lib/members/errors";
import { requireDatabaseUrl } from "@/lib/members/env";
import {
  cancelCurrentMemberships,
  getCurrentMembership,
  upsertCurrentMembership,
} from "@/lib/members/memberships";
import {
  adminRosterListQuerySchema,
  adminRosterUpdateSchema,
  type AdminRosterMember,
} from "@/lib/members/zod/admin-roster";
import type { PaidMembershipPlan } from "@/lib/members/zod/membership";

export class AdminRosterError extends Error {
  readonly code: "ADMIN_ROSTER_NOT_FOUND" | "ADMIN_ROSTER_INVALID";

  constructor(
    code: AdminRosterError["code"],
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message);
    this.name = "AdminRosterError";
    this.code = code;
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export function isAdminRosterError(error: unknown): error is AdminRosterError {
  return (
    error instanceof AdminRosterError ||
    (typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as { name: unknown }).name === "AdminRosterError" &&
      "code" in error &&
      typeof (error as { code: unknown }).code === "string")
  );
}

function formatTimestamp(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

type RosterRow = {
  id: string;
  email: string;
  newsletterStatus: "off" | "on";
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  membershipPlan: PaidMembershipPlan | null;
  membershipStatus: "active" | "past_due" | "cancelled" | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean | null;
};

function rowToRosterMember(row: RosterRow): AdminRosterMember {
  const plan = row.membershipPlan ?? "none";
  const status = row.membershipStatus ?? "none";
  return {
    id: row.id,
    email: row.email,
    newsletterStatus: row.newsletterStatus,
    membershipPlan: plan,
    membershipStatus: status,
    currentPeriodEnd:
      plan === "annual" ? formatTimestamp(row.currentPeriodEnd) : null,
    cancelAtPeriodEnd: row.cancelAtPeriodEnd ?? false,
    stripeCustomerId: row.stripeCustomerId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function buildListFilters(
  query: ReturnType<typeof adminRosterListQuerySchema.parse>,
): SQL | undefined {
  const clauses: SQL[] = [];

  if (query.q) {
    const pattern = `%${query.q.replace(/[%_\\]/g, "\\$&")}%`;
    clauses.push(ilike(members.email, pattern));
  }

  if (query.plan === "none") {
    clauses.push(isNull(memberships.id));
  } else if (query.plan !== "all") {
    clauses.push(eq(memberships.plan, query.plan));
  }

  if (query.newsletter !== "all") {
    clauses.push(eq(members.newsletterStatus, query.newsletter));
  }

  if (clauses.length === 0) {
    return undefined;
  }

  return and(...clauses);
}

/** Lists members for the admin roster with search and separate plan/newsletter filters. */
export async function listAdminRoster(input: unknown) {
  requireDatabaseUrl();
  const query = adminRosterListQuerySchema.parse(input);
  const where = buildListFilters(query);

  return withMembersDbError(async () => {
    const db = getMembersDb();

    const currentJoin = and(
      eq(memberships.memberId, members.id),
      inArray(memberships.status, ["active", "past_due"]),
    );

    const [totalRow] = await db
      .select({ total: count() })
      .from(members)
      .leftJoin(memberships, currentJoin)
      .where(where);

    const rows = await db
      .select({
        id: members.id,
        email: members.email,
        newsletterStatus: members.newsletterStatus,
        stripeCustomerId: members.stripeCustomerId,
        createdAt: members.createdAt,
        updatedAt: members.updatedAt,
        membershipPlan: memberships.plan,
        membershipStatus: memberships.status,
        currentPeriodEnd: memberships.currentPeriodEnd,
        cancelAtPeriodEnd: memberships.cancelAtPeriodEnd,
      })
      .from(members)
      .leftJoin(memberships, currentJoin)
      .where(where)
      .orderBy(desc(members.updatedAt), asc(members.email))
      .limit(query.limit)
      .offset(query.offset);

    return {
      members: rows.map(rowToRosterMember),
      total: Number(totalRow?.total ?? 0),
      limit: query.limit,
      offset: query.offset,
    };
  }, "Failed to load admin roster.");
}

async function loadMemberById(memberId: string) {
  const db = getMembersDb();
  const rows = await db
    .select()
    .from(members)
    .where(eq(members.id, memberId))
    .limit(1);
  return rows[0] ?? null;
}

/** Updates a roster member identity/newsletter and/or current membership row. */
export async function updateAdminRosterMember(memberId: string, input: unknown) {
  requireDatabaseUrl();
  const patch = adminRosterUpdateSchema.parse(input);

  return withMembersDbError(async () => {
    const existing = await loadMemberById(memberId);
    if (!existing) {
      throw new AdminRosterError(
        "ADMIN_ROSTER_NOT_FOUND",
        "Member not found.",
      );
    }

    const db = getMembersDb();
    const now = new Date();

    if (patch.newsletterStatus !== undefined) {
      await db
        .update(members)
        .set({ newsletterStatus: patch.newsletterStatus, updatedAt: now })
        .where(eq(members.id, memberId));
    }

    const clearingPlan =
      patch.membershipPlan === "none" || patch.membershipStatus === "none";

    if (clearingPlan) {
      await cancelCurrentMemberships(memberId);
    } else if (
      patch.membershipPlan !== undefined ||
      patch.membershipStatus !== undefined ||
      patch.currentPeriodEnd !== undefined ||
      patch.cancelAtPeriodEnd !== undefined
    ) {
      const current = await getCurrentMembership(memberId);
      const nextPlan =
        patch.membershipPlan && patch.membershipPlan !== "none"
          ? patch.membershipPlan
          : current?.plan;
      const nextStatus =
        patch.membershipStatus && patch.membershipStatus !== "none"
          ? patch.membershipStatus
          : (current?.status ?? "active");

      if (!nextPlan) {
        throw new AdminRosterError(
          "ADMIN_ROSTER_INVALID",
          "Set a membership plan when assigning membership status.",
        );
      }

      await upsertCurrentMembership({
        memberId,
        plan: nextPlan,
        status: nextStatus,
        currentPeriodEnd:
          nextPlan === "annual"
            ? patch.currentPeriodEnd !== undefined
              ? patch.currentPeriodEnd
                ? new Date(patch.currentPeriodEnd)
                : null
              : (current?.currentPeriodEnd ?? null)
            : null,
        cancelAtPeriodEnd:
          patch.cancelAtPeriodEnd !== undefined
            ? patch.cancelAtPeriodEnd
            : (current?.cancelAtPeriodEnd ?? false),
        stripeSubscriptionId: current?.stripeSubscriptionId ?? null,
      });
    }

    const refreshed = await loadMemberById(memberId);
    if (!refreshed) {
      throw new AdminRosterError(
        "ADMIN_ROSTER_NOT_FOUND",
        "Member not found.",
      );
    }
    const current = await getCurrentMembership(memberId);
    return rowToRosterMember({
      id: refreshed.id,
      email: refreshed.email,
      newsletterStatus: refreshed.newsletterStatus,
      stripeCustomerId: refreshed.stripeCustomerId,
      createdAt: refreshed.createdAt,
      updatedAt: refreshed.updatedAt,
      membershipPlan: current?.plan ?? null,
      membershipStatus: current?.status ?? null,
      currentPeriodEnd: current?.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: current?.cancelAtPeriodEnd ?? null,
    });
  }, "Failed to update member.");
}

/** Deletes a roster member and cascades related rows per schema. */
export async function deleteAdminRosterMember(memberId: string) {
  requireDatabaseUrl();

  return withMembersDbError(async () => {
    const existing = await loadMemberById(memberId);
    if (!existing) {
      throw new AdminRosterError(
        "ADMIN_ROSTER_NOT_FOUND",
        "Member not found.",
      );
    }

    const db = getMembersDb();
    await db.delete(members).where(eq(members.id, memberId));

    return { deletedId: memberId, email: existing.email };
  }, "Failed to delete member.");
}
