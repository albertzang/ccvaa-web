import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";

import { getMembersDb } from "@/db/client";
import { members } from "@/db/schema";
import { withMembersDbError } from "@/lib/members/errors";
import { requireDatabaseUrl } from "@/lib/members/env";
import {
  assertAnnualRenewalConsistency,
  type MembershipPlan,
} from "@/lib/members/zod/membership";
import {
  adminRosterListQuerySchema,
  adminRosterUpdateSchema,
  type AdminRosterMember,
} from "@/lib/members/zod/admin-roster";

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

function formatAnniversary(value: string | Date | null): string | null {
  if (value === null) {
    return null;
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return value;
}

function formatTimestamp(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function rowToRosterMember(row: typeof members.$inferSelect): AdminRosterMember {
  const isAnnual = row.membershipPlan === "annual";
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    newsletterStatus: row.newsletterStatus,
    newsletterConfirmedAt: formatTimestamp(row.newsletterConfirmedAt),
    membershipPlan: row.membershipPlan,
    membershipStatus: row.membershipStatus,
    membershipAnniversary: isAnnual
      ? formatAnniversary(row.membershipAnniversary)
      : null,
    nextRenewalAt: isAnnual ? formatTimestamp(row.nextRenewalAt) : null,
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
    clauses.push(
      or(ilike(members.email, pattern), ilike(members.name, pattern))!,
    );
  }

  if (query.plan !== "all") {
    clauses.push(eq(members.membershipPlan, query.plan));
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

    const [totalRow] = await db
      .select({ total: count() })
      .from(members)
      .where(where);

    const rows = await db
      .select()
      .from(members)
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

function resolveUpdatedPlan(
  current: MembershipPlan,
  patch: ReturnType<typeof adminRosterUpdateSchema.parse>,
): MembershipPlan {
  return patch.membershipPlan ?? current;
}

/** Updates a roster member. Validates annual renewal consistency on the resulting plan. */
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

    const nextPlan = resolveUpdatedPlan(existing.membershipPlan, patch);
    const nextAnniversary =
      patch.membershipAnniversary !== undefined
        ? patch.membershipAnniversary
        : formatAnniversary(existing.membershipAnniversary);
    const nextRenewal =
      patch.nextRenewalAt !== undefined
        ? patch.nextRenewalAt
        : formatTimestamp(existing.nextRenewalAt);

    assertAnnualRenewalConsistency(nextPlan, {
      membershipAnniversary: nextAnniversary
        ? new Date(nextAnniversary)
        : null,
      nextRenewalAt: nextRenewal ? new Date(nextRenewal) : null,
    });

    const updates: Partial<typeof members.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (patch.name !== undefined) {
      updates.name = patch.name;
    }
    if (patch.newsletterStatus !== undefined) {
      updates.newsletterStatus = patch.newsletterStatus;
    }
    if (patch.membershipPlan !== undefined) {
      updates.membershipPlan = patch.membershipPlan;
    }
    if (patch.membershipStatus !== undefined) {
      updates.membershipStatus = patch.membershipStatus;
    }

    if (nextPlan === "annual") {
      if (patch.membershipAnniversary !== undefined) {
        updates.membershipAnniversary = patch.membershipAnniversary;
      }
      if (patch.nextRenewalAt !== undefined) {
        updates.nextRenewalAt = patch.nextRenewalAt
          ? new Date(patch.nextRenewalAt)
          : null;
      }
    } else {
      updates.membershipAnniversary = null;
      updates.nextRenewalAt = null;
    }

    const db = getMembersDb();
    const updated = await db
      .update(members)
      .set(updates)
      .where(eq(members.id, memberId))
      .returning();

    const row = updated[0];
    if (!row) {
      throw new AdminRosterError(
        "ADMIN_ROSTER_NOT_FOUND",
        "Member not found.",
      );
    }

    return rowToRosterMember(row);
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
