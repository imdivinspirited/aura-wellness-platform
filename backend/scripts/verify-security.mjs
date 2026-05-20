/**
 * Minimal end-to-end security verification script.
 *
 * Usage:
 * - Start backend: `pnpm dev` (or `pnpm start`)
 * - Run: `node scripts/verify-security.mjs`
 */
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
  return `sec-test-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

async function main() {
  const email = randEmail();
  const password = 'StrongPass123';
  const password2 = 'StrongerPass1234';

  // Register
  {
    const { res, json } = await j('POST', '/auth/register', { email, password, name: 'Security Test User' });
    assert(res.ok && json.success, `register failed: ${JSON.stringify(json)}`);
  }

  // Login
  let accessToken = '';
  {
    const { res, json } = await j('POST', '/auth/login', { identifier: email, password, rememberMe: true });
    assert(res.ok && json.success, `login failed: ${JSON.stringify(json)}`);
    accessToken = json.data.tokens.accessToken;
    assert(accessToken, 'missing access token');
  }

  // Start 2FA setup
  let secret = '';
  {
    const { res, json } = await j('POST', '/auth/2fa/setup', {}, { authorization: `Bearer ${accessToken}` });
    assert(res.ok && json.success, `2fa setup failed: ${JSON.stringify(json)}`);
    secret = json.data.secret;
    assert(secret, 'missing 2fa secret');
  }

  // Enable 2FA (compute code using otplib on server? can't here). Just verify endpoints exist.
  // If you want full enable test, run this script with NODE_OPTIONS allowing ESM import of otplib:
  // We'll do it directly:
  const { authenticator } = await import('otplib');
  {
    const code = authenticator.generate(secret);
    const { res, json } = await j('POST', '/auth/2fa/enable', { code }, { authorization: `Bearer ${accessToken}` });
    assert(res.ok && json.success, `2fa enable failed: ${JSON.stringify(json)}`);
    assert(Array.isArray(json.data.recoveryCodes) && json.data.recoveryCodes.length, 'missing recovery codes');
  }

  // Login now requires 2FA
  {
    const { res, json } = await j('POST', '/auth/login', { identifier: email, password });
    assert(res.status === 401 && json?.error?.code === 'TWO_FACTOR_REQUIRED', 'expected 2fa required on login');
  }

  // Login with 2FA
  {
    const code = authenticator.generate(secret);
    const { res, json } = await j('POST', '/auth/login', { identifier: email, password, twoFactorCode: code });
    assert(res.ok && json.success, `login with 2fa failed: ${JSON.stringify(json)}`);
    accessToken = json.data.tokens.accessToken;
  }

  // Sessions list
  {
    const { res, json } = await j('GET', '/auth/sessions', null, { authorization: `Bearer ${accessToken}` });
    assert(res.ok && json.success, `sessions failed: ${JSON.stringify(json)}`);
    assert(Array.isArray(json.data.items), 'sessions items missing');
  }

  // Change password
  {
    const { res, json } = await j(
      'POST',
      '/auth/change-password',
      { currentPassword: password, newPassword: password2 },
      { authorization: `Bearer ${accessToken}` }
    );
    assert(res.ok && json.success, `change password failed: ${JSON.stringify(json)}`);
  }

  console.log('verify-security: OK');
}

main().catch((e) => {
  console.error('verify-security: FAILED');
  console.error(e);
  process.exit(1);
});

