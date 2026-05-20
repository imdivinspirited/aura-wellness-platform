/**
 * Integration check for signup → confirm (requires SMTP + MongoDB + backend on :4000).
 *
 * 1. POST /auth/register (with X-Device-Id: UUID v4) — sends verification email.
 * 2. Copy `token` from the verification link in the inbox (or server logs if you log outbound mail).
 * 3. SIGNUP_CONFIRM_TOKEN=<token> node backend/scripts/verify-signup-email-link.mjs
 *
 * Or pass the token on the CLI: node backend/scripts/verify-signup-email-link.mjs <token>
 */
import { randomUUID } from 'node:crypto';

const BASE = process.env.API_BASE_URL || 'http://localhost:4000/api/v1';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function j(method, path, body, headers = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { res, json };
}

function randEmail() {
  return `signup-link-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`.toLowerCase();
}

async function main() {
  const confirmToken = process.argv[2] || process.env.SIGNUP_CONFIRM_TOKEN || '';
  const email = process.env.SIGNUP_TEST_EMAIL || randEmail();
  const password = 'StrongPass123';
  const name = 'Signup Link User';
  const deviceId = process.env.X_DEVICE_ID || randomUUID();

  if (!confirmToken) {
    const r1 = await j(
      'POST',
      '/auth/register',
      { email, password, name },
      { 'X-Device-Id': deviceId }
    );
    if (r1.res.status === 503 && r1.json?.error?.code === 'EMAIL_NOT_CONFIGURED') {
      console.error(
        'SMTP is not configured on the API. Set SMTP_URL or SMTP_HOST + SMTP_USER + SMTP_PASS, then run: cd backend && npm run test:smtp'
      );
      process.exit(1);
    }
    assert(r1.res.ok && r1.json.success, `register request failed: ${JSON.stringify(r1.json)}`);
    console.log(
      'Register OK. Open the verification email, copy the token query param from the link, then run:\n' +
        `  SIGNUP_CONFIRM_TOKEN='<token>' node backend/scripts/verify-signup-email-link.mjs\n` +
        `Or: node backend/scripts/verify-signup-email-link.mjs '<token>'\n` +
        `(same email: ${email})`
    );
    return;
  }

  const r2 = await j('POST', '/auth/register/confirm', { email, token: confirmToken });
  assert(r2.res.ok && r2.json.success, `confirm failed: ${JSON.stringify(r2.json)}`);
  assert(r2.json.data?.tokens?.accessToken, 'missing access token');

  const r3 = await j('POST', '/auth/login', { identifier: email, password });
  assert(r3.res.ok && r3.json.success, `login failed: ${JSON.stringify(r3.json)}`);

  console.log('verify-signup-email-link: OK');
}

main().catch((e) => {
  console.error('verify-signup-email-link: FAILED');
  console.error(e);
  process.exit(1);
});
