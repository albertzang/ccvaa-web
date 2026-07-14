import { MembersEnvError } from "@/lib/members/env";

/**
 * Stripe Join config (members-0004).
 * Test keys on Dev/Preview; live keys on Production (members-0009).
 * Fail closed when any required value is missing or Lifetime fee ≤ Founding.
 */

export type StripeJoinConfig = {
  secretKey: string;
  webhookSecret: string;
  foundingCap: number;
  foundingFeeCents: number;
  lifetimeFeeCents: number;
  annualFeeCents: number;
  priceFounding: string;
  priceLifetime: string;
  priceAnnual: string;
};

function requirePositiveInt(name: string, raw: string | undefined): number {
  const trimmed = raw?.trim();
  if (!trimmed) {
    throw new MembersEnvError(
      `${name} is not configured. Set membership fees/cap in .env.local (Dev) or Vercel env (Preview/Production).`,
    );
  }
  const value = Number(trimmed);
  if (!Number.isInteger(value) || value <= 0) {
    throw new MembersEnvError(
      `${name} must be a positive integer (got "${trimmed}").`,
    );
  }
  return value;
}

function requireNonEmpty(name: string, raw: string | undefined): string {
  const trimmed = raw?.trim();
  if (!trimmed) {
    throw new MembersEnvError(
      `${name} is not configured. Stripe Join is unavailable.`,
    );
  }
  return trimmed;
}

export function isStripeJoinConfigured(): boolean {
  try {
    requireStripeJoinConfig();
    return true;
  } catch {
    return false;
  }
}

export function requireStripeJoinConfig(): StripeJoinConfig {
  const secretKey = requireNonEmpty(
    "STRIPE_SECRET_KEY",
    process.env.STRIPE_SECRET_KEY,
  );
  const webhookSecret = requireNonEmpty(
    "STRIPE_WEBHOOK_SECRET",
    process.env.STRIPE_WEBHOOK_SECRET,
  );
  const priceFounding = requireNonEmpty(
    "STRIPE_PRICE_FOUNDING",
    process.env.STRIPE_PRICE_FOUNDING,
  );
  const priceLifetime = requireNonEmpty(
    "STRIPE_PRICE_LIFETIME",
    process.env.STRIPE_PRICE_LIFETIME,
  );
  const priceAnnual = requireNonEmpty(
    "STRIPE_PRICE_ANNUAL",
    process.env.STRIPE_PRICE_ANNUAL,
  );
  const foundingCap = requirePositiveInt(
    "MEMBERSHIP_FOUNDING_CAP",
    process.env.MEMBERSHIP_FOUNDING_CAP,
  );
  const foundingFeeCents = requirePositiveInt(
    "MEMBERSHIP_FOUNDING_FEE_CENTS",
    process.env.MEMBERSHIP_FOUNDING_FEE_CENTS,
  );
  const lifetimeFeeCents = requirePositiveInt(
    "MEMBERSHIP_LIFETIME_FEE_CENTS",
    process.env.MEMBERSHIP_LIFETIME_FEE_CENTS,
  );
  const annualFeeCents = requirePositiveInt(
    "MEMBERSHIP_ANNUAL_FEE_CENTS",
    process.env.MEMBERSHIP_ANNUAL_FEE_CENTS,
  );

  if (lifetimeFeeCents <= foundingFeeCents) {
    throw new MembersEnvError(
      `MEMBERSHIP_LIFETIME_FEE_CENTS (${lifetimeFeeCents}) must be greater than MEMBERSHIP_FOUNDING_FEE_CENTS (${foundingFeeCents}).`,
    );
  }

  return {
    secretKey,
    webhookSecret,
    foundingCap,
    foundingFeeCents,
    lifetimeFeeCents,
    annualFeeCents,
    priceFounding,
    priceLifetime,
    priceAnnual,
  };
}
