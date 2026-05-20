/**
 * Hit the *running* API (default http://127.0.0.1:4000) and ensure POST /api/v1/root/signup exists.
 * A stale or wrong process on :4000 returns 404 NOT_FOUND; a healthy server returns 400 VALIDATION for {}.
 *
 * Usage: cd backend && node scripts/verify-root-live.mjs
 *        VERIFY_API_URL=http://127.0.0.1:4000 node scripts/verify-root-live.mjs
 */
const base = (process.env.VERIFY_API_URL || 'http://127.0.0.1:4000').replace(/\/$/, '');

const url = `${base}/api/v1/root/signup`;
const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: '{}',
});
const j = await res.json().catch(() => ({}));

if (res.status === 404 && j?.error?.code === 'NOT_FOUND') {
  console.error(
    '\n❌ Root signup route is missing on this server (404 NOT_FOUND).\n' +
      '   → Another/old Node process may be bound to port 4000.\n' +
      '   → Stop it, then from `backend/` run: npm run dev\n' +
      '   → Or from repo root: npm run dev:stack\n'
  );
  process.exit(1);
}

if (res.status === 400 && j?.error?.code === 'VALIDATION') {
  console.log(`\n✅ Root API is live at POST ${url} (empty body correctly rejected).\n`);
  process.exit(0);
}

console.error('\n⚠️ Unexpected response:', res.status, j);
process.exit(1);
