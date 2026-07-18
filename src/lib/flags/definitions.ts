import { z } from "zod";

export const FEATURE_FLAG_SLUGS = ["members"] as const;

export const featureFlagSlugSchema = z.enum(FEATURE_FLAG_SLUGS);
export type FeatureFlagSlug = z.infer<typeof featureFlagSlugSchema>;
