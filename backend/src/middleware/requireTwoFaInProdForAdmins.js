/**
 * In production, privileged admin roles must have TOTP enabled before using admin APIs.
 * Set REQUIRE_2FA_ROLES_IN_PRODUCTION="" to disable (not recommended).
 */
import { getDb } from '../db.js';
import { isProd } from '../config.js';

const DEFAULT_ROLES = ['content_admin', 'admin', 'super_admin', 'root'];

function requiredRoles() {
  const raw = process.env.REQUIRE_2FA_ROLES_IN_PRODUCTION;
  if (raw === undefined || raw === null) return DEFAULT_ROLES;
  if (String(raw).trim() === '') return [];
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * After authenticate + requireAuth + requireAdmin — ensures Mongo user has twofa_secret in prod.
 */
export async function requireTwoFaInProdForAdmins(req, res, next) {
  if (!isProd()) return next();
  const roles = requiredRoles();
  if (!roles.length) return next();
  const role = req.user?.role;
  if (!role || !roles.includes(role)) return next();

  try {
    const db = getDb();
    const user = await db.collection('users').findOne(
      { id: req.user.id },
      { projection: { twofa_secret: 1 } }
    );
    if (user?.twofa_secret) return next();
    return res.status(403).json({
      success: false,
      error: {
        code: 'TWO_FACTOR_SETUP_REQUIRED',
        message:
          'Two-factor authentication is required for admin access in production. Sign in on the web app, open Settings → Security, and enable an authenticator app.',
      },
    });
  } catch (e) {
    return next(e);
  }
}
