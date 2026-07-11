import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import {
  ADMIN_OTP_LENGTH,
  ADMIN_OTP_TTL_MS,
  OTP_VERIFY_MAX_ATTEMPTS,
} from "@/lib/admin/constants";
import { getRedis } from "@/lib/admin/redis";

type OtpChallenge = {
  hash: string;
  expiresAt: number;
  attempts: number;
};

const OTP_KEY_PREFIX = "ccvaa:otp:";

const globalStore = globalThis as typeof globalThis & {
  __ccvaaOtpChallenges?: Map<string, OtpChallenge>;
};

function memoryChallenges() {
  if (!globalStore.__ccvaaOtpChallenges) {
    globalStore.__ccvaaOtpChallenges = new Map();
  }
  return globalStore.__ccvaaOtpChallenges;
}

function redisKey(key: string) {
  return `${OTP_KEY_PREFIX}${key}`;
}

function hashOtp(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

function ttlSecondsFrom(expiresAt: number) {
  return Math.max(1, Math.ceil((expiresAt - Date.now()) / 1000));
}

async function readChallenge(key: string): Promise<OtpChallenge | null> {
  const redis = getRedis();
  if (redis) {
    const value = await redis.get<OtpChallenge>(redisKey(key));
    return value ?? null;
  }
  return memoryChallenges().get(key) ?? null;
}

async function writeChallenge(key: string, challenge: OtpChallenge) {
  const redis = getRedis();
  if (redis) {
    await redis.set(redisKey(key), challenge, {
      ex: ttlSecondsFrom(challenge.expiresAt),
    });
    return;
  }
  memoryChallenges().set(key, challenge);
}

async function deleteChallenge(key: string) {
  const redis = getRedis();
  if (redis) {
    await redis.del(redisKey(key));
    return;
  }
  memoryChallenges().delete(key);
}

export function generateOtpCode() {
  const max = 10 ** ADMIN_OTP_LENGTH;
  return String(randomInt(0, max)).padStart(ADMIN_OTP_LENGTH, "0");
}

export async function createOtpChallenge(key: string, code: string) {
  await writeChallenge(key, {
    hash: hashOtp(code),
    expiresAt: Date.now() + ADMIN_OTP_TTL_MS,
    attempts: 0,
  });
}

export async function verifyOtpChallenge(
  key: string,
  code: string,
): Promise<
  { ok: true } | { ok: false; reason: "missing" | "expired" | "locked" | "invalid" }
> {
  const challenge = await readChallenge(key);
  if (!challenge) return { ok: false, reason: "missing" };

  if (Date.now() > challenge.expiresAt) {
    await deleteChallenge(key);
    return { ok: false, reason: "expired" };
  }

  if (challenge.attempts >= OTP_VERIFY_MAX_ATTEMPTS) {
    return { ok: false, reason: "locked" };
  }

  challenge.attempts += 1;
  const candidate = hashOtp(code);
  const a = Buffer.from(challenge.hash, "hex");
  const b = Buffer.from(candidate, "hex");

  const match = a.length === b.length && timingSafeEqual(a, b);
  if (!match) {
    await writeChallenge(key, challenge);
    if (challenge.attempts >= OTP_VERIFY_MAX_ATTEMPTS) {
      return { ok: false, reason: "locked" };
    }
    return { ok: false, reason: "invalid" };
  }

  await deleteChallenge(key);
  return { ok: true };
}

export async function clearOtpChallenge(key: string) {
  await deleteChallenge(key);
}
