import { and, eq, ne, sql } from "drizzle-orm";
import type Stripe from "stripe";
import { z } from "zod";

import { getMembersDb } from "@/db/client";
import { members, stripeWebhookEvents } from "@/db/schema";
import {
  sendEmailVerifyOtp,
  verifyDeliveredOtp,
} from "@/lib/members/confirm";
import {
  MembersDbError,
  withMembersDbError,
} from "@/lib/members/errors";
import { requireDatabaseUrl } from "@/lib/members/env";
import { activateNewsletterFromVerifiedEmail } from "@/lib/members/newsletter";
import {
  createMemberSessionToken,
  requireMemberSessionSecret,
  toPublicMemberSession,
} from "@/lib/members/session";
import {
  getMemberProfileForSession,
  toPublicMemberProfile,
} from "@/lib/members/profile";
import {
  requireStripeJoinConfig,
  type StripeJoinConfig,
} from "@/lib/members/stripe-env";
import { getStripeClient } from "@/lib/members/stripe";
import {
  joinMembershipInputSchema,
  joinMembershipVerifyInputSchema,
  type JoinMembershipInput,
  type JoinPlanId,
} from "@/lib/members/zod/membership";

export type JoinPlanOffer = {
  id: JoinPlanId;
  label: string;
  description: string;
  feeCents: number;
  feeLabel: string;
  interval: "one_time" | "year";
  available: boolean;
};

export type JoinPlansResult = {
  foundingCap: number;
  foundingSeatsTaken: number;
  foundingSeatsRemaining: number;
  offeringOneTime: "founding" | "lifetime";
  plans: JoinPlanOffer[];
};

export type JoinStartResult = {
  email: string;
  plan: JoinPlanId;
  expiresAt: Date;
  message: string;
};

export type JoinVerifyResult = {
  email: string;
  plan: JoinPlanId;
  checkoutUrl: string;
};

export type JoinCheckoutSessionReady = {
  status: "ready";
  token: string;
  expiresAt: Date;
  session: ReturnType<typeof toPublicMemberSession>;
  profile: ReturnType<typeof toPublicMemberProfile>;
  message: string;
};

export type JoinCheckoutSessionPending = {
  status: "pending";
  message: string;
};

export type JoinCheckoutSessionResult =
  | JoinCheckoutSessionReady
  | JoinCheckoutSessionPending;

export class MembersJoinError extends Error {
  readonly code:
    | "MEMBERS_JOIN_UNAVAILABLE"
    | "MEMBERS_JOIN_PLAN_UNAVAILABLE"
    | "MEMBERS_ALREADY_MEMBER"
    | "MEMBERS_FOUNDING_FULL"
    | "MEMBERS_STRIPE_ERROR"
    | "MEMBERS_JOIN_CHECKOUT_INVALID";

  constructor(code: MembersJoinError["code"], message: string) {
    super(message);
    this.name = "MembersJoinError";
    this.code = code;
  }
}

export function isMembersJoinError(error: unknown): error is MembersJoinError {
  return error instanceof MembersJoinError;
}

function formatFeeCad(cents: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(cents / 100);
}

