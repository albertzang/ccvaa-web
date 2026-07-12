"use client";

import { useState } from "react";
import { ExpandIcon } from "@/components/admin/ExpandIcon";
import { ADMIN_MAIL_EMBED_PATH } from "@/lib/admin/constants";
import { organization } from "@/lib/site";

type MailSectionProps = {
  authenticated: boolean;
  iframeKey: number;
};

export function MailSection({ authenticated, iframeKey }: MailSectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="mail" className="scroll-mt-28">
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        aria-label={expanded ? "Hide mail" : "Show mail"}
        className="group flex w-full items-center justify-between gap-6 border-b border-ocean-100 pb-3 text-left transition-colors hover:border-ocean-200"
      >
        <span className="font-display text-xl font-semibold text-ocean-900 transition-colors group-hover:text-ocean-700 sm:text-2xl">
          Mail
        </span>
        <ExpandIcon expanded={expanded} />
      </button>

      {!authenticated && (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ocean-600">
          Sign in to{" "}
          <span className="font-medium text-ocean-800">{organization.email}</span>{" "}
          in Mail to unlock Members, Financial, and Events. Logging out of mail
          (or using Log out in the header) signs you out of admin.
        </p>
      )}

      {expanded && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-ocean-100 bg-white shadow-sm">
          <iframe
            key={iframeKey}
            title="Hover webmail"
            src={ADMIN_MAIL_EMBED_PATH}
            className="h-[min(70vh,40rem)] w-full bg-white"
          />
        </div>
      )}
    </section>
  );
}
