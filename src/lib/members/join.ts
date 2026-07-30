import { eq, sql } from "drizzle-orm";
import type Stripe from "stripe";
import { z } from "zod";

import { getMembersDb } from "@/db/client";
import { members, memberships, stripeWebhookEvents } from "@/db/schema";
import {
  sendEmailVerifyOtp,
  verifyDeliveredOtp,
} from "@/lib/members/confirm";
import { MembersDbError } from "@/lib/members/errors";
import { requireDatabaseUrl } from "@/lib/members/env";
import {
  assertMemberHasStripeCustomer,
  canJoinMembership,
  countActiveFoundingMemberships,
  countActivePaidMemberships,
  findMembershipBySubscriptionId,
  getCurrentMembership,
  isDurableStripeCustomerId,
  sessionPlanFromMembership,
  upsertCurrentMembership,
} from "@/lib/members/memberships";
import { activateNewsletterFromVerifiedEmail } from "@/lib/members/newsletter";
import {
  createMemberSessionToken,
  requireMemberSessionSecret,
  toPublicMemberSession,
  type MemberSessionPayload,
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
  joinCheckoutFromSessionSchema,
  joinMembershipInputSchema,
  joinMembershipVerifyInputSchema,
  type JoinMembershipInput,
  type JoinPlanId,
  type MembershipStatus,
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
    | "MEMBERS_JOIN_CHECKOUT_INVALID"
    | "MEMBERS_JOIN_ACTIVATION_FAILED";

  constructor(code: MembersJoinError["code"], message: string) {
    super(message);
    this.name = "MembersJoinError";
    this.code = code;
  }
}

export function isMembersJoinError(error: unknown): error is MembersJoinError {
  return error instanceof MembersJoinError;
}

