"use client";

import { useCallback, useId, useState } from "react";

import { newsletterContent } from "@/lib/site";

type ApiError = {
  ok: false;
  code: string;
  message: string;
};

type UnsubLanding =
  | { kind: "success"; already: boolean; email: string }
  | { kind: "invalid" };

type Tab = "subscribe" | "unsubscribe";
type SubscribePhase = "form" | "confirm";

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

function landingMessage(unsubLanding: UnsubLanding): string {
  if (unsubLanding.kind === "invalid") {
    return newsletterContent.unsubLandingInvalid;
  }
  return unsubLanding.already
    ? newsletterContent.unsubLandingAlready
    : newsletterContent.unsubLandingSuccess;
}

export function NewsletterForm({ unsubLanding }: NewsletterFormProps) {
  const tabListId = useId();
  const subscribePanelId = `${tabListId}-subscribe`;
  const unsubscribePanelId = `${tabListId}-unsubscribe`;

  const [activeTab, setActiveTab] = useState<Tab>(
    unsubLanding ? "unsubscribe" : "subscribe",
  );
  const [subscribePhase, setSubscribePhase] =
    useState<SubscribePhase>("form");
  const [email, setEmail] = useState(
    unsubLanding?.kind === "success" ? unsubLanding.email : "",
  );
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(
    unsubLanding ? landingMessage(unsubLanding) : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clearFeedback = useCallback(() => {
    setMessage(null);
    setError(null);
  }, []);

  const switchTab = (tab: Tab) => {
    clearFeedback();
    setActiveTab(tab);
    if (tab === "subscribe") {
      setSubscribePhase("form");
    }
  };

  const handleSubscribe = async (event: React.FormEvent) => {
    event.preventDefault();
    clearFeedback();
    setLoading(true);
    try {
      const result = await postJson<{ message: string; status: "pending" }>(
        "/api/members/newsletter/subscribe",
        { email, name },
      );
      setSubscribePhase("confirm");
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
      setCode("");
      setSubscribePhase("form");
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confirmation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (event: React.FormEvent) => {
    event.preventDefault();
    clearFeedback();
    setLoading(true);
    try {
      const result = await postJson<{ message: string; status: "off" }>(
        "/api/members/newsletter/preference",
        { action: "unsubscribe", email },
      );
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unsubscribe failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 rounded-2xl border border-ocean-100 bg-ocean-50/60 p-6 text-left sm:p-8">
      <h3 className="font-display text-xl font-semibold text-ocean-900">
        {newsletterContent.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ocean-600">
        {newsletterContent.description}
      </p>
      <p className="mt-2 text-xs text-ocean-500">{newsletterContent.consentNote}</p>

      {message ? (
        <p
          className={`mt-4 rounded-lg px-4 py-3 text-sm ${
            message === newsletterContent.unsubLandingInvalid
              ? "bg-coral/10 text-coral-dark"
              : "bg-white text-ocean-700"
          }`}
          role="status"
        >
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-lg bg-coral/10 px-4 py-3 text-sm text-coral-dark" role="alert">
          {error}
        </p>
      ) : null}

      <div
        className="mt-4 inline-flex rounded-full border border-ocean-200 bg-white/80 p-1"
        role="tablist"
        aria-label="Newsletter"
      >
        <button
          type="button"
          role="tab"
          id={`${tabListId}-tab-subscribe`}
          aria-controls={subscribePanelId}
          aria-selected={activeTab === "subscribe"}
          tabIndex={activeTab === "subscribe" ? 0 : -1}
          onClick={() => switchTab("subscribe")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            activeTab === "subscribe"
              ? "bg-ocean-800 text-white"
              : "text-ocean-700 hover:text-ocean-900"
          }`}
        >
          {newsletterContent.subscribeLabel}
        </button>
        <button
          type="button"
          role="tab"
          id={`${tabListId}-tab-unsubscribe`}
          aria-controls={unsubscribePanelId}
          aria-selected={activeTab === "unsubscribe"}
          tabIndex={activeTab === "unsubscribe" ? 0 : -1}
          onClick={() => switchTab("unsubscribe")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            activeTab === "unsubscribe"
              ? "bg-ocean-800 text-white"
              : "text-ocean-700 hover:text-ocean-900"
          }`}
        >
          {newsletterContent.unsubscribeLabel}
        </button>
      </div>

      <div
        id={subscribePanelId}
        role="tabpanel"
        aria-labelledby={`${tabListId}-tab-subscribe`}
        hidden={activeTab !== "subscribe"}
      >
        {activeTab === "subscribe" && subscribePhase === "form" ? (
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

        {activeTab === "subscribe" && subscribePhase === "confirm" ? (
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

      <div
        id={unsubscribePanelId}
        role="tabpanel"
        aria-labelledby={`${tabListId}-tab-unsubscribe`}
        hidden={activeTab !== "unsubscribe"}
      >
        {activeTab === "unsubscribe" ? (
          <form onSubmit={handleUnsubscribe} className="mt-6 space-y-4">
            <div>
              <label htmlFor="newsletter-unsub-email" className="sr-only">
                Email
              </label>
              <input
                id="newsletter-unsub-email"
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
              {loading ? "Updating…" : newsletterContent.unsubscribeLabel}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
