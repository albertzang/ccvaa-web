import { Redis } from "@upstash/redis";

/**
 * Shared Upstash Redis for OTP challenges + rate limits across Vercel instances.
 * Accepts either Upstash-native names (UPSTASH_REDIS_REST_*) or Vercel Marketplace
 * KV names (KV_REST_API_*). When neither pair is set (typical local), callers fall
 * back to in-memory stores — fine for single-process `next dev`, not for Production.
 */
let client: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (client !== undefined) return client;

  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
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
