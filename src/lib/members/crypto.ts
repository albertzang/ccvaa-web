import { createHash, randomBytes, randomInt } from "node:crypto";

/** SHA-256 hex digest of a 6-digit OTP (stored in `otp_challenges.code_hash`). */
export function hashOtpCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

/** Cryptographically random 6-digit OTP string. */
export function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** URL-safe token for newsletter unsubscribe links (`/?unsub=<token>#contact`). */
export function generateUnsubToken(): string {
  return randomBytes(24).toString("base64url");
}
