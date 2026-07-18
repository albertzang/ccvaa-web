import type { FeatureFlagSlug } from "@/lib/flags/definitions";

export class FeatureFlagWriteError extends Error {
  readonly code:
    | "FEATURE_FLAG_WRITE_UNAVAILABLE"
    | "FEATURE_FLAG_WRITE_FAILED";

  constructor(
    code: FeatureFlagWriteError["code"],
    message: string,
  ) {
    super(message);
    this.name = "FeatureFlagWriteError";
    this.code = code;
  }
}

/** Upserts a flag in the Edge Config store selected by this environment. */
export async function writeFeatureFlag(
  slug: FeatureFlagSlug,
  enabled: boolean,
): Promise<void> {
  const edgeConfigId = process.env.EDGE_CONFIG_ID;
  const apiToken = process.env.VERCEL_API_TOKEN;

  if (!edgeConfigId || !apiToken) {
    throw new FeatureFlagWriteError(
      "FEATURE_FLAG_WRITE_UNAVAILABLE",
      "Feature switch writes are not configured for this environment.",
    );
  }

  const url = new URL(
    `/v1/edge-config/${encodeURIComponent(edgeConfigId)}/items`,
    "https://api.vercel.com",
  );
  if (process.env.VERCEL_TEAM_ID) {
    url.searchParams.set("teamId", process.env.VERCEL_TEAM_ID);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${apiToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        items: [{ operation: "upsert", key: slug, value: enabled }],
      }),
      cache: "no-store",
    });
  } catch {
    throw new FeatureFlagWriteError(
      "FEATURE_FLAG_WRITE_FAILED",
      "Could not reach the feature switch store.",
    );
  }

  if (!response.ok) {
    throw new FeatureFlagWriteError(
      "FEATURE_FLAG_WRITE_FAILED",
      "The feature switch store rejected the update.",
    );
  }
}
