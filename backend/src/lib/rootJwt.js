import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { config } from '../config.js';

function rootSecret() {
  const s = config.rootJwtSecret?.trim();
  if (s && s.length >= 32) return s;
  if (config.nodeEnv !== 'production') {
    return `${config.jwtAccessSecret}-root-dev-only-do-not-use-in-prod`;
  }
  throw new Error('ROOT_JWT_SECRET is not configured');
}

/**
 * Root session JWT — distinct issuer semantics from normal access tokens.
 * @param {string} subjectId — root_accounts.id or users.id
 */
export function signRootAccessToken(subjectId) {
  const jti = randomUUID();
  const token = jwt.sign(
    { sub: subjectId, role: 'root', sessionType: 'root', typ: 'root_access', jti },
    rootSecret(),
    { expiresIn: `${config.rootAccessTtlHours}h`, algorithm: 'HS256' }
  );
  return { token, jti };
}

export function verifyRootAccessToken(token) {
  const payload = jwt.verify(token, rootSecret(), { algorithms: ['HS256'] });
  if (payload.typ !== 'root_access' || payload.sessionType !== 'root') {
    throw new Error('INVALID_ROOT_TOKEN');
  }
  return payload;
}

export function signRootRefreshToken(userId) {
  return jwt.sign(
    { sub: userId, typ: 'root_refresh' },
    rootSecret(),
    { expiresIn: `${config.rootRefreshTtlHours}h`, algorithm: 'HS256' }
  );
}

export function verifyRootRefreshToken(token) {
  const payload = jwt.verify(token, rootSecret(), { algorithms: ['HS256'] });
  if (payload.typ !== 'root_refresh') {
    throw new Error('INVALID_ROOT_REFRESH');
  }
  return payload;
}
