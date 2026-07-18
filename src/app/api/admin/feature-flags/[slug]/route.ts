import { NextRequest } from "next/server";

import {
  adminApiError,
  adminApiSuccess,
  handleAdminApiError,
} from "@/lib/admin/http";
import { requireMailSession } from "@/lib/admin/require-mail-session";
import {
  featureFlagSlugSchema,
  featureFlagUpdateSchema,
} from "@/lib/flags/definitions";
import { isFeatureEnabled } from "@/lib/flags/read";
import {
  FeatureFlagWriteError,
  writeFeatureFlag,
} from "@/lib/flags/write";

export const dynamic = "force-dynamic";

type FeatureFlagRouteContext = {
  params: Promise<{ slug: string }>;
};

async function parseSlug(context: FeatureFlagRouteContext) {
  const { slug } = await context.params;
  return featureFlagSlugSchema.parse(slug);
}

/** Read a switch only after the existing Hover mail-session auth succeeds. */
export async function GET(
  request: NextRequest,
  context: FeatureFlagRouteContext,
) {
  try {
    await requireMailSession(request.headers.get("cookie"));
    const slug = await parseSlug(context);
    return adminApiSuccess({
      slug,
      enabled: await isFeatureEnabled(slug),
    });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

/** Upsert a switch in this environment's Edge Config store. */
export async function PATCH(
  request: NextRequest,
  context: FeatureFlagRouteContext,
) {
  try {
    await requireMailSession(request.headers.get("cookie"));
    const slug = await parseSlug(context);
    const { enabled } = featureFlagUpdateSchema.parse(
      (await request.json()) as unknown,
    );
    await writeFeatureFlag(slug, enabled);
    return adminApiSuccess({ slug, enabled });
  } catch (error) {
    if (error instanceof FeatureFlagWriteError) {
      const status =
        error.code === "FEATURE_FLAG_WRITE_UNAVAILABLE" ? 503 : 502;
      return adminApiError(error.code, error.message, status);
    }
    return handleAdminApiError(error);
  }
}
