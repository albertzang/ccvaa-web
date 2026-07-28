import { requireDatabaseUrl } from "@/lib/members/env";
import { getMembersDb } from "@/db/client";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getStripeClient } from "@/lib/members/stripe";
import { requireStripeJoinConfig } from "@/lib/members/stripe-env";
import type { MemberSessionPayload } from "@/lib/members/session";

export class MembersBillingPortalError extends Error {
  readonly code:
    | "MEMBERS_BILLING_NO_CUSTOMER"
    | "MEMBERS_BILLING_PORTAL_FAILED";

  constructor(
    code: MembersBillingPortalError["code"],
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message);
    this.name = "MembersBillingPortalError";
    this.code = code;
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export function isMembersBillingPortalError(
  error: unknown,
): error is MembersBillingPortalError {
  return error instanceof MembersBillingPortalError;
}

function getAppOrigin(requestUrl?: string): string {
  if (requestUrl) {
    try {
      return new URL(requestUrl).origin;
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

/**
 * Creates a Stripe Customer Portal session for any member with stripe_customer_id.
 * Return URL is `/#membership`. Fail closed without customer or Stripe.
 */
export async function createBillingPortalSession(
  session: MemberSessionPayload,
  options?: { requestOrigin?: string },
): Promise<{ url: string }> {
  requireDatabaseUrl();
  requireStripeJoinConfig();

  const db = getMembersDb();
  const rows = await db
    .select({ stripeCustomerId: members.stripeCustomerId })
    .from(members)
    .where(eq(members.id, session.memberId))
    .limit(1);

  const stripeCustomerId = rows[0]?.stripeCustomerId;
  if (!stripeCustomerId) {
    throw new MembersBillingPortalError(
      "MEMBERS_BILLING_NO_CUSTOMER",
      "No Stripe billing account is linked to this membership yet.",
    );
  }

  const origin = getAppOrigin(options?.requestOrigin);
  const stripe = getStripeClient();

  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${origin}/#membership`,
    });
    if (!portal.url) {
      throw new MembersBillingPortalError(
        "MEMBERS_BILLING_PORTAL_FAILED",
        "Stripe Customer portal did not return a URL.",
      );
    }
    return { url: portal.url };
  } catch (error) {
    if (isMembersBillingPortalError(error)) {
      throw error;
    }
    throw new MembersBillingPortalError(
      "MEMBERS_BILLING_PORTAL_FAILED",
      "Could not open Stripe Customer portal. Try again later.",
      { cause: error },
    );
  }
}
