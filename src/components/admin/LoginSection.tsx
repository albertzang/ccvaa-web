"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { ADMIN_OTP_LENGTH } from "@/lib/admin/constants";
import { organization } from "@/lib/site";

type LoginSectionProps = {
  onAuthenticated: () => void;
};

export function LoginSection({ onAuthenticated }: LoginSectionProps) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldownMs, setCooldownMs] = useState(0);

  useEffect(() => {
    if (cooldownMs <= 0) return;
    const timer = window.setTimeout(
      () => setCooldownMs((ms) => Math.max(0, ms - 1000)),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [cooldownMs]);

  async function requestCode() {
    setSending(true);
    setError(null);
    setStatus(null);
    try {
      const response = await fetch("/api/admin/otp/request", { method: "POST" });
      const data = (await response.json()) as {
        error?: string;
        retryAfterMs?: number;
        cooldownMs?: number;
        mode?: string;
      };

      if (!response.ok) {
        if (data.retryAfterMs) setCooldownMs(data.retryAfterMs);
        setError(data.error ?? "Could not send login code.");
        return;
      }

      setCooldownMs(data.cooldownMs ?? 60_000);
      setStatus(
        data.mode === "dev"
          ? "Dev mode is on — no email was sent. Check the terminal running next dev for the code, or set ADMIN_OTP_DEV_MODE=false and SMTP_PASS in .env.local."
          : `A 6-digit code was sent to ${organization.email}. Check that inbox (and spam).`,
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.length !== ADMIN_OTP_LENGTH) {
      setError("Enter the 6-digit code.");
      return;
    }

    setVerifying(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await response.json()) as {
        error?: string;
        retryAfterMs?: number;
      };

      if (!response.ok) {
        if (data.retryAfterMs) setCooldownMs(data.retryAfterMs);
        setError(data.error ?? "Could not verify code.");
        return;
      }

      onAuthenticated();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  const cooldownSeconds = Math.ceil(cooldownMs / 1000);

  return (
    <section id="login" className="scroll-mt-28">
      <h2 className="border-b border-ocean-100 pb-3 font-display text-xl font-semibold text-ocean-900 sm:text-2xl">
        Admin login
      </h2>

      <div className="mt-8 max-w-lg rounded-2xl border border-ocean-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm leading-relaxed text-ocean-600">
          Sign in with a one-time 6-digit code sent to{" "}
          <span className="font-medium text-ocean-800">{organization.email}</span>
          .
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={requestCode}
            disabled={sending || cooldownMs > 0}
            className="rounded-full bg-ocean-900 px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-ocean-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending
              ? "Sending…"
              : cooldownMs > 0
                ? `Resend in ${cooldownSeconds}s`
                : "Send login code"}
          </button>
        </div>

        <form onSubmit={verifyCode} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-ocean-700">
              6-digit code
            </span>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={ADMIN_OTP_LENGTH}
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="mt-2 w-full rounded-xl border border-ocean-200 bg-cream px-4 py-3 font-display text-2xl tracking-[0.35em] text-ocean-900 outline-none ring-ocean-400 focus:ring-2"
              placeholder="••••••"
              aria-label="One-time login code"
            />
          </label>

          <button
            type="submit"
            disabled={verifying || code.length !== ADMIN_OTP_LENGTH}
            className="rounded-full border border-ocean-200 bg-white px-5 py-2.5 text-sm font-medium text-ocean-800 transition-colors hover:bg-ocean-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {verifying ? "Verifying…" : "Verify and sign in"}
          </button>
        </form>

        {status && (
          <p className="mt-4 text-sm text-ocean-600" role="status">
            {status}
          </p>
        )}
        {error && (
          <p className="mt-4 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
