/**
 * Email service (SMTP) — nodemailer with SMTP_URL or SMTP_HOST + auth.
 *
 * Gmail (587): set SMTP_SECURE=false, SMTP_PORT=587, use an App Password.
 * See backend/.env.example for a full example.
 */

import nodemailer from 'nodemailer';

type Transport = ReturnType<typeof nodemailer.createTransport>;

function required(name: string, value?: string) {
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_SECURE = (process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_URL = process.env.SMTP_URL?.trim();
/** When true (default for port 587 + secure false), use STARTTLS like Gmail. */
const SMTP_REQUIRE_TLS =
  (process.env.SMTP_REQUIRE_TLS || 'true').toLowerCase() === 'true' && !SMTP_SECURE && SMTP_PORT === 587;

const SMTP_FROM =
  process.env.SMTP_FROM || process.env.EMAIL_FROM || 'The AOLIC Bangalore <no-reply@aolic-bangalore.local>';

let cachedTransport: Transport | null = null;

export function isEmailConfigured(): boolean {
  return Boolean(SMTP_URL || (SMTP_HOST && SMTP_USER && SMTP_PASS));
}

function createTransport(): Transport {
  if (SMTP_URL) {
    // Nodemailer accepts a full connection URL string, e.g.
    // smtps://user:pass@smtp.gmail.com:465  or  smtp://user:pass@smtp.gmail.com:587
    return nodemailer.createTransport(SMTP_URL);
  }

  return nodemailer.createTransport({
    host: required('SMTP_HOST', SMTP_HOST),
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    requireTLS: SMTP_REQUIRE_TLS,
    auth: {
      user: required('SMTP_USER', SMTP_USER),
      pass: required('SMTP_PASS', SMTP_PASS),
    },
  });
}

function getTransport(): Transport {
  if (!cachedTransport) {
    cachedTransport = createTransport();
  }
  return cachedTransport;
}

/** Call after env change (e.g. tests). */
export function resetEmailTransportForTests(): void {
  cachedTransport = null;
}

/**
 * Verifies SMTP credentials (connect + auth). Use `node backend/scripts/test-smtp.mjs`.
 */
export async function verifySmtpConnection(): Promise<{ ok: boolean; message: string }> {
  if (!isEmailConfigured()) {
    return { ok: false, message: 'SMTP not configured. Set SMTP_URL or SMTP_HOST + SMTP_USER + SMTP_PASS.' };
  }
  const t = getTransport();
  await t.verify();
  return { ok: true, message: 'SMTP connection OK.' };
}

function mailEnvelope() {
  return {
    from: SMTP_FROM,
    replyTo: process.env.SMTP_REPLY_TO || undefined,
  };
}

export async function sendPasswordResetEmail(opts: {
  to: string;
  name?: string;
  resetUrl: string;
}): Promise<void> {
  if (!isEmailConfigured()) {
    throw new Error(
      'EMAIL_NOT_CONFIGURED: Set SMTP_URL or SMTP_HOST, SMTP_USER, and SMTP_PASS before sending email.'
    );
  }

  const transporter = getTransport();
  const safeName = opts.name?.trim() || 'there';
  const subject = 'Reset your password';
  const text = `Hi ${safeName},\n\nYou requested a password reset.\n\nReset your password here:\n${opts.resetUrl}\n\nIf you didn’t request this, you can ignore this email.\n`;
  const html = `<p>Hi ${escapeHtml(safeName)},</p><p>You requested a password reset.</p><p><a href="${escapeHtml(
    opts.resetUrl
  )}">Reset your password</a></p><p>If you didn’t request this, you can ignore this email.</p>`;

  try {
    await transporter.sendMail({
      ...mailEnvelope(),
      to: opts.to,
      subject,
      text,
      html,
    });
  } catch (e) {
    console.error('[email] sendPasswordResetEmail failed:', e instanceof Error ? e.message : e);
    throw e;
  }
}

/**
 * Sends verification email via SMTP. Caller must ensure {@link isEmailConfigured} first.
 *
 * @returns true when SMTP accepted the message for delivery.
 */
export async function sendVerifyEmail(opts: {
  to: string;
  name?: string;
  verifyUrl: string;
  /** Shown in email body; link must be used within this window. */
  validMinutes?: number;
}): Promise<boolean> {
  if (!isEmailConfigured()) {
    throw new Error(
      'EMAIL_NOT_CONFIGURED: Set SMTP_URL or SMTP_HOST, SMTP_USER, and SMTP_PASS before sending email.'
    );
  }

  const transporter = getTransport();
  const safeName = opts.name?.trim() || 'there';
  const mins = opts.validMinutes ?? 2;
  const subject = 'Verify your email';
  const text = `Hi ${safeName},\n\nPlease verify your email to finish setting up your account.\n\nOpen this link within ${mins} minute(s):\n${opts.verifyUrl}\n\nIf you didn’t create this account, you can ignore this email.\n`;
  const html = `<p>Hi ${escapeHtml(safeName)},</p><p>Please verify your email to finish setting up your account.</p><p><strong>This link expires in ${mins} minute(s).</strong></p><p><a href="${escapeHtml(
    opts.verifyUrl
  )}">Verify email</a></p><p>If you didn’t create this account, you can ignore this email.</p>`;

  try {
    const info = await transporter.sendMail({
      ...mailEnvelope(),
      to: opts.to,
      subject,
      text,
      html,
    });
    console.info('[email] verify email accepted by SMTP', {
      to: opts.to,
      messageId: info.messageId,
    });
    return true;
  } catch (e) {
    console.error('[email] sendVerifyEmail failed:', e instanceof Error ? e.message : e);
    throw e;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
