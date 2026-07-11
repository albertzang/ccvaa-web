import { Redis } from "@upstash/redis";

/**
 * Shared Upstash Redis (via Vercel Marketplace KV REST env) for OTP challenges
 * + rate limits across Vercel instances.
 * Requires KV_REST_API_URL + KV_REST_API_TOKEN. When unset (typical local),
 * callers fall back to in-memory stores — fine for single-process `next dev`,
 * not for Production/Preview.
 */
let client: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (client !== undefined) return client;

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
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
