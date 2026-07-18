import { get } from "@vercel/edge-config";

import type { FeatureFlagSlug } from "@/lib/flags/definitions";

/**
 * Reads a boolean feature flag from the environment's Edge Config store.
 * Missing configuration, missing/non-boolean values, and read failures are Off.
 */
export async function isFeatureEnabled(
  slug: FeatureFlagSlug,
): Promise<boolean> {
  if (!process.env.EDGE_CONFIG) {
    return false;
  }

  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const value = await Promise.race([
      get(slug),
      new Promise<undefined>((resolve) => {
        timeout = setTimeout(() => resolve(undefined), 2_000);
      }),
    ]);
    return value === true;
  } catch {
    return false;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
