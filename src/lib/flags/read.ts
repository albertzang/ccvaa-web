import { get } from "@vercel/edge-config";
import { z } from "zod";

import type { FeatureFlagSlug } from "@/lib/flags/definitions";

const edgeConfigEnvironmentSchema = z.enum([
  "production",
  "preview",
  "development",
]);

const featureFlagBucketSchema = z.record(z.string(), z.boolean());

function getEdgeConfigEnvironment() {
  const environment = process.env.VERCEL_ENV;
  if (environment === undefined || environment === "") {
    return "development";
  }

  const parsed = edgeConfigEnvironmentSchema.safeParse(environment);
  return parsed.success ? parsed.data : null;
}

/**
 * Reads a boolean feature flag from this environment's bucket in one shared
 * Edge Config store. Missing configuration, invalid values, and failures are Off.
 */
export async function isFeatureEnabled(
  slug: FeatureFlagSlug,
): Promise<boolean> {
  const environment = getEdgeConfigEnvironment();
  if (!process.env.EDGE_CONFIG || !environment) {
    return false;
  }

  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const value = await Promise.race([
      get(environment),
      new Promise<undefined>((resolve) => {
        timeout = setTimeout(() => resolve(undefined), 2_000);
      }),
    ]);
    const bucket = featureFlagBucketSchema.safeParse(value);
    return bucket.success && bucket.data[slug] === true;
  } catch {
    return false;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
