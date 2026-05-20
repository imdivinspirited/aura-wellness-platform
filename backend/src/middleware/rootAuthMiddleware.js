import { verifyRootAccessToken } from '../lib/rootJwt.js';
import { isJtiRevoked } from '../lib/tokenStore.js';

/**
 * Requires `Authorization: Bearer <root access JWT>`.
 * Sets `req.rootUser` = { id, role, jti }.
 * Rejects access tokens that were blacklisted (e.g. after logout).
 * Uses .then() (not async) so Express 4 runs the chain correctly.
 */
export function requireRootAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(h);
  if (!m) {
    return res.status(401).json({
      success: false,
      error: { code: 'ROOT_AUTH_REQUIRED', message: 'Root session required.' },
    });
  }

  let payload;
  try {
    payload = verifyRootAccessToken(m[1]);
  } catch {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_ROOT_TOKEN', message: 'Root session expired or invalid.' },
    });
  }
  return isJtiRevoked(payload.jti)
    .then((revoked) => {
      if (revoked) {
        return res.status(401).json({
          success: false,
          error: { code: 'ROOT_TOKEN_REVOKED', message: 'Root session ended. Sign in again.' },
        });
      }
      req.rootUser = {
        id: payload.sub,
        role: 'root',
        jti: payload.jti,
      };
      req.rootAccessTokenRaw = m[1];
      return next();
    })
    .catch((e) => {
      console.error('[requireRootAuth]', e);
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL', message: 'Auth check failed.' },
      });
    });
}
