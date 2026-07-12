"use client";

import { ADMIN_MAIL_EMBED_PATH } from "@/lib/admin/constants";

type MailSectionProps = {
  iframeKey: number;
  hidden?: boolean;
};

export function MailSection({ iframeKey, hidden = false }: MailSectionProps) {
  return (
    <section
      className={`flex min-h-0 flex-1 flex-col ${hidden ? "hidden" : ""}`}
      aria-hidden={hidden}
    >
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
