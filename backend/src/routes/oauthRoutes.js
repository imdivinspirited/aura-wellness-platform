import { Router } from 'express';
import { config, isProd } from '../config.js';
import { getDb } from '../db.js';
import { randomUUID } from 'crypto';
import { setUserRefreshCookie } from '../lib/httpCookies.js';
import { generateRefreshTokenRaw, saveRefreshToken } from '../lib/tokenStore.js';

const router = Router();

/** Binds OAuth `state` query param to this httpOnly cookie to prevent login CSRF. */
const OAUTH_STATE_COOKIE = 'oauth_csrf';
const OAUTH_STATE_MAX_AGE_MS = 10 * 60 * 1000;

function clientIp(req) {
  const x = req.headers['x-forwarded-for'];
  if (typeof x === 'string' && x.length) return x.split(',')[0].trim();
  return req.socket?.remoteAddress || '0.0.0.0';
}

/** @param {import('express').Response} res */
function setOAuthStateCookie(res, state) {
  res.cookie(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: isProd(),
    sameSite: 'lax',
    maxAge: OAUTH_STATE_MAX_AGE_MS,
    path: '/',
  });
}

/** @param {import('express').Response} res */
function clearOAuthStateCookie(res) {
  res.clearCookie(OAUTH_STATE_COOKIE, { path: '/', sameSite: 'lax', secure: isProd() });
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {boolean}
 */
function verifyOAuthState(req, res) {
  const stateQ = typeof req.query?.state === 'string' ? req.query.state : '';
  const stateC = req.cookies?.[OAUTH_STATE_COOKIE];
  clearOAuthStateCookie(res);
  return Boolean(stateQ && stateC && stateQ === stateC);
}

/**
 * Google OAuth2 — redirects to Google when GOOGLE_CLIENT_ID is set.
 */
router.get('/google/start', (req, res) => {
  if (!config.googleClientId || !config.googleClientSecret) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'OAUTH_NOT_CONFIGURED',
        message: 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
      },
    });
  }
  const callbackUrl = `${config.oauthCallbackBase}${config.apiPrefix}/oauth/google/callback`;
  const state = randomUUID();
  setOAuthStateCookie(res, state);
  const q = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state,
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${q.toString()}`);
});

/**
 * Google OAuth callback — exchanges code → user info → app tokens → redirect (no tokens in URL).
 */
router.get('/google/callback', async (req, res) => {
  if (!verifyOAuthState(req, res)) {
    return res.redirect(`${config.oauthRedirectBase}/auth/login?oauth=failed`);
  }
  const code = typeof req.query?.code === 'string' ? req.query.code : '';
  if (!code) {
    return res.redirect(`${config.oauthRedirectBase}/auth/login?oauth=failed`);
  }
  if (!config.googleClientId || !config.googleClientSecret) {
    return res.redirect(`${config.oauthRedirectBase}/auth/login?oauth=failed`);
  }

  const callbackUrl = `${config.oauthCallbackBase}${config.apiPrefix}/oauth/google/callback`;

  try {
    const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.googleClientId,
        client_secret: config.googleClientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }).toString(),
    });
    if (!tokenResp.ok) {
      return res.redirect(`${config.oauthRedirectBase}/auth/login?oauth=failed`);
    }
    const tokenJson = /** @type {{ access_token?: string }} */ (await tokenResp.json());
    const accessTokenGoogle = tokenJson.access_token || '';
    if (!accessTokenGoogle) {
      return res.redirect(`${config.oauthRedirectBase}/auth/login?oauth=failed`);
    }

    const infoResp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { authorization: `Bearer ${accessTokenGoogle}` },
    });
    if (!infoResp.ok) {
      return res.redirect(`${config.oauthRedirectBase}/auth/login?oauth=failed`);
    }
    const info = /** @type {{ sub?: string; email?: string; name?: string }} */ (await infoResp.json());
    const sub = String(info.sub || '').trim();
    const email = String(info.email || '').toLowerCase().trim();
    const name = String(info.name || '').trim() || 'User';
    if (!sub || !email) {
      return res.redirect(`${config.oauthRedirectBase}/auth/login?oauth=failed`);
    }

    const db = getDb();
    const users = db.collection('users');

    let user = await users.findOne({ email, deleted_at: null });
    if (!user) {
      const id = randomUUID();
      const doc = {
        id,
        email,
        name,
        role: 'user',
        status: 'active',
        oauth: { googleSub: sub },
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };
      await users.insertOne(doc);
      user = doc;
    } else {
      const nextOauth = { ...(user.oauth || {}), googleSub: sub };
      await users.updateOne(
        { id: user.id },
        { $set: { oauth: nextOauth, name: user.name || name, updated_at: new Date() } }
      );
    }

    const rawRefresh = generateRefreshTokenRaw();
    await saveRefreshToken(user.id, rawRefresh, {
      ttlDays: config.refreshTtlDays,
      userAgent: req.headers['user-agent'],
      ip: clientIp(req),
      sessionKind: 'user',
    });
    setUserRefreshCookie(res, rawRefresh, config.refreshTtlDays * 24 * 60 * 60 * 1000);

    /** httpOnly refresh cookie only — frontend calls POST /auth/refresh for access JWT (avoids tokens in history/logs). */
    return res.redirect(`${config.oauthRedirectBase}/auth/callback?oauth=success`);
  } catch {
    return res.redirect(`${config.oauthRedirectBase}/auth/login?oauth=failed`);
  }
});

router.get('/facebook/start', (_req, res) => {
  if (!config.facebookAppId || !config.facebookAppSecret) {
    return res.status(503).json({
      success: false,
      error: { code: 'OAUTH_NOT_CONFIGURED', message: 'Facebook OAuth not configured.' },
    });
  }

  const callbackUrl = `${config.oauthCallbackBase}${config.apiPrefix}/oauth/facebook/callback`;
  const state = randomUUID();
  setOAuthStateCookie(res, state);
  const q = new URLSearchParams({
    client_id: config.facebookAppId,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: 'email,public_profile',
    state,
  });
  return res.redirect(`https://www.facebook.com/v20.0/dialog/oauth?${q.toString()}`);
});