function getAppOrigin(requestUrl?: string): string {
  if (requestUrl) {
    try {
      const url = new URL(requestUrl);
      return url.origin;
    } catch {
      // fall through
    }
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel}`;
  }
  return "http://localhost:3000";
}

export async function countActiveFoundingMembers(): Promise<number> {
  return withMembersDbError(async () => {
    const db = getMembersDb();
    const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(members)
      .where(
        and(
          eq(members.membershipPlan, "founding"),
          eq(members.membershipStatus, "active"),
        ),
      );
    return rows[0]?.count ?? 0;
  }, "Failed to count founding members.");
}

export async function countActivePaidMembers(): Promise<number> {
  return withMembersDbError(async () => {
    const db = getMembersDb();
    const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(members)
      .where(eq(members.membershipStatus, "active"));
    return rows[0]?.count ?? 0;
  }, "Failed to count paid members.");
}

function buildPlanOffers(
  config: StripeJoinConfig,
  foundingTaken: number,
): JoinPlansResult {
  const remaining = Math.max(0, config.foundingCap - foundingTaken);
  const offeringOneTime: "founding" | "lifetime" =
    remaining > 0 ? "founding" : "lifetime";

  const founding: JoinPlanOffer = {
    id: "founding",
    label: "Founding",
    description:
      "One-time founding membership while seats remain. Lifetime access at the founding rate.",
    feeCents: config.foundingFeeCents,
    feeLabel: formatFeeCad(config.foundingFeeCents),
    interval: "one_time",
    available: remaining > 0,
  };

  const lifetime: JoinPlanOffer = {
    id: "lifetime",
    label: "Lifetime",
    description:
      "One-time lifetime membership. Fee is always higher than Founding.",
    feeCents: config.lifetimeFeeCents,
    feeLabel: formatFeeCad(config.lifetimeFeeCents),
    interval: "one_time",
    available: remaining <= 0,
  };

  const annual: JoinPlanOffer = {
    id: "annual",
    label: "Annual",
    description: "Renews yearly. Anniversary and next renewal come from Stripe.",
    feeCents: config.annualFeeCents,
    feeLabel: `${formatFeeCad(config.annualFeeCents)} / year`,
    interval: "year",
    available: true,
  };

  const plans =
    offeringOneTime === "founding" ? [founding, annual] : [lifetime, annual];

  return {
    foundingCap: config.foundingCap,
    foundingSeatsTaken: foundingTaken,
    foundingSeatsRemaining: remaining,
    offeringOneTime,
    plans,
  };
}

/** Public plan board for `#membership` Join UI. Fails closed without DB + Stripe env. */
export async function getJoinPlans(): Promise<JoinPlansResult> {
  requireDatabaseUrl();
  const config = requireStripeJoinConfig();
  const taken = await countActiveFoundingMembers();
  return buildPlanOffers(config, taken);
}

async function findMemberByEmail(email: string) {
  const db = getMembersDb();
  const rows = await db
    .select()
    .from(members)
    .where(eq(members.email, email))
    .limit(1);
  return rows[0] ?? null;
}

function assertPlanOffered(plan: JoinPlanId, offers: JoinPlansResult): void {
  const match = offers.plans.find((p) => p.id === plan && p.available);
  if (!match) {
    if (plan === "founding") {
      throw new MembersJoinError(
        "MEMBERS_FOUNDING_FULL",
        "Founding membership seats are full. Choose Lifetime or Annual instead.",
      );
    }
    if (plan === "lifetime" && offers.offeringOneTime === "founding") {
      throw new MembersJoinError(
        "MEMBERS_JOIN_PLAN_UNAVAILABLE",
        "Lifetime is offered after the Founding seat cap is reached.",
      );
    }
    throw new MembersJoinError(
      "MEMBERS_JOIN_PLAN_UNAVAILABLE",
      `Plan "${plan}" is not available right now.`,
    );
  }
}

function priceIdForPlan(config: StripeJoinConfig, plan: JoinPlanId): string {
  if (plan === "founding") return config.priceFounding;
  if (plan === "lifetime") return config.priceLifetime;
  return config.priceAnnual;
}

/** Starts Join: Zod-validate → plan/seat checks → email_verify OTP. */
export async function startJoin(
  input: JoinMembershipInput,
): Promise<JoinStartResult> {
  requireDatabaseUrl();
  requireStripeJoinConfig();

  const parsed = joinMembershipInputSchema.parse(input);
  const email = parsed.email.trim().toLowerCase();
  const offers = await getJoinPlans();
  assertPlanOffered(parsed.plan, offers);

  const existing = await findMemberByEmail(email);
  if (
    existing &&
    existing.membershipStatus === "active" &&
    existing.membershipPlan !== "none"
  ) {
    throw new MembersJoinError(
      "MEMBERS_ALREADY_MEMBER",
      "This email already has an active membership. Sign in from Membership instead.",
    );
  }

  const delivery = await sendEmailVerifyOtp(email);

  return {
    email,
    plan: parsed.plan,
    expiresAt: delivery.expiresAt,
    message:
      "Check your email for a 6-digit verification code, then continue to checkout.",
  };
}

/** Verifies OTP and creates a Stripe Checkout Session. Returns Stripe URL. */
export async function verifyJoinAndCreateCheckout(
  input: unknown,
  options?: { requestOrigin?: string },
): Promise<JoinVerifyResult> {
  requireDatabaseUrl();
  const config = requireStripeJoinConfig();

  const parsed = joinMembershipVerifyInputSchema.parse(input);
  const email = parsed.email.trim().toLowerCase();
  const offers = await getJoinPlans();
  assertPlanOffered(parsed.plan, offers);

  const existing = await findMemberByEmail(email);
  if (
    existing &&
    existing.membershipStatus === "active" &&
    existing.membershipPlan !== "none"
  ) {
    throw new MembersJoinError(
      "MEMBERS_ALREADY_MEMBER",
      "This email already has an active membership. Sign in from Membership instead.",
    );
  }

  await verifyDeliveredOtp({
    email,
    purpose: "email_verify",
    code: parsed.code,
  });

  const origin = getAppOrigin(options?.requestOrigin);
  const stripe = getStripeClient();
  const priceId = priceIdForPlan(config, parsed.plan);
  const mode = parsed.plan === "annual" ? "subscription" : "payment";

  const session = await stripe.checkout.sessions.create({
    mode,
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: email,
    success_url: `${origin}/?joined=1&session_id={CHECKOUT_SESSION_ID}#membership`,
    cancel_url: `${origin}/#membership`,
    metadata: {
      email,
      name: parsed.name.trim(),
      plan: parsed.plan,
      newsletterOptIn: parsed.newsletterOptIn ? "true" : "false",
    },
    ...(mode === "subscription"
      ? {
          subscription_data: {
            metadata: {
              email,
              plan: parsed.plan,
            },
          },
        }
      : {}),
  });

  if (!session.url) {
    throw new MembersJoinError(
      "MEMBERS_STRIPE_ERROR",
      "Stripe Checkout did not return a URL. Try again later.",
    );
  }

  return {
    email,
    plan: parsed.plan,
    checkoutUrl: session.url,
  };
}

const joinCheckoutSessionInputSchema = z.object({
  sessionId: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^cs_[A-Za-z0-9_]+$/, "Invalid Checkout session id."),
});

