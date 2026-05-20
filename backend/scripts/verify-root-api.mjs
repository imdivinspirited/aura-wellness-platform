/**
 * Smoke-test: POST /api/v1/root/signup must NOT 404 (expects 400 validation without full body).
 * Run: node scripts/verify-root-api.mjs
 */
import http from 'node:http';
import { createApp } from '../src/app.js';

const app = createApp();
const server = http.createServer(app);

await new Promise((resolve, reject) => {
  server.listen(0, '127.0.0.1', (err) => (err ? reject(err) : resolve()));
});

const { port } = server.address();
/** Canonical mount (always /api/v1/root, independent of API_PREFIX). */
const url = `http://127.0.0.1:${port}/api/v1/root/signup`;

const cases = [
  {
    name: 'empty body → 400 (not 404)',
    init: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' },
    allow: [400],
  },
  {
    name: 'minimal invalid → 400',
    init: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com' }),
    },
    allow: [400],
  },
];

let failed = false;
for (const c of cases) {
  const res = await fetch(url, c.init);
  const j = await res.json().catch(() => ({}));
  const ok = c.allow.includes(res.status);
  if (!ok || res.status === 404) {
    console.error(`FAIL: ${c.name}`, { status: res.status, body: j });
    failed = true;
  } else {
    console.log(`OK: ${c.name} → ${res.status}`);
  }
}

if (failed) {
  console.error(`\nRoute check failed. Target URL was: ${url}`);
  process.exitCode = 1;
} else {
  console.log(`\nRoot signup route is registered at POST ${url}`);
}

server.close();
