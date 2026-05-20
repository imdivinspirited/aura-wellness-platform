/**
 * Verify SMTP credentials (connect + AUTH). Loads backend/.env like the API.
 * Run from backend: node scripts/test-smtp.mjs
 */
import '../src/bootstrap.js';
import { verifySmtpConnection } from '../src/services/email.ts';

try {
  const r = await verifySmtpConnection();
  console.log(r.message);
  process.exit(r.ok ? 0 : 1);
} catch (e) {
  console.error('[test-smtp]', e instanceof Error ? e.message : e);
  process.exit(1);
}