/**
 * After Stripe success return: verify paid Checkout session and mint member
 * session cookie payload. Returns pending when webhook has not activated yet.
 */
export async function establishMemberSessionFromCheckout(
  input: unknown,
): Promise<JoinCheckoutSessionResult> {
  requireDatabaseUrl();
  requireStripeJoinConfig();
  requireMemberSessionSecret();

  const parsed = joinCheckoutSessionInputSchema.parse(input);
  const stripe = getStripeClient();

  let checkout: Stripe.Checkout.Session;
  try {
    checkout = await stripe.checkout.sessions.retrieve(parsed.sessionId);
  } catch {
    throw new MembersJoinError(
      "MEMBERS_JOIN_CHECKOUT_INVALID",
      "Could not verify this Checkout session. Sign in with your membership email instead.",
    );
  }

  if (checkout.payment_status !== "paid") {
    throw new MembersJoinError(
      "MEMBERS_JOIN_CHECKOUT_INVALID",
      "Payment is not complete yet. If you were charged, wait a moment and refresh, or sign in with your email.",
    );
  }

  const email = (checkout.metadata?.email ?? checkout.customer_email ?? "")
    .trim()
    .toLowerCase();
  if (!email) {
    throw new MembersJoinError(
      "MEMBERS_JOIN_CHECKOUT_INVALID",
      "Checkout session is missing membership email metadata.",
    );
  }

  const db = getMembersDb();
  const rows = await db
    .select({
      id: members.id,
      email: members.email,
      name: members.name,
      membershipPlan: members.membershipPlan,
      membershipStatus: members.membershipStatus,
    })
    .from(members)
    .where(
      and(
        eq(members.email, email),
        eq(members.membershipStatus, "active"),
        ne(members.membershipPlan, "none"),
      ),
    )
    .limit(1);

  const member = rows[0];
  if (!member || member.membershipPlan === "none") {
    return {
      status: "pending",
      message:
        "Payment received — activating your membership. This usually takes a few seconds.",
    };
  }

  const { token, expiresAt, payload } = createMemberSessionToken({
    memberId: member.id,
    email: member.email,
    name: member.name,
    plan: member.membershipPlan as Exclude<JoinPlanId, never>,
  });

  const memberProfile = await getMemberProfileForSession(payload);

  return {
    status: "ready",
    token,
    expiresAt,
    session: toPublicMemberSession(payload),
    profile: toPublicMemberProfile(memberProfile, payload.exp),
    message: "Welcome — you are signed in to your membership.",
  };
}

