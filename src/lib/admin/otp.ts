import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import {
  ADMIN_OTP_LENGTH,
  ADMIN_OTP_TTL_MS,
  OTP_VERIFY_MAX_ATTEMPTS,
} from "@/lib/admin/constants";

type OtpChallenge = {
  hash: string;
  expiresAt: number;
  attempts: number;
};

const globalStore = globalThis as typeof globalThis & {
  __ccvaaOtpChallenges?: Map<string, OtpChallenge>;
};

function challenges() {
  if (!globalStore.__ccvaaOtpChallenges) {
    globalStore.__ccvaaOtpChallenges = new Map();
  }
  return globalStore.__ccvaaOtpChallenges;
}

function hashOtp(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export function generateOtpCode() {
  const max = 10 ** ADMIN_OTP_LENGTH;
  return String(randomInt(0, max)).padStart(ADMIN_OTP_LENGTH, "0");
}

export function createOtpChallenge(key: string, code: string) {
  challenges().set(key, {
    hash: hashOtp(code),
    expiresAt: Date.now() + ADMIN_OTP_TTL_MS,
    attempts: 0,
  });
}

export function verifyOtpChallenge(
  key: string,
  code: string,
):
  | { ok: true }
  | { ok: false; reason: "missing" | "expired" | "locked" | "invalid" } {
  const challenge = challenges().get(key);
  if (!challenge) return { ok: false, reason: "missing" };

  if (Date.now() > challenge.expiresAt) {
    challenges().delete(key);
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
    challenges().set(key, challenge);
    if (challenge.attempts >= OTP_VERIFY_MAX_ATTEMPTS) {
      return { ok: false, reason: "locked" };
    }
    return { ok: false, reason: "invalid" };
  }

  challenges().delete(key);
  return { ok: true };
}

export function clearOtpChallenge(key: string) {
  challenges().delete(key);
}
