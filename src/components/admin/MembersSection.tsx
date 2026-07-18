"use client";

import { useCallback, useEffect, useId, useState } from "react";

import { FeatureFlagSwitch } from "@/components/admin/FeatureFlagSwitch";
import type { AdminRosterMember } from "@/lib/members/zod/admin-roster";
import type {
  MembershipPlan,
  MembershipStatus,
} from "@/lib/members/zod/membership";
import type { NewsletterStatus } from "@/lib/members/zod/newsletter";

type MembersSectionProps = {
  hidden?: boolean;
};

type RosterResponse = {
  ok: true;
  members: AdminRosterMember[];
  total: number;
  limit: number;
  offset: number;
};

type ApiError = {
  ok: false;
  code: string;
  message: string;
};

const PLAN_OPTIONS = [
  { value: "all", label: "All plans" },
  { value: "none", label: "No plan" },
  { value: "founding", label: "Founding" },
  { value: "lifetime", label: "Lifetime" },
  { value: "annual", label: "Annual" },
] as const;

const NEWSLETTER_OPTIONS = [
  { value: "all", label: "All newsletter" },
  { value: "on", label: "Newsletter on" },
  { value: "off", label: "Newsletter off" },
  { value: "pending", label: "Newsletter pending" },
] as const;

const MEMBERSHIP_PLANS: MembershipPlan[] = [
  "none",
  "founding",
  "lifetime",
  "annual",
];

const MEMBERSHIP_STATUSES: MembershipStatus[] = [
  "none",
  "active",
  "cancelled",
  "past_due",
];

const NEWSLETTER_STATUSES: NewsletterStatus[] = ["off", "pending", "on"];

