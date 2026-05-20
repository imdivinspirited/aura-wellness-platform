import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { config } from '../config.js';

export function signAccessToken(userId, role) {
  const jti = randomUUID();
  const ttl =
    Number.isFinite(config.accessTtlMin) && config.accessTtlMin > 0 ? config.accessTtlMin : 15;
  const token = jwt.sign(
    { sub: String(userId), role: role ?? 'user', jti, typ: 'access' },
    config.jwtAccessSecret,
    { expiresIn: `${ttl}m`, algorithm: 'HS256' }
  );
  return { token, jti };
}

export function verifyAccessToken(token) {
  const payload = jwt.verify(token, config.jwtAccessSecret, { algorithms: ['HS256'] });
  if (payload.typ !== 'access') {
    throw new Error('INVALID_TOKEN_TYPE');
  }
  return payload;
}