router.get('/facebook/callback', async (req, res) => {
  if (!verifyOAuthState(req, res)) {
    return res.redirect(`${config.oauthRedirectBase}/auth/login?oauth=failed`);
  }
  const code = typeof req.query?.code === 'string' ? req.query.code : '';
  if (!code) return res.redirect(`${config.oauthRedirectBase}/auth/login?oauth=failed`);
  if (!config.facebookAppId || !config.facebookAppSecret) {
    return res.redirect(`${config.oauthRedirectBase}/auth/login?oauth=failed`);
  }

  const callbackUrl = `${config.oauthCallbackBase}${config.apiPrefix}/oauth/facebook/callback`;

  try {
    const tokenUrl = new URL('https://graph.facebook.com/v20.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', config.facebookAppId);
    tokenUrl.searchParams.set('redirect_uri', callbackUrl);
    tokenUrl.searchParams.set('client_secret', config.facebookAppSecret);
    tokenUrl.searchParams.set('code', code);

    const tokenResp = await fetch(tokenUrl.toString());
    if (!tokenResp.ok) return res.redirect(`${config.oauthRedirectBase}/auth/login?oauth=failed`);
    const tokenJson = /** @type {{ access_token?: string }} */ (await tokenResp.json());
    const fbAccessToken = tokenJson.access_token || '';
    if (!fbAccessToken) return res.redirect(`${config.oauthRedirectBase}/auth/login?oauth=failed`);

    const meUrl = new URL('https://graph.facebook.com/me');
    meUrl.searchParams.set('fields', 'id,name,email');
    meUrl.searchParams.set('access_token', fbAccessToken);
    const meResp = await fetch(meUrl.toString());
    if (!meResp.ok) return res.redirect(`${config.oauthRedirectBase}/auth/login?oauth=failed`);
    const me = /** @type {{ id?: string; name?: string; email?: string }} */ (await meResp.json());
    const fbId = String(me.id || '').trim();
    const email = String(me.email || '').toLowerCase().trim();
    const name = String(me.name || '').trim() || 'User';
    if (!fbId) return res.redirect(`${config.oauthRedirectBase}/auth/login?oauth=failed`);

    const db = getDb();
    const users = db.collection('users');

    let user = email ? await users.findOne({ email, deleted_at: null }) : null;
    if (!user) {
      const id = randomUUID();
      const doc = {
        id,
        email: email || `facebook_${fbId}@oauth.local`,
        name,
        role: 'user',
        status: 'active',
        oauth: { facebookId: fbId },
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };
      await users.insertOne(doc);
      user = doc;
    } else {
      const nextOauth = { ...(user.oauth || {}), facebookId: fbId };
      await users.updateOne(
        { id: user.id },
        { $set: { oauth: nextOauth, name: user.name || name, updated_at: new Date() } }
      );
    }

    const rawRefresh = generateRefreshTokenRaw();
    await saveRefreshToken(user.id, rawRefresh, {
      ttlDays: config.refreshTtlDays,
      userAgent: req.headers['user-agent'],
      ip: clientIp(req),
      sessionKind: 'user',
    });
    setUserRefreshCookie(res, rawRefresh, config.refreshTtlDays * 24 * 60 * 60 * 1000);

    return res.redirect(`${config.oauthRedirectBase}/auth/callback?oauth=success`);
  } catch {
    return res.redirect(`${config.oauthRedirectBase}/auth/login?oauth=failed`);
  }
});

router.get('/apple/start', (_req, res) => {
  res.status(503).json({
    success: false,
    error: { code: 'OAUTH_NOT_CONFIGURED', message: 'Apple Sign In not configured.' },
  });
});

export default router;
