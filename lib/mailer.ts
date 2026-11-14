/**
 * Server-only email sender (Nodemailer over SMTP, Gmail by default).
 *
 * Configure in the environment (Vercel → Settings → Environment Variables, and .env locally):
 *   SMTP_USER       Gmail address that sends the mail
 *   SMTP_PASS       Gmail *App Password* (Google Account → Security → 2-Step Verification → App passwords),
 *                   not the normal Gmail password
 *   SMTP_HOST       default smtp.gmail.com
 *   SMTP_PORT       default 465 (SSL); use 587 for STARTTLS
 *   MAIL_FROM       optional display sender, default `Kerala Lottery Alerts <SMTP_USER>`
 *   ALERT_EMAIL_TO  comma-separated recipients for API alerts (defaults below)
 *
 * Never throws: a mail problem must never break a lottery sync. Missing credentials → logged skip.
 */
import nodemailer, { type Transporter } from "nodemailer";

const DEFAULT_ALERT_RECIPIENTS = ["ajomonjohn123@gmail.com", "sherinshaju80@gmail.com", "sherinshaju800@gmail.com"];

export interface MailResult {
  sent: boolean;
  skipped?: boolean;
  error?: string;
  messageId?: string;
}

export interface MailMessage {
  to?: string[];
  subject: string;
  html: string;
  text: string;
}

/** Recipients for API alerts: ALERT_EMAIL_TO (comma-separated) or the built-in list. */
export const getAlertRecipients = (): string[] => {
  const fromEnv = (process.env.ALERT_EMAIL_TO ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
  return fromEnv.length > 0 ? fromEnv : DEFAULT_ALERT_RECIPIENTS;
};

export const isMailerConfigured = (): boolean => Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

// One transporter per server instance (reuses the SMTP connection pool across invocations).
let cachedTransporter: Transporter | null = null;

const getTransporter = (): Transporter => {
  if (cachedTransporter) return cachedTransporter;
  const port = Number(process.env.SMTP_PORT ?? 465);
  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    // Keep a failing SMTP server from holding a sync request open.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  return cachedTransporter;
};

export const sendMail = async ({ to, subject, html, text }: MailMessage): Promise<MailResult> => {
  if (!isMailerConfigured()) {
    console.warn(`[mailer] SMTP_USER / SMTP_PASS not set; skipped email "${subject}".`);
    return { sent: false, skipped: true, error: "SMTP_USER / SMTP_PASS are not configured" };
  }
  const recipients = to?.length ? to : getAlertRecipients();
  try {
    const info = await getTransporter().sendMail({
      from: process.env.MAIL_FROM ?? `Kerala Lottery Alerts <${process.env.SMTP_USER}>`,
      to: recipients.join(", "),
      subject,
      html,
      text,
    });
    return { sent: true, messageId: info.messageId };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    console.error(`[mailer] failed to send "${subject}":`, error);
    // Drop the pooled transporter so a fixed credential/env takes effect on the next send.
    cachedTransporter = null;
    return { sent: false, error };
  }
};
