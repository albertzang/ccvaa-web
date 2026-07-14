/** OTP challenge lifetime — matches seed script sample (15 minutes). */
export const OTP_TTL_MS = 15 * 60 * 1000;

/** Max verify attempts per challenge before it is locked. */
export const OTP_MAX_VERIFY_ATTEMPTS = 5;

/** Max new challenges per email + purpose within the rate-limit window. */
export const OTP_MAX_CHALLENGES_PER_WINDOW = 3;

/** Rolling window for challenge creation rate limits. */
export const OTP_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
