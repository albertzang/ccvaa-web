"use client";

import { ADMIN_MAIL_EMBED_PATH } from "@/lib/admin/constants";
import { organization } from "@/lib/site";

type MailSectionProps = {
  authenticated: boolean;
  iframeKey: number;
};

export function MailSection({ authenticated, iframeKey }: MailSectionProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col">
      {!authenticated && (
        <p className="shrink-0 border-b border-ocean-100 bg-white/60 px-6 py-4 text-sm leading-relaxed text-ocean-600">
          Sign in to{" "}
          <span className="font-medium text-ocean-800">{organization.email}</span>{" "}
          in Mail to unlock Members, Financial, and Events. Logging out of mail
          (or using Log out in the sidebar) signs you out of admin.
        </p>
      )}

      <div className="min-h-0 flex-1 overflow-hidden bg-white">
        <iframe
          key={iframeKey}
          title="Hover webmail"
          src={ADMIN_MAIL_EMBED_PATH}
          className="h-full w-full bg-white"
        />
      </div>
    </section>
  );
}
