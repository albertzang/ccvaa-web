import { NextResponse } from "next/server";

import { MembersEnvError } from "@/lib/members/env";
import { processStripeWebhookEvent } from "@/lib/members/join";
import { constructStripeWebhookEvent } from "@/lib/members/stripe";

/**
 * Stripe webhooks — raw body + signature; idempotent on event.id.
 * Configure endpoint: POST /api/members/webhooks/stripe (test mode on Preview).
 */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { ok: false, code: "MEMBERS_STRIPE_SIGNATURE_MISSING" },
      { status: 400 },
    );
  }

  let event;
  try {
    const payload = await request.text();
    event = constructStripeWebhookEvent(payload, signature);
  } catch (error) {
    if (error instanceof MembersEnvError) {
      return NextResponse.json(
        { ok: false, code: error.code, message: error.message },
        { status: 503 },
      );
    }
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json(
      { ok: false, code: "MEMBERS_STRIPE_SIGNATURE_INVALID" },
      { status: 400 },
    );
  }

  try {
    const result = await processStripeWebhookEvent(event);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof MembersEnvError) {
      return NextResponse.json(
        { ok: false, code: error.code, message: error.message },
        { status: 503 },
      );
    }
    console.error("Stripe webhook processing failed:", error);
    return NextResponse.json(
      { ok: false, code: "MEMBERS_STRIPE_WEBHOOK_FAILED" },
      { status: 500 },
    );
  }
}
