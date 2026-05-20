import { isIP } from 'node:net';

/**
 * express-rate-limit v7's default keyGenerator validates `request.ip` strictly; behind Vite's
 * proxy `req.ip` can be missing or incompatible, which breaks auth routes with opaque failures.
 * Always return a valid IP-shaped string for rate-limit keys.
 *
 * @param {import('express').Request} req
 */
export function rateLimitClientKey(req) {
  const xff =
    typeof req.headers['x-forwarded-for'] === 'string'
      ? req.headers['x-forwarded-for'].split(',')[0].trim()
      : '';
  const candidates = [req.ip, xff, req.socket?.remoteAddress];
  for (const c of candidates) {
    if (c == null || c === '') continue;
    const n = String(c).replace(/^::ffff:/, '');
    if (n && isIP(n)) return n;
  }
  return '127.0.0.1';
}
