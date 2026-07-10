type Bucket = {
  timestamps: number[];
};

const globalStore = globalThis as typeof globalThis & {
  __ccvaaRateLimit?: Map<string, Bucket>;
};

function store() {
  if (!globalStore.__ccvaaRateLimit) {
    globalStore.__ccvaaRateLimit = new Map();
  }
  return globalStore.__ccvaaRateLimit;
}

function prune(bucket: Bucket, windowMs: number, now: number) {
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);
}

/**
 * Sliding-window rate limiter (in-memory).
 * Fine for single-instance / warm serverless; use Redis for multi-region production.
 */
export function checkRateLimit(options: {
  key: string;
  limit: number;
  windowMs: number;
}): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now();
  const buckets = store();
  const bucket = buckets.get(options.key) ?? { timestamps: [] };
  prune(bucket, options.windowMs, now);

  if (bucket.timestamps.length >= options.limit) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterMs = Math.max(options.windowMs - (now - oldest), 1000);
    buckets.set(options.key, bucket);
    return { ok: false, retryAfterMs };
  }

  bucket.timestamps.push(now);
  buckets.set(options.key, bucket);
  return { ok: true };
}

export function peekRateLimit(options: {
  key: string;
  limit: number;
  windowMs: number;
}): { remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const buckets = store();
  const bucket = buckets.get(options.key) ?? { timestamps: [] };
  prune(bucket, options.windowMs, now);
  buckets.set(options.key, bucket);

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
