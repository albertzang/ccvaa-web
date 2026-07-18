/**
 * ESP (email service provider) preference sync — stub until CEO chooses a provider.
 *
 * Neon remains the source of truth for newsletter status. When ESP env is present,
 * a future ticket (members-0009) will replace this stub with real API calls.
 *
 * Unsubscribe footer URL for ESP templates:
 *   {SITE_ORIGIN}/?unsub={UNSUB_TOKEN}#membership
 * See docs/members/esp.md.
 */

export type EspSyncStatus = "on" | "off";

export type EspSyncResult =
  | { ok: true; configured: false; skipped: true }
  | { ok: true; configured: true }
  | { ok: false; configured: true; message: string };

export function isEspConfigured(): boolean {
  return Boolean(
    process.env.ESP_API_KEY?.trim() && process.env.ESP_LIST_ID?.trim(),
  );
}

/**
 * Syncs newsletter on/off to the ESP when configured. No-op stub otherwise.
 * Failures are logged but do not block Neon updates (Neon is canonical).
 */
export async function syncNewsletterToEsp(input: {
  email: string;
  status: EspSyncStatus;
}): Promise<EspSyncResult> {
  if (!isEspConfigured()) {
    return { ok: true, configured: false, skipped: true };
  }

  // Stub — real provider integration lands in members-0009.
  if (process.env.NODE_ENV !== "test") {
    console.info(
      `[ESP stub] Would sync ${input.email} newsletter preference to "${input.status}"`,
    );
  }

  return { ok: true, configured: true };
}

/** Builds the tokenized unsubscribe URL for ESP email footers. */
export function buildNewsletterUnsubUrl(
  token: string,
  siteOrigin: string,
): string {
  const origin = siteOrigin.replace(/\/$/, "");
  return `${origin}/?unsub=${encodeURIComponent(token)}#membership`;
}
