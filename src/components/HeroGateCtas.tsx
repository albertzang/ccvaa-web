"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { HeroCtas } from "@/components/HeroCtas";
import type { HeroCounts } from "@/lib/members/hero-counts";
import { otpCodeSchema } from "@/lib/members/zod/otp";
import { membershipContent } from "@/lib/site";

const gateEmailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email.")
  .email("Enter a valid email address.")
  .max(320);

const gateInputClass =
  "h-12 w-full min-w-0 cursor-text rounded-full border border-ocean-200/80 bg-cream px-4 text-sm text-ocean-950 placeholder:text-ocean-500 shadow-sm transition-colors hover:border-ocean-400 focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/35";

const gateInputInvalidClass =
  "border-red-500 hover:border-red-500 focus:border-red-500 focus:ring-red-500/40";

const gatePrimaryBtnClass =
  "inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-coral px-5 text-sm font-semibold text-white transition-colors hover:bg-coral-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 disabled:opacity-60";

type ApiError = { ok: false; code: string; message: string };
type InvalidField = "email" | "code";

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as T | ApiError;
  if (!response.ok || (data as ApiError).ok === false) {
    const err = data as ApiError;
    throw new Error(err.message ?? "Request failed.");
  }
  return data as T;
}

type HeroGateCtasProps = {
  initialCounts: HeroCounts;
  /** When false, only Sub/Join show (member already verified). */
  showGate: boolean;
};

/**
 * Logged-out: Email [| Code] | Send/Verify under Sub/Join.
 * Verified: Sub/Join CTAs only (scroll to #membership) — unused when hero is compact ribbon.
 */
export function HeroGateCtas({ initialCounts, showGate }: HeroGateCtasProps) {
  const router = useRouter();
  const emailId = useId();
  const codeId = useId();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  /** Client validation — red outline on the field; no chip. */
  const [invalidField, setInvalidField] = useState<InvalidField | null>(null);
  /** API / server errors only. */
  const [error, setError] = useState<string | null>(null);
  /** Hide gate immediately after verify; clear once server `showGate` catches up. */
  const [hideGateOptimistic, setHideGateOptimistic] = useState(false);
  if (!showGate && hideGateOptimistic) {
    setHideGateOptimistic(false);
  }
  const gateVisible = showGate && !hideGateOptimistic;

  const clearClientInvalid = () => {
    setInvalidField(null);
  };

  const handleSendCode = async () => {
    setError(null);
    clearClientInvalid();
    if (!gateEmailSchema.safeParse(email).success) {
      setInvalidField("email");
      return;
    }
    setLoading(true);
    try {
      await postJson<{ message: string }>("/api/members/verify/start", {
        email,
      });
      setCodeSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError(null);
    clearClientInvalid();
    if (!gateEmailSchema.safeParse(email).success) {
      setInvalidField("email");
      return;
    }
    if (!otpCodeSchema.safeParse(code).success) {
      setInvalidField("code");
      return;
    }
    setLoading(true);
    try {
      await postJson("/api/members/verify/verify", { email, code });
      setHideGateOptimistic(true);
      router.refresh();
      window.setTimeout(() => {
        document.getElementById("membership")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify code.");
    } finally {
      setLoading(false);
    }
  };

  if (!gateVisible) {
    return <HeroCtas initialCounts={initialCounts} href="#membership" />;
  }

  return (
    <div className="mt-8">
      <form
        noValidate
        className="flex w-full flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (codeSent) {
            void handleVerify();
            return;
          }
          void handleSendCode();
        }}
      >
        <HeroCtas initialCounts={initialCounts} interactive={false} />
        {error ? (
          <p
            className="w-fit max-w-full rounded-md bg-coral px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm ring-1 ring-cream/25"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <div
          className={
            codeSent
              ? "grid w-full max-w-xl grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(6.5rem,7.5rem)_auto]"
              : "grid w-full max-w-md grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
          }
        >
          <div className="min-w-0">
            <label
              htmlFor={emailId}
              className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-cream"
            >
              Email
            </label>
            <input
              id={emailId}
              type="email"
              required
              autoComplete="email"
              value={email}
              aria-invalid={invalidField === "email"}
              onChange={(event) => {
                setEmail(event.target.value);
                if (invalidField === "email") {
                  clearClientInvalid();
                }
              }}
              placeholder={membershipContent.emailPlaceholder}
              className={`${gateInputClass} ${
                invalidField === "email" ? gateInputInvalidClass : ""
              }`}
            />
          </div>
          {codeSent ? (
            <div className="min-w-0">
              <label
                htmlFor={codeId}
                className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-cream"
              >
                Code
              </label>
              <input
                id={codeId}
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                required
                value={code}
                aria-invalid={invalidField === "code"}
                onChange={(event) => {
                  setCode(event.target.value);
                  if (invalidField === "code") {
                    clearClientInvalid();
                  }
                }}
                placeholder={membershipContent.codePlaceholder}
                className={`${gateInputClass} font-mono tracking-widest placeholder:font-sans placeholder:tracking-normal ${
                  invalidField === "code" ? gateInputInvalidClass : ""
                }`}
              />
            </div>
          ) : null}
          <button
            type="submit"
            disabled={loading || (!codeSent && !email.trim())}
            className={`${gatePrimaryBtnClass} w-full sm:w-auto`}
          >
            {loading
              ? codeSent
                ? "Verifying…"
                : "Sending…"
              : codeSent
                ? membershipContent.verifyEmailLabel
                : membershipContent.sendCodeLabel}
          </button>
        </div>
        <p className="font-display text-xs font-medium tracking-tight text-cream/90 sm:text-sm">
          {membershipContent.gateHeadline}
        </p>
      </form>
    </div>
  );
}
