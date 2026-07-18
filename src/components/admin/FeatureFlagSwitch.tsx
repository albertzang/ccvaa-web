"use client";

import { useCallback, useEffect, useState } from "react";

import type { FeatureFlagSlug } from "@/lib/flags/definitions";

type FeatureFlagSwitchProps = {
  slug: FeatureFlagSlug;
  label: string;
  description: string;
};

type FeatureFlagResponse =
  | { ok: true; slug: FeatureFlagSlug; enabled: boolean }
  | { ok: false; code: string; message: string };

export function FeatureFlagSwitch({
  slug,
  label,
  description,
}: FeatureFlagSwitchProps) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFlag = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/feature-flags/${slug}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as FeatureFlagResponse;
      if (!response.ok || data.ok === false) {
        throw new Error(
          data.ok === false ? data.message : "Could not read feature switch.",
        );
      }
      setEnabled(data.enabled);
    } catch (err) {
      setEnabled(false);
      setError(
        err instanceof Error ? err.message : "Could not read feature switch.",
      );
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadFlag();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadFlag]);

  async function toggleFlag() {
    const nextEnabled = !enabled;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/feature-flags/${slug}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ enabled: nextEnabled }),
      });
      const data = (await response.json()) as FeatureFlagResponse;
      if (!response.ok || data.ok === false) {
        throw new Error(
          data.ok === false
            ? data.message
            : "Could not update feature switch.",
        );
      }
      setEnabled(data.enabled);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update feature switch.",
      );
    } finally {
      setSaving(false);
    }
  }

  const unavailable = loading || saving;

  return (
    <div className="rounded-xl border border-ocean-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ocean-900">{label}</h2>
          <p className="mt-1 max-w-2xl text-sm text-ocean-600">{description}</p>
          <p className="mt-2 text-xs text-ocean-500">
            Production changes are CEO/Admin-owned. Changes may take a few
            seconds to appear globally.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={label}
          onClick={() => void toggleFlag()}
          disabled={unavailable}
          className={`inline-flex min-w-20 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            enabled
              ? "bg-ocean-800 text-cream hover:bg-ocean-900"
              : "bg-ocean-100 text-ocean-700 hover:bg-ocean-200"
          }`}
        >
          {loading ? "Loading…" : saving ? "Saving…" : enabled ? "On" : "Off"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-coral-700">
          {error}
        </p>
      )}
    </div>
  );
}