function formatLabel(value: string): string {
  return value.replace(/_/g, " ");
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type EditDraft = {
  name: string;
  newsletterStatus: NewsletterStatus;
  membershipPlan: MembershipPlan;
  membershipStatus: MembershipStatus;
  membershipAnniversary: string;
  nextRenewalAt: string;
};

function memberToDraft(member: AdminRosterMember): EditDraft {
  return {
    name: member.name ?? "",
    newsletterStatus: member.newsletterStatus,
    membershipPlan: member.membershipPlan,
    membershipStatus: member.membershipStatus,
    membershipAnniversary: member.membershipAnniversary ?? "",
    nextRenewalAt: member.nextRenewalAt
      ? member.nextRenewalAt.slice(0, 16)
      : "",
  };
}

export function MembersSection({ hidden = false }: MembersSectionProps) {
  const searchId = useId();
  const planFilterId = useId();
  const newsletterFilterId = useId();

  const [members, setMembers] = useState<AdminRosterMember[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] =
    useState<(typeof PLAN_OPTIONS)[number]["value"]>("all");
  const [newsletterFilter, setNewsletterFilter] =
    useState<(typeof NEWSLETTER_OPTIONS)[number]["value"]>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingMember, setEditingMember] = useState<AdminRosterMember | null>(
    null,
  );
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deletingMember, setDeletingMember] =
    useState<AdminRosterMember | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadRoster = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (planFilter !== "all") params.set("plan", planFilter);
      if (newsletterFilter !== "all") {
        params.set("newsletter", newsletterFilter);
      }

      const response = await fetch(`/api/admin/members?${params.toString()}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as RosterResponse | ApiError;
      if (!response.ok || data.ok === false) {
        throw new Error(
          data.ok === false
            ? data.message
            : "Could not load member roster.",
        );
      }
      setMembers(data.members);
      setTotal(data.total);
    } catch (err) {
      setMembers([]);
      setTotal(0);
      setError(
        err instanceof Error ? err.message : "Could not load member roster.",
      );
    } finally {
      setLoading(false);
    }
  }, [newsletterFilter, planFilter, search]);

  useEffect(() => {
    if (hidden) return;
    const timer = window.setTimeout(() => {
      void loadRoster();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [hidden, loadRoster]);

  function openEdit(member: AdminRosterMember) {
    setEditingMember(member);
    setEditDraft(memberToDraft(member));
    setEditError(null);
  }

  function closeEdit() {
    setEditingMember(null);
    setEditDraft(null);
    setEditError(null);
  }

  async function handleSaveEdit() {
    if (!editingMember || !editDraft) return;
    setSaving(true);
    setEditError(null);

    const payload: Record<string, unknown> = {
      name: editDraft.name.trim() || null,
      newsletterStatus: editDraft.newsletterStatus,
      membershipPlan: editDraft.membershipPlan,
      membershipStatus: editDraft.membershipStatus,
    };

    if (editDraft.membershipPlan === "annual") {
      payload.membershipAnniversary = editDraft.membershipAnniversary.trim()
        ? editDraft.membershipAnniversary.trim()
        : null;
      payload.nextRenewalAt = editDraft.nextRenewalAt.trim()
        ? new Date(editDraft.nextRenewalAt).toISOString()
        : null;
    }

    try {
      const response = await fetch(
        `/api/admin/members/${editingMember.id}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await response.json()) as
        | { ok: true; member: AdminRosterMember }
        | ApiError;
      if (!response.ok || data.ok === false) {
        throw new Error(
          data.ok === false ? data.message : "Could not update member.",
        );
      }
      closeEdit();
      await loadRoster();
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Could not update member.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingMember) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const response = await fetch(
        `/api/admin/members/${deletingMember.id}`,
        { method: "DELETE" },
      );
      const data = (await response.json()) as { ok: true } | ApiError;
      if (!response.ok || data.ok === false) {
        throw new Error(
          data.ok === false ? data.message : "Could not delete member.",
        );
      }
      setDeletingMember(null);
      await loadRoster();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Could not delete member.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section
      className={`flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6 ${hidden ? "hidden" : ""}`}
      aria-hidden={hidden}
    >
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-ocean-900">Members</h1>
          <p className="mt-1 text-sm text-ocean-600">
            Roster — membership plan and newsletter are separate filters.
          </p>
        </div>
        <p className="text-sm text-ocean-500">
          {loading ? "Loading…" : `${total} member${total === 1 ? "" : "s"}`}
        </p>
      </header>

      <div className="mb-4">
        <FeatureFlagSwitch
          slug="members"
          label="Members on public site"
          description="Controls the homepage membership portal, its Subscribe and Join calls to action, and public member APIs."
        />
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <label htmlFor={searchId} className="sr-only">
            Search members
          </label>
          <input
            id={searchId}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or email"
            className="w-full rounded-lg border border-ocean-200 bg-white px-3 py-2 text-sm text-ocean-900 placeholder:text-ocean-400 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
          />
        </div>
        <div>
          <label htmlFor={planFilterId} className="sr-only">
            Filter by plan
          </label>
          <select
            id={planFilterId}
            value={planFilter}
            onChange={(event) =>
              setPlanFilter(
                event.target.value as (typeof PLAN_OPTIONS)[number]["value"],
              )
            }
            className="w-full rounded-lg border border-ocean-200 bg-white px-3 py-2 text-sm text-ocean-900 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
          >
            {PLAN_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={newsletterFilterId} className="sr-only">
            Filter by newsletter
          </label>
          <select
            id={newsletterFilterId}
            value={newsletterFilter}
            onChange={(event) =>
              setNewsletterFilter(
                event.target
                  .value as (typeof NEWSLETTER_OPTIONS)[number]["value"],
              )
            }
            className="w-full rounded-lg border border-ocean-200 bg-white px-3 py-2 text-sm text-ocean-900 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
          >
            {NEWSLETTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-coral-200 bg-coral-50 px-4 py-3 text-sm text-coral-800"
        >
          {error}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-x-auto rounded-xl border border-ocean-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-ocean-100 bg-ocean-50/80 text-xs uppercase tracking-wide text-ocean-600">
            <tr>
              <th className="px-3 py-2.5 font-medium">Name</th>
              <th className="px-3 py-2.5 font-medium">Email</th>
              <th className="px-3 py-2.5 font-medium">Plan</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
              <th className="px-3 py-2.5 font-medium">Newsletter</th>
              <th className="px-3 py-2.5 font-medium">Anniversary</th>
              <th className="px-3 py-2.5 font-medium">Next renewal</th>
              <th className="px-3 py-2.5 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ocean-100">
            {!loading && members.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-8 text-center text-ocean-500"
                >
                  {error ? "Roster unavailable." : "No members match these filters."}
                </td>
              </tr>
            )}
            {members.map((member) => (
              <tr key={member.id} className="text-ocean-800">
                <td className="px-3 py-2.5">{member.name ?? "—"}</td>
                <td className="px-3 py-2.5 font-mono text-xs sm:text-sm">
                  {member.email}
                </td>
                <td className="px-3 py-2.5 capitalize">
                  {formatLabel(member.membershipPlan)}
                </td>
                <td className="px-3 py-2.5 capitalize">
                  {formatLabel(member.membershipStatus)}
                </td>
                <td className="px-3 py-2.5 capitalize">
                  {formatLabel(member.newsletterStatus)}
                </td>
                <td className="px-3 py-2.5">
                  {member.membershipPlan === "annual"
                    ? formatDate(member.membershipAnniversary)
                    : "—"}
                </td>
                <td className="px-3 py-2.5">
                  {member.membershipPlan === "annual"
                    ? formatDateTime(member.nextRenewalAt)
                    : "—"}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(member)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-ocean-700 hover:bg-ocean-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeletingMember(member);
                        setDeleteError(null);
                      }}
                      className="rounded-md px-2 py-1 text-xs font-medium text-coral-700 hover:bg-coral-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingMember && editDraft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ocean-950/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-member-title"
        >
          <div className="w-full max-w-lg rounded-2xl border border-ocean-200 bg-white p-5 shadow-xl">
            <h2
              id="edit-member-title"
              className="text-base font-semibold text-ocean-900"
            >
              Edit member
            </h2>
            <p className="mt-1 text-sm text-ocean-600">{editingMember.email}</p>

            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-ocean-700">Name</span>
                <input
                  type="text"
                  value={editDraft.name}
                  onChange={(event) =>
                    setEditDraft({ ...editDraft, name: event.target.value })
                  }
                  className="rounded-lg border border-ocean-200 px-3 py-2 text-ocean-900 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="font-medium text-ocean-700">Newsletter</span>
                <select
                  value={editDraft.newsletterStatus}
                  onChange={(event) =>
                    setEditDraft({
                      ...editDraft,
                      newsletterStatus: event.target
                        .value as NewsletterStatus,
                    })
                  }
                  className="rounded-lg border border-ocean-200 px-3 py-2 text-ocean-900 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                >
                  {NEWSLETTER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {formatLabel(status)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm">
                <span className="font-medium text-ocean-700">Plan</span>
                <select
                  value={editDraft.membershipPlan}
                  onChange={(event) =>
                    setEditDraft({
                      ...editDraft,
                      membershipPlan: event.target.value as MembershipPlan,
                    })
                  }
                  className="rounded-lg border border-ocean-200 px-3 py-2 text-ocean-900 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                >
                  {MEMBERSHIP_PLANS.map((plan) => (
                    <option key={plan} value={plan}>
                      {formatLabel(plan)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm">
                <span className="font-medium text-ocean-700">Status</span>
                <select
                  value={editDraft.membershipStatus}
                  onChange={(event) =>
                    setEditDraft({
                      ...editDraft,
                      membershipStatus: event.target
                        .value as MembershipStatus,
                    })
                  }
                  className="rounded-lg border border-ocean-200 px-3 py-2 text-ocean-900 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                >
                  {MEMBERSHIP_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {formatLabel(status)}
                    </option>
                  ))}
                </select>
              </label>

              {editDraft.membershipPlan === "annual" && (
                <>
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-ocean-700">
                      Anniversary (YYYY-MM-DD)
                    </span>
                    <input
                      type="date"
                      value={editDraft.membershipAnniversary}
                      onChange={(event) =>
                        setEditDraft({
                          ...editDraft,
                          membershipAnniversary: event.target.value,
                        })
                      }
                      className="rounded-lg border border-ocean-200 px-3 py-2 text-ocean-900 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-ocean-700">
                      Next renewal
                    </span>
                    <input
                      type="datetime-local"
                      value={editDraft.nextRenewalAt}
                      onChange={(event) =>
                        setEditDraft({
                          ...editDraft,
                          nextRenewalAt: event.target.value,
                        })
                      }
                      className="rounded-lg border border-ocean-200 px-3 py-2 text-ocean-900 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                    />
                  </label>
                </>
              )}
            </div>

            {editError && (
              <p role="alert" className="mt-3 text-sm text-coral-700">
                {editError}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ocean-700 hover:bg-ocean-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSaveEdit()}
                disabled={saving}
                className="rounded-lg bg-ocean-800 px-3 py-2 text-sm font-medium text-cream hover:bg-ocean-900 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ocean-950/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-member-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-ocean-200 bg-white p-5 shadow-xl">
            <h2
              id="delete-member-title"
              className="text-base font-semibold text-ocean-900"
            >
              Delete member?
            </h2>
            <p className="mt-2 text-sm text-ocean-700">
              This permanently removes{" "}
              <span className="font-medium">{deletingMember.email}</span> from
              the roster. Related unsubscribe tokens are removed; this cannot be
              undone.
            </p>
            {deleteError && (
              <p role="alert" className="mt-3 text-sm text-coral-700">
                {deleteError}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingMember(null)}
                disabled={deleting}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ocean-700 hover:bg-ocean-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmDelete()}
                disabled={deleting}
                className="rounded-lg bg-coral-600 px-3 py-2 text-sm font-medium text-white hover:bg-coral-700 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
