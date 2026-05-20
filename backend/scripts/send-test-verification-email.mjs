/**
 * Sends one real "Verify your email" test message via configured SMTP.
 * Usage: node scripts/send-test-verification-email.mjs recipient@example.com
 */
import '../src/bootstrap.js';
import { isEmailConfigured, sendVerifyEmail } from '../src/services/email.ts';

const to = (process.argv[2] || '').trim().toLowerCase();
if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
  console.error('Usage: node scripts/send-test-verification-email.mjs recipient@example.com');
  process.exit(1);
}

if (!isEmailConfigured()) {
  console.error('SMTP not configured. Set SMTP_HOST + SMTP_USER + SMTP_PASS (or SMTP_URL) in backend/.env');
  process.exit(1);
}

const sent = await sendVerifyEmail({
  to,
  name: 'Test',
  verifyUrl: `${(process.env.EMAIL_LINK_BASE || process.env.OAUTH_REDIRECT_BASE || 'http://localhost:8080').replace(/\/+$/, '')}/auth/verify-signup?email=test&token=demo`,
  validMinutes: 2,
});

console.log(sent ? `[ok] Test verify email sent to ${to} — check inbox and Spam.` : '[skip] Email not sent (SMTP skipped).');
process.exit(sent ? 0 : 1);
