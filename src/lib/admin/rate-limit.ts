import { getRedis } from "@/lib/admin/redis";

type Bucket = {
  timestamps: number[];
};

const RATE_KEY_PREFIX = "ccvaa:rl:";

const globalStore = globalThis as typeof globalThis & {
  __ccvaaRateLimit?: Map<string, Bucket>;
};

function memoryStore() {
  if (!globalStore.__ccvaaRateLimit) {
    globalStore.__ccvaaRateLimit = new Map();
  }
  return globalStore.__ccvaaRateLimit;
}

function redisKey(key: string) {
  return `${RATE_KEY_PREFIX}${key}`;
}

function prune(bucket: Bucket, windowMs: number, now: number) {
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);
}

async function readBucket(key: string): Promise<Bucket> {
  const redis = getRedis();
  if (redis) {
    const value = await redis.get<Bucket>(redisKey(key));
    return value ?? { timestamps: [] };
  }
  return memoryStore().get(key) ?? { timestamps: [] };
}

async function writeBucket(key: string, bucket: Bucket, windowMs: number) {
  const redis = getRedis();
  if (redis) {
    const ttlSec = Math.max(1, Math.ceil(windowMs / 1000));
    await redis.set(redisKey(key), bucket, { ex: ttlSec });
    return;
  }
  memoryStore().set(key, bucket);
}

/**
 * Sliding-window rate limiter.
 * Uses Upstash Redis when configured (shared across Vercel instances);
 * otherwise in-memory (local / single-instance only).
 */
export async function checkRateLimit(options: {
  key: string;
  limit: number;
  windowMs: number;
}): Promise<{ ok: true } | { ok: false; retryAfterMs: number }> {
  const now = Date.now();
  const bucket = await readBucket(options.key);
  prune(bucket, options.windowMs, now);

  if (bucket.timestamps.length >= options.limit) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterMs = Math.max(options.windowMs - (now - oldest), 1000);
    await writeBucket(options.key, bucket, options.windowMs);
    return { ok: false, retryAfterMs };
  }

  bucket.timestamps.push(now);
  await writeBucket(options.key, bucket, options.windowMs);
  return { ok: true };
}

export async function peekRateLimit(options: {
  key: string;
  limit: number;
  windowMs: number;
}): Promise<{ remaining: number; retryAfterMs: number }> {
  const now = Date.now();
  const bucket = await readBucket(options.key);
  prune(bucket, options.windowMs, now);
  await writeBucket(options.key, bucket, options.windowMs);

  if (bucket.timestamps.length >= options.limit) {
    const oldest = bucket.timestamps[0] ?? now;
    return {
      remaining: 0,
      retryAfterMs: Math.max(options.windowMs - (now - oldest), 1000),
    };
  }

  return {
    remaining: options.limit - bucket.timestamps.length,
    retryAfterMs: 0,
  };
}
