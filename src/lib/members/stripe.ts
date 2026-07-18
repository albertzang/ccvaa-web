import Stripe from "stripe";

import { requireStripeJoinConfig } from "@/lib/members/stripe-env";

let cachedStripe: Stripe | null = null;

/** Stripe SDK client — requires STRIPE_SECRET_KEY. */
export function getStripeClient(): Stripe {
  if (cachedStripe) {
    return cachedStripe;
  }
  const { secretKey } = requireStripeJoinConfig();
  cachedStripe = new Stripe(secretKey);
  return cachedStripe;
}

export function resetStripeClientCache(): void {
  cachedStripe = null;
}

export function constructStripeWebhookEvent(
  payload: string | Buffer,
  signature: string,
): Stripe.Event {
  const { webhookSecret } = requireStripeJoinConfig();
  return getStripeClient().webhooks.constructEvent(
    payload,
    signature,
    webhookSecret,
  );
}
