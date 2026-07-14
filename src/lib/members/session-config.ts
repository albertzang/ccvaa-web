/**
 * Member session cookie + TTL (members-0005).
 *
 * Distinct from Hover/Roundcube admin cookies — never grants `/admin`.
 *
 * OTP rate limits / expiry (shared with newsletter + Join verify):
 * - TTL: 15 minutes (`OTP_TTL_MS`)
 * - Max challenges: 3 per email + purpose per hour
 * - Max verify attempts: 5 per challenge
 * See `src/lib/members/otp-config.ts` and `docs/members/schema.md`.
 */

/** httpOnly cookie name — do not reuse for admin auth. */
export const MEMBER_SESSION_COOKIE = "ccvaa_member_session";

/** Signed member session lifetime. */
export const MEMBER_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Cookie Max-Age in seconds (matches TTL). */
export const MEMBER_SESSION_MAX_AGE_SEC = Math.floor(
  MEMBER_SESSION_TTL_MS / 1000,
);
