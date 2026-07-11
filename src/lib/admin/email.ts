import nodemailer from "nodemailer";
import { organization } from "@/lib/site";

/** Operator-safe guidance when SMTP_PASS is missing (no secrets). */
export function smtpPassMissingMessage(): string {
  const onVercel = Boolean(process.env.VERCEL);
  if (onVercel) {
    const target =
      process.env.VERCEL_ENV === "preview" ? "Preview" : "Production";
    return `SMTP_PASS is not set. Add your Hover mailbox password in the Vercel ${target} environment variables, then redeploy. Ensure ADMIN_OTP_DEV_MODE is not true.`;
  }
  return "SMTP_PASS is not set. Add your Hover mailbox password to .env.local (and set ADMIN_OTP_DEV_MODE=false).";
}

export async function sendAdminOtpEmail(code: string) {
  const to = process.env.ADMIN_OTP_EMAIL ?? organization.email;
  const host = process.env.SMTP_HOST ?? "mail.hover.com";
  const port = Number(process.env.SMTP_PORT ?? "465");
  const user = process.env.SMTP_USER ?? organization.email;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM ?? user;

  if (process.env.ADMIN_OTP_DEV_MODE === "true") {
    console.info(`[admin-otp] DEV MODE — code for ${to}: ${code}`);
    return { delivered: false as const, mode: "dev" as const };
  }

  if (!pass) {
    throw new Error(smtpPassMissingMessage());
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"CCVAA Admin" <${from}>`,
    to,
    subject: "Your CCVAA admin login code",
    text: [
      "Your Coast to Coast Visual Arts Association admin login code is:",
      "",
      code,
      "",
      "This code expires in 10 minutes.",
      "If you did not request this code, you can ignore this email.",
    ].join("\n"),
  });

  return { delivered: true as const, mode: "smtp" as const };
}
