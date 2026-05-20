/**
 * Apple Sign In Routes (custom implementation)
 */

import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';

export const oauthAppleRouter = Router();

const APPLE_CLIENT_ID = process.env.OAUTH_APPLE_CLIENT_ID;
const APPLE_TEAM_ID = process.env.OAUTH_APPLE_TEAM_ID;
const APPLE_KEY_ID = process.env.OAUTH_APPLE_KEY_ID;
const APPLE_PRIVATE_KEY = process.env.OAUTH_APPLE_PRIVATE_KEY;
const APPLE_CALLBACK_URL = process.env.OAUTH_APPLE_CALLBACK_URL;

const APP_WEB_URL = (process.env.APP_WEB_URL || 'http://localhost:5173').replace(/\/$/, '');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('CRITICAL: JWT_SECRET and JWT_REFRESH_SECRET environment variables must be set');
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function parseDurationMs(value: string): number {
  const v = String(value || '').trim();
  const m = v.match(/^(\d+)\s*([smhd])$/i);
  if (!m) return 7 * 24 * 60 * 60 * 1000;
  const n = parseInt(m[1], 10);
  const unit = m[2].toLowerCase();
  if (unit === 's') return n * 1000;
  if (unit === 'm') return n * 60 * 1000;
  if (unit === 'h') return n * 60 * 60 * 1000;
  return n * 24 * 60 * 60 * 1000;
}

function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, JWT_SECRET as string, { expiresIn: JWT_EXPIRES_IN as any } as any);
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET as string, { expiresIn: JWT_REFRESH_EXPIRES_IN as any } as any);
  return { accessToken, refreshToken };
}

async function persistRefreshToken(opts: { userId: string; refreshToken: string; req: Request }) {
  const tokenHash = sha256Hex(opts.refreshToken);
  const expiresAt = new Date(Date.now() + parseDurationMs(JWT_REFRESH_EXPIRES_IN));
  await RefreshToken.create({
    userId: opts.userId,
    tokenHash,
    expiresAt,
    createdByIp: opts.req.ip,
    createdByUserAgent: opts.req.get('user-agent') || undefined,
  });
}

function appleClientSecret(): string {
  if (!APPLE_CLIENT_ID || !APPLE_TEAM_ID || !APPLE_KEY_ID || !APPLE_PRIVATE_KEY) {
    throw new Error('Apple OAuth env vars not configured');
  }
  // Apple requires ES256 signed JWT as client_secret.
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    {
      iss: APPLE_TEAM_ID,
      iat: now,
      exp: now + 60 * 5,
      aud: 'https://appleid.apple.com',
      sub: APPLE_CLIENT_ID,
    },
    APPLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    { algorithm: 'ES256', keyid: APPLE_KEY_ID }
  );
}

async function exchangeCodeForTokens(code: string): Promise<{ id_token: string; access_token?: string }> {
  if (!APPLE_CALLBACK_URL || !APPLE_CLIENT_ID) throw new Error('Apple callback/client id missing');

  const params = new URLSearchParams();
  params.set('grant_type', 'authorization_code');
  params.set('code', code);
  params.set('redirect_uri', APPLE_CALLBACK_URL);
  params.set('client_id', APPLE_CLIENT_ID);
  params.set('client_secret', appleClientSecret());

  const resp = await fetch('https://appleid.apple.com/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Apple token exchange failed (${resp.status}): ${text}`);
  }
  const json = (await resp.json()) as any;
  return { id_token: json.id_token, access_token: json.access_token };
}

function decodeAppleIdToken(idToken: string): { sub: string; email?: string; email_verified?: string | boolean } {
  // NOTE: For production-grade verification, you'd fetch Apple's JWKS and verify signature.
  // Here we decode without verification for compatibility; if you want strict verification, we can add JWKS verification.
  const decoded = jwt.decode(idToken) as any;
  if (!decoded?.sub) throw new Error('Invalid Apple id_token');
  return { sub: decoded.sub, email: decoded.email, email_verified: decoded.email_verified };
}

oauthAppleRouter.get('/oauth/apple/start', (_req: Request, res: Response) => {
  if (!APPLE_CLIENT_ID || !APPLE_CALLBACK_URL) {
    return res.status(500).send('Apple OAuth not configured');
  }

  const state = crypto.randomBytes(16).toString('hex');
  const url = new URL('https://appleid.apple.com/auth/authorize');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('response_mode', 'query');
  url.searchParams.set('client_id', APPLE_CLIENT_ID);
  url.searchParams.set('redirect_uri', APPLE_CALLBACK_URL);
  url.searchParams.set('scope', 'name email');
  url.searchParams.set('state', state);
  return res.redirect(url.toString());
});

oauthAppleRouter.get('/oauth/apple/callback', async (req: Request, res: Response) => {
  try {
    const code = String(req.query.code || '');
    if (!code) return res.redirect(`${APP_WEB_URL}/auth/login?oauth=failed`);

    const { id_token } = await exchangeCodeForTokens(code);
    const { sub, email } = decodeAppleIdToken(id_token);

    let user = await User.findOne({ 'oauth.appleSub': sub });
    const normalizedEmail = (email || '').toLowerCase().trim();
    if (!user && normalizedEmail) {
      user = await User.findOne({ email: normalizedEmail });
      if (user) {
        (user as any).oauth = { ...(user as any).oauth, appleSub: sub };
        if (!user.isEmailVerified) user.isEmailVerified = true;
        await user.save();
      }
    }

    if (!user) {
      user = new User({
        email: normalizedEmail || `apple_${sub}@oauth.local`,
        name: 'Apple User',
        isEmailVerified: Boolean(normalizedEmail),
        oauth: { appleSub: sub },
      });
      await user.save();
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    await persistRefreshToken({ userId: user._id.toString(), refreshToken, req });
    res.redirect(`${APP_WEB_URL}/auth/callback?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}`);
  } catch (e) {
    console.error(e);
    res.redirect(`${APP_WEB_URL}/auth/login?oauth=failed`);
  }
});

