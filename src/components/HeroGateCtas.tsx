"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { HeroCtas } from "@/components/HeroCtas";
import type { HeroCounts } from "@/lib/members/hero-counts";
import { otpCodeSchema } from "@/lib/members/zod/otp";
import { personNameSchema } from "@/lib/members/zod/person-name";
import { membershipContent } from "@/lib/site";

const gateEmailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email.")
  .email("Enter a valid email address.")
  .max(320);

const gateInputClass =
  "h-12 w-full min-w-0 cursor-text rounded-full border border-ocean-200/80 bg-cream px-4 text-sm text-ocean-950 placeholder:text-ocean-500 shadow-sm transition-colors hover:border-ocean-400 focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/35";

const gatePrimaryBtnClass =
  "inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-coral px-5 text-sm font-semibold text-white transition-colors hover:bg-coral-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 disabled:opacity-60";

type ApiError = { ok: false; code: string; message: string };

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
 * Logged-out: Name | Email [| Code] | Send/Verify | Sub | Join (one row on lg+).
 * Verified: Sub | Join only (scroll to #membership).
 */
export function HeroGateCtas({ initialCounts, showGate }: HeroGateCtasProps) {
  const router = useRouter();
  const nameId = useId();
  const emailId = useId();
  const codeId = useId();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Hide gate immediately after verify; clear once server `showGate` catches up. */
  const [hideGateOptimistic, setHideGateOptimistic] = useState(false);
  if (!showGate && hideGateOptimistic) {
    setHideGateOptimistic(false);
  }
  const gateVisible = showGate && !hideGateOptimistic;

  const firstZodMessage = (parsed: {
    success: boolean;
    error?: { issues: { message: string }[] };
  }) =>
    parsed.success
      ? null
      : (parsed.error?.issues[0]?.message ?? "Please check the form.");

  const handleSendCode = async () => {
    setError(null);
    const nameIssue = firstZodMessage(personNameSchema.safeParse(name));
    if (nameIssue) {
      setError(nameIssue);
      return;
    }
    const emailIssue = firstZodMessage(gateEmailSchema.safeParse(email));
    if (emailIssue) {
      setError(emailIssue);
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
    const nameIssue = firstZodMessage(personNameSchema.safeParse(name));
    if (nameIssue) {
      setError(nameIssue);
      return;
    }
    const emailIssue = firstZodMessage(gateEmailSchema.safeParse(email));
    if (emailIssue) {
      setError(emailIssue);
      return;
    }
    if (!otpCodeSchema.safeParse(code).success) {
      setError(
        code.trim() ? "Enter a 6-digit code." : membershipContent.verifyHint,
      );
      return;
    }
    setLoading(true);
    try {
      await postJson("/api/members/verify/verify", { email, code, name });
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
        <HeroCtas
          initialCounts={initialCounts}
          href="#hero"
          className="flex flex-wrap items-center gap-x-4 gap-y-3"
        />
        <div
          className={
            codeSent
              ? "grid w-full grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(6.5rem,7.5rem)_auto]"
              : "grid w-full grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto]"
          }
        >
          <div className="min-w-0">
            <label
              htmlFor={nameId}
              className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-cream"
            >
              Name
            </label>
            <input
              id={nameId}
              type="text"
              required
              autoComplete="name"
              maxLength={200}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={membershipContent.namePlaceholder}
              className={gateInputClass}
            />
          </div>
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
              onChange={(event) => setEmail(event.target.value)}
              placeholder={membershipContent.emailPlaceholder}
              className={gateInputClass}
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
                onChange={(event) => setCode(event.target.value)}
                placeholder={membershipContent.codePlaceholder}
                className={`${gateInputClass} font-mono tracking-widest placeholder:font-sans placeholder:tracking-normal`}
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
        {error ? (
          <p
            className="rounded-lg bg-coral-dark px-3 py-2 text-sm font-medium text-cream ring-1 ring-coral/70"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
