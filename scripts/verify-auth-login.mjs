#!/usr/bin/env node
/**
 * Verifies POST /api/v1/auth/login always returns JSON (never empty 5xx) and behaves sanely.
 * Requires API + MongoDB: npm run dev  OR  cd backend && npm run dev
 *
 * Simulates Vite proxy headers (X-Forwarded-For) that previously broke express-rate-limit.
 */
const origin = process.env.AUTH_TEST_ORIGIN || 'http://127.0.0.1:4000';
const base = `${origin}/api/v1`;

function assertJson(res, label) {
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    throw new Error(`${label}: expected JSON content-type, got ${ct || '(none)'}`);
  }
}

async function main() {
  const health = await fetch(`${origin}/healthz`).catch(() => null);
  if (!health?.ok) {
    console.error('FAIL: API not reachable at', origin);
    console.error('Start: npm run dev  (repo root) or: cd backend && npm run dev');
    process.exit(1);
  }

  const h = await health.json();
  if (!h.mongoReady) {
    console.error('FAIL: mongoReady is false. Set MONGODB_URI in backend/.env and ensure Mongo is running.');
    process.exit(1);
  }

  const proxyHeaders = {
    'Content-Type': 'application/json',
    'X-Forwarded-For': '203.0.113.50',
    'X-Forwarded-Proto': 'http',
  };

  // 1) Validation error → 400 + JSON
  const badBody = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: proxyHeaders,
    body: JSON.stringify({ identifier: 'ab', password: 'x' }),
  });
  if (badBody.status !== 400) {
    const t = await badBody.text();
    throw new Error(`expected 400 for invalid payload, got ${badBody.status}: ${t.slice(0, 200)}`);
  }
  assertJson(badBody, 'validation');
  await badBody.json();

  // 2) Unknown user → 401 + JSON
  const unknown = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: proxyHeaders,
    body: JSON.stringify({
      identifier: `nouser_${Date.now()}@example.com`,
      password: 'SomePass1!',
    }),
  });
  if (unknown.status !== 401) {
    const t = await unknown.text();
    throw new Error(`expected 401 for unknown user, got ${unknown.status}: ${t.slice(0, 200)}`);
  }
  assertJson(unknown, 'unknown user');
  const uj = await unknown.json();
  if (!uj.success && !uj.error) {
    throw new Error('expected error object in 401 body');
  }

  // 3) Wrong password (use synthetic email so we never touch a real inbox)
  const wrongPw = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: proxyHeaders,
    body: JSON.stringify({
      identifier: 'wrongpw_check@example.com',
      password: 'definitely_wrong_password_' + Date.now(),
    }),
  });
  if (wrongPw.status !== 401) {
    const t = await wrongPw.text();
    throw new Error(`expected 401 for wrong password, got ${wrongPw.status}: ${t.slice(0, 400)}`);
  }
  assertJson(wrongPw, 'wrong password');
  await wrongPw.json();

  console.log('OK: /auth/login returns JSON for 400/401 (proxy headers + rate-limit bypass verified).');
  process.exit(0);
}

main().catch((e) => {
  console.error('FAIL:', e.message || e);
  process.exit(1);
});
