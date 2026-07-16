"use client";

import { useCallback, useState } from "react";

import { newsletterContent } from "@/lib/site";

type NewsletterStatus = "off" | "pending" | "on";

type ApiError = {
  ok: false;
  code: string;
  message: string;
};

type UnsubLanding =
  | { kind: "success"; already: boolean }
  | { kind: "invalid" };

type View = "subscribe" | "manage" | "confirm";

type NewsletterFormProps = {
  unsubLanding?: UnsubLanding;
};

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

function statusLabel(status: NewsletterStatus): string {
  if (status === "on") return newsletterContent.subscribedNote;
  if (status === "pending") return newsletterContent.pendingNote;
  return newsletterContent.unsubscribedNote;
}

export function NewsletterForm({ unsubLanding }: NewsletterFormProps) {
  const [view, setView] = useState<View>("subscribe");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<NewsletterStatus | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clearFeedback = useCallback(() => {
    setMessage(null);
    setError(null);
  }, []);

  const handleSubscribe = async (event: React.FormEvent) => {
    event.preventDefault();
    clearFeedback();
    setLoading(true);
    try {
      const result = await postJson<{ message: string; status: "pending" }>(
        "/api/members/newsletter/subscribe",
        { email, name },
      );
      setStatus("pending");
      setView("confirm");
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Subscribe failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (event: React.FormEvent) => {
    event.preventDefault();
    clearFeedback();
    setLoading(true);
    try {
      const result = await postJson<{ message: string; status: "on" }>(
        "/api/members/newsletter/confirm",
        { email, code },
      );
      setStatus("on");
      setView("manage");
      setCode("");
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confirmation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async (event: React.FormEvent) => {
    event.preventDefault();
    clearFeedback();
    setLoading(true);
    try {
      const result = await postJson<{
        preference: { status: NewsletterStatus };
      }>("/api/members/newsletter/preference", {
        action: "lookup",
        email,
      });
      setStatus(result.preference.status);
      setMessage(statusLabel(result.preference.status));
      if (result.preference.status === "pending") {
        setView("confirm");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    clearFeedback();
    setLoading(true);
    try {
      const result = await postJson<{ message: string; status: "off" }>(
        "/api/members/newsletter/preference",
        { action: "unsubscribe", email },
      );
      setStatus("off");
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unsubscribe failed.");
    } finally {
      setLoading(false);
    }
  };

  const landingMessage =
    unsubLanding?.kind === "success"
      ? unsubLanding.already
        ? newsletterContent.unsubLandingAlready
        : newsletterContent.unsubLandingSuccess
      : unsubLanding?.kind === "invalid"
        ? newsletterContent.unsubLandingInvalid
        : null;

  return (
    <div className="mt-10 rounded-2xl border border-ocean-100 bg-ocean-50/60 p-6 text-left sm:p-8">
      <h3 className="font-display text-xl font-semibold text-ocean-900">
        {newsletterContent.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ocean-600">
        {newsletterContent.description}
      </p>
      <p className="mt-2 text-xs text-ocean-500">{newsletterContent.consentNote}</p>

      {landingMessage ? (
        <p
          className={`mt-4 rounded-lg px-4 py-3 text-sm ${
            unsubLanding?.kind === "invalid"
              ? "bg-coral/10 text-coral-dark"
              : "bg-white text-ocean-700"
          }`}
          role="status"
        >
          {landingMessage}
        </p>
      ) : null}

      {message ? (
        <p className="mt-4 rounded-lg bg-white px-4 py-3 text-sm text-ocean-700" role="status">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-lg bg-coral/10 px-4 py-3 text-sm text-coral-dark" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <button
          type="button"
          onClick={() => {
            clearFeedback();
            setView("subscribe");
          }}
          className={`rounded-full px-4 py-2 font-medium transition-colors ${
            view === "subscribe"
              ? "bg-ocean-800 text-white"
              : "bg-white text-ocean-700 hover:bg-ocean-100"
          }`}
        >
          {newsletterContent.subscribeLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            clearFeedback();
            setView("manage");
          }}
          className={`rounded-full px-4 py-2 font-medium transition-colors ${
            view === "manage" || view === "confirm"
              ? "bg-ocean-800 text-white"
              : "bg-white text-ocean-700 hover:bg-ocean-100"
          }`}
        >
          {newsletterContent.manageLabel}
        </button>
      </div>

      {view === "subscribe" ? (
        <form onSubmit={handleSubscribe} className="mt-6 space-y-4">
          <div>
            <label htmlFor="newsletter-email" className="sr-only">
              Email
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={newsletterContent.emailPlaceholder}
              className="w-full rounded-xl border border-ocean-200 bg-white px-4 py-3 text-ocean-900 placeholder:text-ocean-400 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
          </div>
          <div>
            <label htmlFor="newsletter-name" className="sr-only">
              Name
            </label>
            <input
              id="newsletter-name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={newsletterContent.namePlaceholder}
              className="w-full rounded-xl border border-ocean-200 bg-white px-4 py-3 text-ocean-900 placeholder:text-ocean-400 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-coral-dark disabled:opacity-60"
          >
            {loading ? "Sending…" : newsletterContent.subscribeLabel}
          </button>
        </form>
      ) : null}

      {view === "manage" ? (
        <form onSubmit={handleLookup} className="mt-6 space-y-4">
          <div>
            <label htmlFor="newsletter-manage-email" className="sr-only">
              Email
            </label>
            <input
              id="newsletter-manage-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={newsletterContent.emailPlaceholder}
              className="w-full rounded-xl border border-ocean-200 bg-white px-4 py-3 text-ocean-900 placeholder:text-ocean-400 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-ocean-800 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-ocean-900 disabled:opacity-60"
          >
            {loading ? "Looking up…" : "Check preference"}
          </button>

          {status === "on" ? (
            <div className="space-y-3 border-t border-ocean-100 pt-4">
              <p className="text-sm text-ocean-600">{newsletterContent.membershipNote}</p>
              <button
                type="button"
                disabled={loading}
                onClick={handleUnsubscribe}
                className="rounded-full border border-ocean-300 bg-white px-6 py-3 text-sm font-semibold text-ocean-800 transition-colors hover:bg-ocean-100 disabled:opacity-60"
              >
                {loading ? "Updating…" : "Unsubscribe from newsletter"}
              </button>
            </div>
          ) : null}

          {status === "off" ? (
            <div className="border-t border-ocean-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  clearFeedback();
                  setView("subscribe");
                }}
                className="text-sm font-medium text-ocean-700 underline decoration-ocean-300 underline-offset-4 hover:text-ocean-900"
              >
                Subscribe to the newsletter
              </button>
            </div>
          ) : null}
        </form>
      ) : null}

      {view === "confirm" ? (
        <form onSubmit={handleConfirm} className="mt-6 space-y-4">
          {!message ? (
            <p className="text-sm text-ocean-600">{newsletterContent.pendingNote}</p>
          ) : null}
          <div>
            <label htmlFor="newsletter-confirm-email" className="sr-only">
              Email
            </label>
            <input
              id="newsletter-confirm-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={newsletterContent.emailPlaceholder}
              className="w-full rounded-xl border border-ocean-200 bg-white px-4 py-3 text-ocean-900 placeholder:text-ocean-400 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
          </div>
          <div>
            <label htmlFor="newsletter-code" className="sr-only">
              Confirmation code
            </label>
            <input
              id="newsletter-code"
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              required
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder={newsletterContent.codePlaceholder}
              className="w-full rounded-xl border border-ocean-200 bg-white px-4 py-3 font-mono tracking-widest text-ocean-900 placeholder:font-sans placeholder:tracking-normal placeholder:text-ocean-400 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-coral-dark disabled:opacity-60"
          >
            {loading ? "Confirming…" : "Confirm subscription"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