function anniversaryDateString(fromUnix: number): string {
  const d = new Date(fromUnix * 1000);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function rowsFromExecute(result: unknown): unknown[] {
  if (Array.isArray(result)) {
    return result;
  }
  if (
    result &&
    typeof result === "object" &&
    "rows" in result &&
    Array.isArray((result as { rows: unknown[] }).rows)
  ) {
    return (result as { rows: unknown[] }).rows;
  }
  return [];
}

/**
 * Race-safe Founding activation: single-statement claim that only writes when
 * active founding count is still under the cap (works on Neon HTTP).
 */
async function activateFoundingMembership(params: {
  email: string;
  name: string;
  stripeCustomerId: string | null;
  foundingCap: number;
}): Promise<"activated" | "cap_full"> {
  const db = getMembersDb();
  const now = new Date();
  const existing = await findMemberByEmail(params.email);

  if (existing) {
    const claimed = await db.execute(sql`
      WITH caps AS (
        SELECT count(*)::int AS founding_count
        FROM members
        WHERE membership_plan = 'founding'
          AND membership_status = 'active'
      )
      UPDATE members AS m
      SET
        name = ${params.name},
        membership_plan = 'founding',
        membership_status = 'active',
        membership_anniversary = NULL,
        next_renewal_at = NULL,
        stripe_customer_id = ${params.stripeCustomerId},
        updated_at = ${now}
      FROM caps
      WHERE m.id = ${existing.id}::uuid
        AND caps.founding_count < ${params.foundingCap}
      RETURNING m.id
    `);
    return rowsFromExecute(claimed).length > 0 ? "activated" : "cap_full";
  }

  const inserted = await db.execute(sql`
    WITH caps AS (
      SELECT count(*)::int AS founding_count
      FROM members
      WHERE membership_plan = 'founding'
        AND membership_status = 'active'
    )
    INSERT INTO members (
      email,
      name,
      membership_plan,
      membership_status,
      membership_anniversary,
      next_renewal_at,
      stripe_customer_id,
      newsletter_status,
      created_at,
      updated_at
    )
    SELECT
      ${params.email},
      ${params.name},
      'founding',
      'active',
      NULL,
      NULL,
      ${params.stripeCustomerId},
      'off',
      ${now},
      ${now}
    FROM caps
    WHERE caps.founding_count < ${params.foundingCap}
    RETURNING id
  `);
  return rowsFromExecute(inserted).length > 0 ? "activated" : "cap_full";
}

async function activateNonFoundingMembership(params: {
  email: string;
  name: string;
  plan: "lifetime" | "annual";
  stripeCustomerId: string | null;
  membershipAnniversary: string | null;
  nextRenewalAt: Date | null;
}): Promise<void> {
  const db = getMembersDb();
  const now = new Date();
  const existing = await findMemberByEmail(params.email);

  if (existing) {
    await db
      .update(members)
      .set({
        name: params.name,
        membershipPlan: params.plan,
        membershipStatus: "active",
        membershipAnniversary: params.membershipAnniversary,
        nextRenewalAt: params.nextRenewalAt,
        stripeCustomerId: params.stripeCustomerId,
        updatedAt: now,
      })
      .where(eq(members.id, existing.id));
    return;
  }

  await db.insert(members).values({
    email: params.email,
    name: params.name,
    membershipPlan: params.plan,
    membershipStatus: "active",
    membershipAnniversary: params.membershipAnniversary,
    nextRenewalAt: params.nextRenewalAt,
    stripeCustomerId: params.stripeCustomerId,
    newsletterStatus: "off",
  });
}

async function applyNewsletterOptIn(email: string): Promise<void> {
  // Join already verified email via email_verify OTP — activate immediately
  // (no second newsletter confirm mail). Contact-only subscribe stays double opt-in.
  await activateNewsletterFromVerifiedEmail(email);
}

async function refundCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const stripe = getStripeClient();
  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  if (paymentIntent) {
    await stripe.refunds.create({ payment_intent: paymentIntent });
    return;
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;
  if (subscriptionId) {
    await stripe.subscriptions.cancel(subscriptionId);
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const config = requireStripeJoinConfig();
  const email = (session.metadata?.email ?? session.customer_email ?? "")
    .trim()
    .toLowerCase();
  const name = (session.metadata?.name ?? "").trim() || "Member";
  const plan = session.metadata?.plan as JoinPlanId | undefined;
  const newsletterOptIn = session.metadata?.newsletterOptIn === "true";

  if (!email || !plan || !["founding", "lifetime", "annual"].includes(plan)) {
    throw new MembersDbError(
      "Stripe checkout session missing email/plan metadata.",
    );
  }

  if (session.payment_status && session.payment_status !== "paid") {
    return;
  }

  const stripeCustomerId =
    typeof session.customer === "string"
      ? session.customer
      : (session.customer?.id ?? null);

  if (plan === "founding") {
    const result = await activateFoundingMembership({
      email,
      name,
      stripeCustomerId,
      foundingCap: config.foundingCap,
    });
    if (result === "cap_full") {
      console.error(
        "Founding seat race: cap reached at webhook; refunding session",
        session.id,
      );
      await refundCheckoutSession(session);
      return;
    }
  } else if (plan === "lifetime") {
    await activateNonFoundingMembership({
      email,
      name,
      plan: "lifetime",
      stripeCustomerId,
      membershipAnniversary: null,
      nextRenewalAt: null,
    });
  } else {
    let membershipAnniversary: string | null = null;
    let nextRenewalAt: Date | null = null;

    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;

    if (subscriptionId) {
      const stripe = getStripeClient();
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ["items.data"],
      });
      const firstItem = subscription.items?.data?.[0];
      const periodEnd =
        firstItem &&
        "current_period_end" in firstItem &&
        typeof firstItem.current_period_end === "number"
          ? firstItem.current_period_end
          : null;
      const anchor =
        typeof subscription.billing_cycle_anchor === "number"
          ? subscription.billing_cycle_anchor
          : periodEnd;

      if (periodEnd) {
        nextRenewalAt = new Date(periodEnd * 1000);
      }
      if (anchor) {
        membershipAnniversary = anniversaryDateString(anchor);
      }
    }

    await activateNonFoundingMembership({
      email,
      name,
      plan: "annual",
      stripeCustomerId,
      membershipAnniversary,
      nextRenewalAt,
    });
  }

  if (newsletterOptIn) {
    try {
      await applyNewsletterOptIn(email);
    } catch (error) {
      console.error("Newsletter opt-in after Join failed:", error);
    }
  }
}

/**
 * Idempotent Stripe webhook processor.
 * Claims `event.id` first; duplicates return without re-running side effects.
 */
export async function processStripeWebhookEvent(
  event: Stripe.Event,
): Promise<{ duplicate: boolean; handled: boolean }> {
  requireDatabaseUrl();
  requireStripeJoinConfig();

  const db = getMembersDb();
  const inserted = await db
    .insert(stripeWebhookEvents)
    .values({
      id: event.id,
      type: event.type,
    })
    .onConflictDoNothing()
    .returning({ id: stripeWebhookEvents.id });

  if (inserted.length === 0) {
    return { duplicate: true, handled: true };
  }

  if (event.type === "checkout.session.completed") {
    await handleCheckoutSessionCompleted(
      event.data.object as Stripe.Checkout.Session,
    );
    return { duplicate: false, handled: true };
  }

  return { duplicate: false, handled: false };
}
