import { Resend } from "resend";

import { MembersEnvError } from "@/lib/members/env";

export class MembersEmailError extends Error {
  readonly code: "MEMBERS_EMAIL_UNAVAILABLE" | "MEMBERS_EMAIL_SEND_FAILED";

  constructor(
    code: MembersEmailError["code"],
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message);
    this.name = "MembersEmailError";
    this.code = code;
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export type TransactionalEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type SendTransactionalEmailResult = {
  id: string;
};

let cachedResend: Resend | null = null;

export function isResendConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() &&
      process.env.RESEND_FROM_EMAIL?.trim(),
  );
}

export function requireResendConfig(): { apiKey: string; from: string } {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey) {
    throw new MembersEnvError(
      "RESEND_API_KEY is not configured. Transactional email is unavailable.",
    );
  }
  if (!from) {
    throw new MembersEnvError(
      "RESEND_FROM_EMAIL is not configured. Transactional email is unavailable.",
    );
  }

  return { apiKey, from };
}

function getResendClient(): Resend {
  if (cachedResend) {
    return cachedResend;
  }

  const { apiKey } = requireResendConfig();
  cachedResend = new Resend(apiKey);
  return cachedResend;
}

/** Clears cached Resend client (tests or env reload). */
export function resetResendClientCache(): void {
  cachedResend = null;
}

/**
 * Sends a transactional email via Resend. Fails closed when API key or from-address is missing.
 */
export async function sendTransactionalEmail(
  input: TransactionalEmailInput,
): Promise<SendTransactionalEmailResult> {
  let from: string;
  try {
    ({ from } = requireResendConfig());
  } catch (error) {
    throw new MembersEmailError(
      "MEMBERS_EMAIL_UNAVAILABLE",
      error instanceof Error ? error.message : "Transactional email is unavailable.",
      { cause: error },
    );
  }

  const resend = getResendClient();

  try {
    const result = await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    if (result.error) {
      throw new MembersEmailError(
        "MEMBERS_EMAIL_SEND_FAILED",
        result.error.message ?? "Resend rejected the email send.",
        { cause: result.error },
      );
    }

    const id = result.data?.id;
    if (!id) {
      throw new MembersEmailError(
        "MEMBERS_EMAIL_SEND_FAILED",
        "Resend did not return a message id.",
      );
    }

    return { id };
  } catch (error) {
    if (error instanceof MembersEmailError) {
      throw error;
    }
    throw new MembersEmailError(
      "MEMBERS_EMAIL_SEND_FAILED",
      "Failed to send transactional email via Resend.",
      { cause: error },
    );
  }
}

const OTP_SUBJECT_BY_PURPOSE = {
  login: "Your CCVAA login code",
  email_verify: "Verify your CCVAA email",
  newsletter_confirm: "Confirm your CCVAA newsletter subscription",
} as const;

/**
 * Sends a 6-digit OTP email for the given purpose. Used by login and confirm flows.
 */
export async function sendOtpEmail(input: {
  to: string;
  purpose: keyof typeof OTP_SUBJECT_BY_PURPOSE;
  code: string;
  expiresAt: Date;
}): Promise<SendTransactionalEmailResult> {
  const minutesLeft = Math.max(
    1,
    Math.round((input.expiresAt.getTime() - Date.now()) / 60_000),
  );

  const subject = OTP_SUBJECT_BY_PURPOSE[input.purpose];
  const text = [
    `Your CCVAA verification code is: ${input.code}`,
    "",
    `This code expires in ${minutesLeft} minute(s).`,
    "",
    "If you did not request this email, you can ignore it.",
  ].join("\n");

  const html = [
    "<p>Your CCVAA verification code is:</p>",
    `<p style="font-size:24px;font-weight:bold;letter-spacing:4px">${input.code}</p>`,
    `<p>This code expires in ${minutesLeft} minute(s).</p>`,
    "<p>If you did not request this email, you can ignore it.</p>",
  ].join("");

  return sendTransactionalEmail({
    to: input.to,
    subject,
    html,
    text,
  });
}
