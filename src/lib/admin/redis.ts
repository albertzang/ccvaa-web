import { Redis } from "@upstash/redis";

/**
 * Shared Upstash Redis for OTP challenges + rate limits across Vercel instances.
 * When UPSTASH_REDIS_REST_URL / TOKEN are unset (typical local), callers fall back
 * to in-memory stores — fine for single-process `next dev`, not for Production.
 */
let client: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (client !== undefined) return client;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    client = new Redis({ url, token });
  } else {
    client = null;
  }
  return client;
}

export function hasSharedRedis(): boolean {
  return getRedis() !== null;
}