export {
  countActiveFoundingMemberships as countActiveFoundingMembers,
  countActivePaidMemberships as countActivePaidMembers,
};

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
    description: `${remaining} of ${config.foundingCap} seats left. One-time lifetime access.`,
    feeCents: config.foundingFeeCents,
    feeLabel: formatFeeCad(config.foundingFeeCents),
    interval: "one_time",
    available: remaining > 0,
  };

  const lifetime: JoinPlanOffer = {
    id: "lifetime",
    label: "Lifetime",
    description: "One-time lifetime access.",
    feeCents: config.lifetimeFeeCents,
    feeLabel: formatFeeCad(config.lifetimeFeeCents),
    interval: "one_time",
    available: remaining <= 0,
  };

  const annual: JoinPlanOffer = {
    id: "annual",
    label: "Annual",
    description: "Renews yearly at your anniversary.",
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
  const taken = await countActiveFoundingMemberships();
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

async function findMemberByStripeCustomerId(stripeCustomerId: string) {
  const db = getMembersDb();
  const rows = await db
    .select()
    .from(members)
    .where(eq(members.stripeCustomerId, stripeCustomerId))
    .limit(1);
  return rows[0] ?? null;
}

async function resolveMemberForActivation(params: {
  email: string;
  stripeCustomerId: string | null;
}) {
  if (params.stripeCustomerId) {
    const byCustomer = await findMemberByStripeCustomerId(
      params.stripeCustomerId,
    );
    if (byCustomer) {
      return byCustomer;
    }
  }
  return findMemberByEmail(params.email);
}

function checkoutCustomerFields(
  email: string,
  stripeCustomerId: string | null | undefined,
  mode: "payment" | "subscription",
):
  | { customer: string }
  | { customer_email: string; customer_creation?: "always" } {
  // Reuse only durable Customers (`cus_*`). Reject Guest (`gcus_*`) / null.
  if (isDurableStripeCustomerId(stripeCustomerId)) {
    return { customer: stripeCustomerId };
  }
  // Payment-mode Checkout defaults to customer_creation: if_required and often
  // leaves session.customer null — then stripe_customer_id never persists and
  // Manage billing fails. Force a Customer for Founding/Lifetime one-time pays.
  if (mode === "payment") {
    return { customer_email: email, customer_creation: "always" };
  }
  return { customer_email: email };
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

async function assertCanJoin(email: string): Promise<void> {
  const existing = await findMemberByEmail(email);
  if (!existing) {
    return;
  }
  const current = await getCurrentMembership(existing.id);
  if (!canJoinMembership(current)) {
    throw new MembersJoinError(
      "MEMBERS_ALREADY_MEMBER",
      current?.status === "past_due"
        ? "Your membership payment is past due. Use Manage billing to update your payment method."
        : "This email already has an active membership. Sign in from Membership instead.",
    );
  }
}

export async function startJoin(
  input: JoinMembershipInput,
): Promise<JoinStartResult> {
  requireDatabaseUrl();
  requireStripeJoinConfig();

  const parsed = joinMembershipInputSchema.parse(input);
  const email = parsed.email.trim().toLowerCase();
  const offers = await getJoinPlans();
  assertPlanOffered(parsed.plan, offers);
  await assertCanJoin(email);

  const delivery = await sendEmailVerifyOtp(email);

  return {
    email,
    plan: parsed.plan,
    expiresAt: delivery.expiresAt,
    message:
      "Check your email for a 6-digit verification code, then continue to checkout.",
  };
}

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
  await assertCanJoin(email);

  await verifyDeliveredOtp({
    email,
    code: parsed.code,
  });

  const existing = await findMemberByEmail(email);
  const origin = getAppOrigin(options?.requestOrigin);
  const stripe = getStripeClient();
  const priceId = priceIdForPlan(config, parsed.plan);
  const mode = parsed.plan === "annual" ? "subscription" : "payment";

  const session = await stripe.checkout.sessions.create({
    mode,
    line_items: [{ price: priceId, quantity: 1 }],
    ...checkoutCustomerFields(email, existing?.stripeCustomerId, mode),
    success_url: `${origin}/?joined=1&session_id={CHECKOUT_SESSION_ID}#membership`,
    cancel_url: `${origin}/#membership`,
    metadata: {
      email,
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

export async function createJoinCheckoutForSession(
  session: MemberSessionPayload,
  input: unknown,
  options?: { requestOrigin?: string },
): Promise<JoinVerifyResult> {
  requireDatabaseUrl();
  const config = requireStripeJoinConfig();

  const parsed = joinCheckoutFromSessionSchema.parse(input);
  const offers = await getJoinPlans();
  assertPlanOffered(parsed.plan, offers);

  const current = await getCurrentMembership(session.memberId);
  if (!canJoinMembership(current)) {
    throw new MembersJoinError(
      "MEMBERS_ALREADY_MEMBER",
      current?.status === "past_due"
        ? "Your membership payment is past due. Use Manage billing to update your payment method."
        : "You already have an active membership.",
    );
  }

  const existing = await findMemberByEmail(session.email);
  const email = session.email;
  const origin = getAppOrigin(options?.requestOrigin);
  const stripe = getStripeClient();
  const priceId = priceIdForPlan(config, parsed.plan);
  const mode = parsed.plan === "annual" ? "subscription" : "payment";

  const checkout = await stripe.checkout.sessions.create({
    mode,
    line_items: [{ price: priceId, quantity: 1 }],
    ...checkoutCustomerFields(email, existing?.stripeCustomerId, mode),
    success_url: `${origin}/?joined=1&session_id={CHECKOUT_SESSION_ID}#membership`,
    cancel_url: `${origin}/#membership`,
    metadata: {
      email,
      plan: parsed.plan,
      newsletterOptIn: "false",
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

  if (!checkout.url) {
    throw new MembersJoinError(
      "MEMBERS_STRIPE_ERROR",
      "Stripe Checkout did not return a URL. Try again later.",
    );
  }

  return {
    email,
    plan: parsed.plan,
    checkoutUrl: checkout.url,
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
  const stripeCustomerId =
    typeof checkout.customer === "string"
      ? checkout.customer
      : (checkout.customer?.id ?? null);

  if (!email && !stripeCustomerId) {
    throw new MembersJoinError(
      "MEMBERS_JOIN_CHECKOUT_INVALID",
      "Checkout session is missing membership email metadata.",
    );
  }

  const loadActivePaidMember = async () => {
    const memberRow =
      (stripeCustomerId
        ? await findMemberByStripeCustomerId(stripeCustomerId)
        : null) ?? (email ? await findMemberByEmail(email) : null);

    if (!memberRow) {
      return null;
    }

    const current = await getCurrentMembership(memberRow.id);
    if (!current || current.status !== "active") {
      return null;
    }

    return {
      id: memberRow.id,
      email: memberRow.email,
      plan: current.plan,
    };
  };

  let member = await loadActivePaidMember();

  if (!member) {
    try {
      await handleCheckoutSessionCompleted(checkout);
    } catch (error) {
      console.error(
        "Join return: activate from Checkout session failed:",
        error,
      );
      throw new MembersJoinError(
        "MEMBERS_JOIN_ACTIVATION_FAILED",
        error instanceof Error
          ? error.message
          : "Payment was received but membership could not be activated.",
      );
    }
    member = await loadActivePaidMember();
  }

  if (!member) {
    throw new MembersJoinError(
      "MEMBERS_JOIN_ACTIVATION_FAILED",
      "Payment was received but membership could not be activated. If you were charged for a Founding seat that just filled, a refund may be in progress — contact us or try Annual/Lifetime.",
    );
  }

  const { token, expiresAt, payload } = createMemberSessionToken({
    memberId: member.id,
    email: member.email,
    plan: member.plan,
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

async function ensureMemberRow(params: {
  email: string;
  stripeCustomerId: string | null;
}): Promise<{ id: string; email: string }> {
  const db = getMembersDb();
  const now = new Date();
  const existing = await resolveMemberForActivation(params);

  const durableCustomerId = isDurableStripeCustomerId(params.stripeCustomerId)
    ? params.stripeCustomerId
    : isDurableStripeCustomerId(existing?.stripeCustomerId)
      ? existing.stripeCustomerId
      : null;

  // Persist Customer on members before any memberships write.
  if (!durableCustomerId) {
    throw new MembersDbError(
      "Join activation requires a Stripe Customer (cus_*). Guest or missing customer cannot create a membership.",
    );
  }

  if (existing) {
    await db
      .update(members)
      .set({
        stripeCustomerId: durableCustomerId,
        updatedAt: now,
      })
      .where(eq(members.id, existing.id));
    return { id: existing.id, email: existing.email };
  }

  const inserted = await db
    .insert(members)
    .values({
      email: params.email,
      newsletterStatus: "off",
      stripeCustomerId: durableCustomerId,
    })
    .returning({ id: members.id, email: members.email });

  const row = inserted[0];
  if (!row) {
    throw new MembersDbError("Failed to create member during Join activation.");
  }
  return row;
}

async function activateFoundingMembership(params: {
  email: string;
  stripeCustomerId: string | null;
  foundingCap: number;
}): Promise<"activated" | "cap_full"> {
  const db = getMembersDb();
  const now = new Date();
  const member = await ensureMemberRow({
    email: params.email,
    stripeCustomerId: params.stripeCustomerId,
  });
  // Customer must be on members before memberships insert (app + DB trigger).
  await assertMemberHasStripeCustomer(member.id);

  const current = await getCurrentMembership(member.id);
  if (current?.plan === "founding" && current.status === "active") {
    return "activated";
  }

  if (current) {
    await db
      .update(memberships)
      .set({ status: "cancelled", updatedAt: now })
      .where(eq(memberships.id, current.id));
  }

  const inserted = await db.execute(sql`
    WITH caps AS (
      SELECT count(*)::int AS founding_count
      FROM memberships
      WHERE plan = 'founding'
        AND status = 'active'
    )
    INSERT INTO memberships (
      member_id,
      plan,
      status,
      stripe_subscription_id,
      current_period_end,
      cancel_at_period_end,
      created_at,
      updated_at
    )
    SELECT
      ${member.id}::uuid,
      'founding',
      'active',
      NULL,
      NULL,
      false,
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
  plan: "lifetime" | "annual";
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd?: boolean;
}): Promise<void> {
  const member = await ensureMemberRow({
    email: params.email,
    stripeCustomerId: params.stripeCustomerId,
  });

  await upsertCurrentMembership({
    memberId: member.id,
    plan: params.plan,
    status: "active",
    stripeSubscriptionId: params.stripeSubscriptionId,
    currentPeriodEnd: params.currentPeriodEnd,
    cancelAtPeriodEnd: params.cancelAtPeriodEnd ?? false,
  });
}

async function applyNewsletterOptIn(email: string): Promise<void> {
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

function subscriptionPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const firstItem = subscription.items?.data?.[0];
  let periodEnd: number | null = null;
  if (
    firstItem &&
    "current_period_end" in firstItem &&
    typeof firstItem.current_period_end === "number"
  ) {
    periodEnd = firstItem.current_period_end;
  } else {
    const raw = (subscription as unknown as { current_period_end?: unknown })
      .current_period_end;
    if (typeof raw === "number") {
      periodEnd = raw;
    }
  }
  return periodEnd ? new Date(periodEnd * 1000) : null;
}

function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): MembershipStatus | null {
  if (status === "active" || status === "trialing") {
    return "active";
  }
  if (status === "past_due" || status === "unpaid") {
    return "past_due";
  }
  if (
    status === "canceled" ||
    status === "incomplete_expired" ||
    status === "incomplete"
  ) {
    return "cancelled";
  }
  return null;
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const config = requireStripeJoinConfig();
  const stripeCustomerId =
    typeof session.customer === "string"
      ? session.customer
      : (session.customer?.id ?? null);
  const email = (session.metadata?.email ?? session.customer_email ?? "")
    .trim()
    .toLowerCase();
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

  if (plan === "founding") {
    const result = await activateFoundingMembership({
      email,
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
      plan: "lifetime",
      stripeCustomerId,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
    });
  } else {
    let currentPeriodEnd: Date | null = null;
    let cancelAtPeriodEnd = false;
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;

    if (subscriptionId) {
      const stripe = getStripeClient();
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ["items.data"],
      });
      currentPeriodEnd = subscriptionPeriodEnd(subscription);
      cancelAtPeriodEnd = Boolean(subscription.cancel_at_period_end);
    }

    await activateNonFoundingMembership({
      email,
      plan: "annual",
      stripeCustomerId,
      stripeSubscriptionId: subscriptionId ?? null,
      currentPeriodEnd,
      cancelAtPeriodEnd,
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

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
): Promise<void> {
  const existing = await findMembershipBySubscriptionId(subscription.id);
  const mapped = mapStripeSubscriptionStatus(subscription.status);
  if (!mapped) {
    return;
  }

  const periodEnd = subscriptionPeriodEnd(subscription);
  const cancelAtPeriodEnd = Boolean(subscription.cancel_at_period_end);
  const now = new Date();

  if (existing) {
    const db = getMembersDb();
    await db
      .update(memberships)
      .set({
        status: mapped,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd,
        updatedAt: now,
      })
      .where(eq(memberships.id, existing.id));
    return;
  }

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;
  if (!customerId) {
    return;
  }
  const member = await findMemberByStripeCustomerId(customerId);
  if (!member) {
    return;
  }

  await upsertCurrentMembership({
    memberId: member.id,
    plan: "annual",
    status: mapped === "cancelled" ? "cancelled" : mapped,
    stripeSubscriptionId: subscription.id,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd,
  });
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
): Promise<void> {
  const existing = await findMembershipBySubscriptionId(subscription.id);
  if (!existing) {
    return;
  }
  const db = getMembersDb();
  await db
    .update(memberships)
    .set({
      status: "cancelled",
      cancelAtPeriodEnd: false,
      updatedAt: new Date(),
    })
    .where(eq(memberships.id, existing.id));
}

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

  if (event.type === "customer.subscription.updated") {
    await handleSubscriptionUpdated(
      event.data.object as Stripe.Subscription,
    );
    return { duplicate: false, handled: true };
  }

  if (event.type === "customer.subscription.deleted") {
    await handleSubscriptionDeleted(
      event.data.object as Stripe.Subscription,
    );
    return { duplicate: false, handled: true };
  }

  return { duplicate: false, handled: false };
}

export async function getSessionPlanForMember(
  memberId: string,
): Promise<ReturnType<typeof sessionPlanFromMembership>> {
  return sessionPlanFromMembership(await getCurrentMembership(memberId));
}
