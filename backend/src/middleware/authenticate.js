import { verifyAccessToken } from '../lib/jwt.js';
import { isJtiRevoked } from '../lib/tokenStore.js';

/**
 * Bearer JWT — access token with jti revocation check.
 */
export async function authenticate(req, res, next) {
  const h = req.headers.authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(h);
  if (!m) {
    req.user = null;
    return next();
  }
  try {
    const payload = verifyAccessToken(m[1]);
    let revoked = false;
    try {
      revoked = await isJtiRevoked(payload.jti);
    } catch {
      revoked = false;
    }
    if (revoked) {
      req.user = null;
      return next();
    }
    req.user = {
      id: payload.sub,
      role: payload.role,
      jti: payload.jti,
    };
    req.accessTokenRaw = m[1];
    return next();
  } catch {
    req.user = null;
    return next();
  }
}

export function requireAuth(req, res, next) {
  if (!req.user?.id) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
    });
  }
  return next();
}
