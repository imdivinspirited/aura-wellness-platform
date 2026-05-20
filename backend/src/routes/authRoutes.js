import { Router } from 'express';
import { z } from 'zod';
import { randomUUID, timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import { getDb } from '../db.js';
import { config, isProd } from '../config.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { signAccessToken } from '../lib/jwt.js';
import {
  generateRefreshTokenRaw,
  findValidRefreshToken,
  rotateRefreshToken,
  revokeRefreshTokenId,
  saveRefreshToken,
  revokeAccessJti,
  hashToken,
} from '../lib/tokenStore.js';
import { authenticate, requireAuth } from '../middleware/authenticate.js';
import {
  isLockedOut,
  recordFailure,
  clearFailures,
  lockoutRemainingMs,
} from '../middleware/bruteForce.js';
import { setUserRefreshCookie, clearUserRefreshCookie } from '../lib/httpCookies.js';
import { respondIfMongoOrDbUnavailable } from '../lib/serviceUnavailableMongo.js';
import { asyncRoute } from '../lib/asyncRoute.js';
import { isEmailConfigured, sendPasswordResetEmail, sendVerifyEmail } from '../services/email.ts';

const router = Router();

/** @param {number} [ttlDays] defaults to config */
function refreshCookieMaxAgeMs(ttlDays) {
  const d = ttlDays != null && Number.isFinite(ttlDays) ? ttlDays : config.refreshTtlDays;
  return d * 24 * 60 * 60 * 1000;
}

/** Long session when user checks "Remember me" (browser stores httpOnly refresh cookie). */
const REMEMBER_ME_REFRESH_DAYS = Math.min(365, Math.max(60, (config.refreshTtlDays || 30) * 2));

/** @type {Map<string, { hour: number; count: number }>} */
const registerAttemptsByIp = new Map();

function clientIp(req) {
  const x = req.headers['x-forwarded-for'];
  if (typeof x === 'string' && x.length) return x.split(',')[0].trim();
  return req.socket?.remoteAddress || '0.0.0.0';
}

function registerRateLimitPerHour(req, res, next) {
  const ip = clientIp(req);
  const hour = Math.floor(Date.now() / 3_600_000);
  let e = registerAttemptsByIp.get(ip);
  if (!e || e.hour !== hour) {
    e = { hour, count: 0 };
  }
  e.count += 1;
  registerAttemptsByIp.set(ip, e);
  if (e.count > 5) {
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT',
        message: 'Too many registration attempts from this address. Try again later.',
      },
    });
  }
  return next();
}

function sanitizeAuthString(str, maxLen) {
  if (typeof str !== 'string') return '';
  return str.replace(/\0/g, '').trim().slice(0, maxLen);
}

function stripNullBytes(str, maxLen) {
  if (typeof str !== 'string') return '';
  return str.replace(/\0/g, '').slice(0, maxLen);
}

function publicUser(row) {
  const role = row.role ?? 'user';
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role,
    roles: [role],
  };
}

/** Compare Argon2 password hashes from DB vs signup token payload without leaking timing. */
function passwordHashesMatch(stored, fromToken) {
  if (typeof stored !== 'string' || typeof fromToken !== 'string' || stored.length !== fromToken.length) {
    return false;
  }
  try {
    return timingSafeEqual(Buffer.from(stored, 'utf8'), Buffer.from(fromToken, 'utf8'));
  } catch {
    return false;
  }
}

function signupTokenExpiresAt() {
  return new Date(Date.now() + config.signupVerifyTtlMinutes * 60 * 1000);
}

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** @param {import('express').Request} req */
function getValidatedDeviceId(req) {
  const raw = (req.get('x-device-id') || '').trim();
  if (!raw || !UUID_V4_RE.test(raw)) return null;
  return raw.toLowerCase();
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} deviceId
 * @param {string} email
 */
async function recordDeviceSignup(db, deviceId, email) {
  if (!deviceId || !email) return;
  try {
    await db.collection('device_signups').insertOne({
      id: randomUUID(),
      device_id: deviceId,
      email: email.toLowerCase(),
      created_at: new Date(),
    });
  } catch (e) {
    if (e?.code === 11000) return;
    throw e;
  }
}

/** Lets the original register tab poll until the user confirms the link (possibly on another device). */
async function insertSignupWatch(db, email, expiresAt) {
  const watchId = randomUUID();
  await db.collection('signup_watches').insertOne({
    id: watchId,
    email: email.toLowerCase(),
    expires_at: expiresAt,
    fulfilled_at: null,
    created_at: new Date(),
  });
  return watchId;
}

async function fulfillSignupWatchesForEmail(db, email) {
  await db.collection('signup_watches').updateMany(
    { email: email.toLowerCase(), fulfilled_at: null },
    { $set: { fulfilled_at: new Date() } }
  );
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(10)
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/[0-9]/, 'Password must include a digit'),
  name: z.string().min(1).max(200),
  phone: z.string().min(8).max(20).optional(),
});

const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(1),
  rememberMe: z.coerce.boolean().optional(),
  twoFactorCode: z.preprocess(
    (v) => (v === '' || v == null ? undefined : v),
    z.string().min(4).max(32).optional()
  ),
  recoveryCode: z.preprocess(
    (v) => (v === '' || v == null ? undefined : v),
    z.string().min(6).max(64).optional()
  ),
});

function normalizeRecoveryCode(raw) {
  return String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 32);
}

function generateRecoveryCodes(count = 10) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const c = randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase();
    codes.push(`${c.slice(0, 5)}-${c.slice(5)}`);
  }
  return codes;
}

function dbUnavailable(res, err) {
  return respondIfMongoOrDbUnavailable(res, err);
}

/** @param {import('express').Response} res */
function emailNotConfigured(res) {
  return res.status(503).json({
    success: false,
    error: {
      code: 'EMAIL_NOT_CONFIGURED',
      message: 'Email delivery is not configured. Set SMTP_URL or SMTP_HOST, SMTP_USER, and SMTP_PASS in backend/.env.',
    },
  });
}

/**
 * GET /auth/register/watch/:watchId
 * Poll while the register tab is open; returns verified when /register/confirm succeeds (any device).
 */
router.get('/register/watch/:watchId', async (req, res) => {
  const raw = (req.params.watchId || '').trim();
  if (!UUID_V4_RE.test(raw)) {
    return res.status(400).json({ success: false, status: 'invalid', error: { code: 'INVALID', message: 'Invalid id.' } });
  }
  const watchId = raw.toLowerCase();
  try {
    const db = getDb();
    const doc = await db.collection('signup_watches').findOne({ id: watchId });
    if (!doc) {
      return res.json({ success: true, status: 'not_found' });
    }
    const now = new Date();
    if (doc.expires_at && new Date(doc.expires_at) < now) {
      return res.json({ success: true, status: 'expired' });
    }
    if (doc.fulfilled_at) {
      return res.json({ success: true, status: 'verified' });
    }
    return res.json({ success: true, status: 'pending' });
  } catch (err) {
    if (dbUnavailable(res, err)) return;
    return res.status(500).json({ success: false, error: { code: 'INTERNAL', message: 'Watch failed.' } });
  }
});

router.post('/register', registerRateLimitPerHour, async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.flatten().fieldErrors },
    });
  }
  let { email, password, name, phone } = parsed.data;
  password = stripNullBytes(password, 1024);
  email = sanitizeAuthString(email, 320).toLowerCase();
  name = sanitizeAuthString(name, 200);
  if (phone) phone = sanitizeAuthString(phone, 24);
  try {
    const db = getDb();
    const deviceId = getValidatedDeviceId(req);
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DEVICE_ID_REQUIRED',
          message:
            'Your browser did not send a device id. Please use a current browser and allow local storage, then try again.',
        },
      });
    }

    if (!isEmailConfigured()) {
      return emailNotConfigured(res);
    }

    const users = db.collection('users');
    const existing = await users.findOne({ email, deleted_at: null });
    if (existing?.email_verified === true) {
      return res.status(200).json({
        success: true,
        message: 'If the email is valid, we sent a verification link.',
        verificationEmailSent: false,
      });
    }
    if (existing) {
      const pwOk = await verifyPassword(existing.password_hash, password);
      if (!pwOk) {
        return res.status(200).json({
          success: true,
          message: 'If the email is valid, we sent a verification link.',
          verificationEmailSent: false,
        });
      }
      const sinceRoll = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const sentCountExisting = await db.collection('auth_tokens').countDocuments({
        purpose: 'signup_verify',
        email,
        created_at: { $gte: sinceRoll },
      });
      if (sentCountExisting >= config.verifyEmailMaxPerDay) {
        return res.status(200).json({
          success: true,
          message: 'If the email is valid, we sent a verification link.',
          verificationEmailSent: false,
        });
      }
      const token = randomUUID() + randomUUID();
      const tokenHash = hashToken(token);
      const expiresAt = signupTokenExpiresAt();
      await db.collection('auth_tokens').insertOne({
        id: randomUUID(),
        user_id: null,
        email,
        token_hash: tokenHash,
        purpose: 'signup_verify',
        payload: {
          name: existing.name,
          phone: existing.phone ?? null,
          password_hash: existing.password_hash,
          device_id: deviceId,
        },
        expires_at: expiresAt,
        used_at: null,
        created_at: new Date(),
      });
      const verifyUrlExisting = `${config.emailLinkBase}/auth/verify-signup?email=${encodeURIComponent(
        email
      )}&token=${encodeURIComponent(token)}`;
      const watchIdExisting = await insertSignupWatch(db, email, expiresAt);
      const verificationEmailSentExisting = await sendVerifyEmail({
        to: email,
        name: existing.name,
        verifyUrl: verifyUrlExisting,
        validMinutes: config.signupVerifyTtlMinutes,
      });
      return res.status(200).json({
        success: true,
        message: 'Check your email for a verification link to finish creating your account.',
        verificationEmailSent: verificationEmailSentExisting,
        linkExpiresAt: expiresAt.toISOString(),
        watchId: watchIdExisting,
      });
    }

    // Rate limit: per email/day (rolling 24h)
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const sentCount = await db.collection('auth_tokens').countDocuments({
      purpose: 'signup_verify',
      email,
      created_at: { $gte: since },
    });
    if (sentCount >= config.verifyEmailMaxPerDay) {
      return res.status(200).json({
        success: true,
        message: 'If the email is valid, we sent a verification link.',
        verificationEmailSent: false,
      });
    }

    const usedOnDevice = await db.collection('device_signups').distinct('email', { device_id: deviceId });
    if (usedOnDevice.length >= config.maxSignupEmailsPerDevice && !usedOnDevice.includes(email)) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'DEVICE_SIGNUP_LIMIT',
          message:
            'This device has already been used to create the maximum number of accounts. Please try from another device.',
        },
      });
    }

    const ph = await hashPassword(password);
    const token = randomUUID() + randomUUID();
    const tokenHash = hashToken(token);
    const expiresAt = signupTokenExpiresAt();
    await db.collection('auth_tokens').insertOne({
      id: randomUUID(),
      user_id: null,
      email,
      token_hash: tokenHash,
      purpose: 'signup_verify',
      payload: {
        name,
        phone: phone || null,
        password_hash: ph,
        device_id: deviceId,
      },
      expires_at: expiresAt,
      used_at: null,
      created_at: new Date(),
    });

    const verifyUrl = `${config.emailLinkBase}/auth/verify-signup?email=${encodeURIComponent(
      email
    )}&token=${encodeURIComponent(token)}`;
    const watchId = await insertSignupWatch(db, email, expiresAt);
    const verificationEmailSent = await sendVerifyEmail({
      to: email,
      name,
      verifyUrl,
      validMinutes: config.signupVerifyTtlMinutes,
    });

    const out = {
      success: true,
      message: 'Check your email for a verification link to finish creating your account.',
      /** True only when the SMTP server accepted the message for this request. */
      verificationEmailSent,
      linkExpiresAt: expiresAt.toISOString(),
      watchId,
    };
    return res.status(200).json(out);
  } catch (err) {
    if (dbUnavailable(res, err)) return;
    if (err.code === 11000) {
      const kv = err.keyValue || {};
      let message = 'Email or phone already registered.';
      if (kv.email != null) message = 'Email already taken.';
      else if (kv.phone != null) message = 'Phone number already registered.';
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE', message },
      });
    }
    console.error('[auth/register]', err);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL', message: 'Registration failed.' },
    });
  }
});

router.post('/register/confirm', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    token: z.string().min(10),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.flatten().fieldErrors },
    });
  }
  try {
    const db = getDb();
    const users = db.collection('users');
    const email = parsed.data.email.toLowerCase();
    const th = hashToken(parsed.data.token);
    const tok = await db.collection('auth_tokens').findOne({
      purpose: 'signup_verify',
      token_hash: th,
      email,
      used_at: null,
      expires_at: { $gt: new Date() },
    });
    if (!tok) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired signup link.' },
      });
    }
    const payload = tok.payload || {};
    const regDevice = typeof payload.device_id === 'string' ? payload.device_id.trim().toLowerCase() : '';
    if (!regDevice) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'This link is outdated. Please start sign-up again to receive a new link.',
        },
      });
    }
    // Do not require X-Device-Id to match here — users often open the email in another app/browser
    // (Gmail, phone). Security rests on the secret token + expiry. device_id is still used for signup limits.

    const existing = await users.findOne({ email, deleted_at: null });

    if (existing?.email_verified === true) {
      await db.collection('auth_tokens').updateOne({ token_hash: th }, { $set: { used_at: new Date() } });
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE', message: 'Email already taken.' },
      });
    }

    if (existing && existing.email_verified !== true) {
      if (!passwordHashesMatch(existing.password_hash, payload.password_hash)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_TOKEN', message: 'Invalid or expired signup link.' },
        });
      }
      const now = new Date();
      const mergedName = payload.name || existing.name || 'User';
      const update = {
        email_verified: true,
        updated_at: now,
        name: mergedName,
      };
      if (payload.phone) update.phone = payload.phone;
      await users.updateOne({ id: existing.id }, { $set: update });
      await db.collection('auth_tokens').updateOne(
        { token_hash: th },
        { $set: { used_at: new Date(), user_id: existing.id } }
      );
      const userDoc = { ...existing, ...update };
      const rawRefreshUnverified = generateRefreshTokenRaw();
      await saveRefreshToken(existing.id, rawRefreshUnverified, {
        ttlDays: config.refreshTtlDays,
        userAgent: req.headers['user-agent'],
        ip: clientIp(req),
      });
      const { token: accessTokenUnverified } = signAccessToken(existing.id, existing.role || 'user');
      setUserRefreshCookie(res, rawRefreshUnverified, refreshCookieMaxAgeMs());
      await recordDeviceSignup(db, regDevice, email);
      await fulfillSignupWatchesForEmail(db, email);
      return res.json({
        success: true,
        data: {
          user: publicUser(userDoc),
          tokens: { accessToken: accessTokenUnverified, refreshToken: rawRefreshUnverified },
        },
      });
    }

    const id = randomUUID();
    const now = new Date();
    const userDoc = {
      id,
      email,
      password_hash: payload.password_hash,
      name: payload.name || 'User',
      role: 'user',
      status: 'active',
      email_verified: true,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    if (payload.phone) userDoc.phone = payload.phone;
    await users.insertOne(userDoc);
    await db.collection('auth_tokens').updateOne({ token_hash: th }, { $set: { used_at: new Date(), user_id: id } });

    const rawRefresh = generateRefreshTokenRaw();
    await saveRefreshToken(id, rawRefresh, {
      ttlDays: config.refreshTtlDays,
      userAgent: req.headers['user-agent'],
      ip: clientIp(req),
    });
    const { token: accessToken } = signAccessToken(id, userDoc.role);
    setUserRefreshCookie(res, rawRefresh, refreshCookieMaxAgeMs());
    await recordDeviceSignup(db, regDevice, email);
    await fulfillSignupWatchesForEmail(db, email);
    return res.json({
      success: true,
      data: { user: publicUser(userDoc), tokens: { accessToken, refreshToken: rawRefresh } },
    });
  } catch (err) {
    if (dbUnavailable(res, err)) return;
    return res.status(500).json({ success: false, error: { code: 'INTERNAL', message: 'Signup verification failed.' } });
  }
});

router.post(
  '/login',
  asyncRoute(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.flatten().fieldErrors },
    });
  }
  let { identifier, password, rememberMe, twoFactorCode, recoveryCode } = parsed.data;
  identifier = sanitizeAuthString(identifier, 320);
  password = stripNullBytes(password, 1024);
  const refreshDays = rememberMe ? REMEMBER_ME_REFRESH_DAYS : config.refreshTtlDays;
  const ip = clientIp(req);
  if (await isLockedOut(ip, identifier)) {
    const ms = await lockoutRemainingMs(ip, identifier);
    return res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_ATTEMPTS',
        message: `Too many failed attempts. Try again in ${Math.ceil(ms / 60000)} minute(s).`,
      },
    });
  }
  try {
    const db = getDb();
    const users = db.collection('users');
    const idTrim = identifier.trim();
    const isEmail = identifier.includes('@');
    const user = isEmail
      ? await users.findOne({ email: idTrim.toLowerCase(), deleted_at: null })
      : await users.findOne({ phone: idTrim, deleted_at: null });
    const fail = async () => {
      await recordFailure(ip, identifier);
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials.' },
      });
    };
    if (!user) return await fail();
    if (user.status === 'suspended' || user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_SUSPENDED', message: 'Account suspended.' },
      });
    }
    if (user.email_verified === false) {
      return res.status(403).json({
        success: false,
        error: { code: 'EMAIL_NOT_VERIFIED', message: 'Please verify your email to continue.' },
      });
    }
    if (user.status !== 'active') return await fail();
    if (!user.password_hash) return await fail();
    const ok = await verifyPassword(user.password_hash, password);
    if (!ok) {
      try {
        await db.collection('login_attempts').insertOne({
          identifier,
          ip,
          success: false,
          created_at: new Date(),
        });
      } catch {
        /* ignore */
      }
      return await fail();
    }
    await clearFailures(ip, identifier);
    await db.collection('login_attempts').insertOne({
      identifier,
      ip,
      success: true,
      created_at: new Date(),
    });

    // 2FA check (TOTP or recovery code) — separate lockout key so TOTP can be throttled after password succeeds
    if (user.twofa_secret) {
      const twofaKey = `${user.id}|twofa`;
      if (await isLockedOut(ip, twofaKey)) {
        const ms = await lockoutRemainingMs(ip, twofaKey);
        return res.status(429).json({
          success: false,
          error: {
            code: 'TOO_MANY_ATTEMPTS',
            message: `Too many invalid two-factor attempts. Try again in ${Math.ceil(ms / 60000)} minute(s).`,
          },
        });
      }

      const code = String(twoFactorCode || '').replace(/\s+/g, '');
      const rec = normalizeRecoveryCode(recoveryCode);
      const hashes = Array.isArray(user.twofa_recovery_hashes) ? user.twofa_recovery_hashes : [];
      const recHash = rec ? hashToken(rec) : null;

      let okTotp = false;
      if (code && user.twofa_secret) {
        try {
          okTotp = authenticator.check(code, user.twofa_secret);
        } catch {
          okTotp = false;
        }
      }
      const okRecovery = recHash ? hashes.includes(recHash) : false;

      const has2faInput = Boolean(code) || Boolean(rec);

      if (!okTotp && !okRecovery) {
        if (has2faInput) {
          await recordFailure(ip, twofaKey);
        }
        return res.status(401).json({
          success: false,
          error: {
            code: has2faInput ? 'TWO_FACTOR_INVALID' : 'TWO_FACTOR_REQUIRED',
            message: has2faInput ? 'Invalid two-factor code.' : 'Two-factor code required.',
          },
        });
      }

      await clearFailures(ip, twofaKey);

      // Consume recovery code once
      if (okRecovery && recHash) {
        await users.updateOne(
          { id: user.id },
          { $set: { twofa_recovery_hashes: hashes.filter((h) => h !== recHash) } }
        );
      }
    }

    const rawRefresh = generateRefreshTokenRaw();
    await saveRefreshToken(user.id, rawRefresh, {
      ttlDays: refreshDays,
      userAgent: req.headers['user-agent'],
      ip,
    });
    const { token: accessToken } = signAccessToken(user.id, user.role);
    try {
      setUserRefreshCookie(res, rawRefresh, refreshCookieMaxAgeMs(refreshDays));
    } catch (cookieErr) {
      console.error('[auth/login] refresh cookie failed (tokens still in JSON body)', cookieErr);
    }
    return res.json({
      success: true,
      data: {
        user: publicUser(user),
        tokens: { accessToken, refreshToken: rawRefresh },
      },
    });
  } catch (err) {
    if (dbUnavailable(res, err)) return;
    const msg = err && typeof err === 'object' && 'message' in err ? String(err.message) : '';
    if (msg.includes('secretOrPrivateKey')) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL',
          message:
            'JWT secrets are missing or invalid. Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in backend/.env (each 32+ random characters), then restart the API.',
        },
      });
    }
    console.error('[auth/login]', err);
    const detail =
      !isProd() && err && typeof err === 'object' && 'message' in err
        ? String(/** @type {{ message?: string }} */ (err).message)
        : '';
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL',
        message: isProd() ? 'Login failed.' : detail || 'Login failed.',
      },
    });
  }
  })
);

/**
 * POST /api/v1/auth/change-password
 * Requires current password. Revokes other sessions for the user.
 */
router.post('/change-password', authenticate, requireAuth, async (req, res) => {
  const schema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(10)
      .regex(/[A-Z]/, 'Password must include an uppercase letter')
      .regex(/[a-z]/, 'Password must include a lowercase letter')
      .regex(/[0-9]/, 'Password must include a digit'),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.flatten().fieldErrors },
    });
  }
  const { currentPassword, newPassword } = parsed.data;
  try {
    const db = getDb();
    const users = db.collection('users');
    const user = await users.findOne({ id: req.user.id, deleted_at: null });
    if (!user || !user.password_hash) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found.' } });
    }
    const ok = await verifyPassword(user.password_hash, stripNullBytes(currentPassword, 1024));
    if (!ok) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect.' },
      });
    }
    const nextHash = await hashPassword(stripNullBytes(newPassword, 1024));
    await users.updateOne({ id: user.id }, { $set: { password_hash: nextHash, updated_at: new Date() } });

    // Revoke other refresh sessions (keep current if present)
    const fromCookie = req.cookies?.[config.refreshCookieName];
    const fromBody = req.body?.refreshToken;
    const raw =
      typeof fromCookie === 'string' && fromCookie.length
        ? fromCookie
        : typeof fromBody === 'string'
          ? fromBody
          : '';
    const currentRow = raw ? await findValidRefreshToken(raw) : null;
    const keepId = currentRow?.id || null;
    await db.collection('refresh_tokens').updateMany(
      { user_id: user.id, revoked_at: null, ...(keepId ? { id: { $ne: keepId } } : {}) },
      { $set: { revoked_at: new Date() } }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error('[auth/change-password]', err);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL', message: 'Failed to change password.' },
    });
  }
});

/**
 * GET /api/v1/auth/sessions
 * Lists active refresh sessions for the user.
 */
router.get('/sessions', authenticate, requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const fromCookie = req.cookies?.[config.refreshCookieName];
    const raw = typeof fromCookie === 'string' ? fromCookie : '';
    const currentRow = raw ? await findValidRefreshToken(raw) : null;
    const now = new Date();
    const rows = await db
      .collection('refresh_tokens')
      .find({ user_id: req.user.id, revoked_at: null, expires_at: { $gt: now } })
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();
    return res.json({
      success: true,
      data: {
        items: rows.map((r) => ({
          id: r.id,
          createdAt: r.created_at,
          expiresAt: r.expires_at,
          ip: r.ip || null,
          userAgent: r.user_agent || null,
          sessionKind: r.session_kind || 'user',
          isCurrent: currentRow ? r.id === currentRow.id : false,
        })),
      },
    });
  } catch (err) {
    console.error('[auth/sessions]', err);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL', message: 'Failed to list sessions.' },
    });
  }
});

router.post('/sessions/revoke', authenticate, requireAuth, async (req, res) => {
  const schema = z.object({ id: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'id is required' } });
  }
  try {
    const db = getDb();
    const row = await db.collection('refresh_tokens').findOne({ id: parsed.data.id, user_id: req.user.id });
    if (!row) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session not found.' } });
    await revokeRefreshTokenId(parsed.data.id);
    return res.json({ success: true });
  } catch (err) {
    console.error('[auth/sessions/revoke]', err);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL', message: 'Failed to revoke session.' } });
  }
});

router.post('/sessions/revoke-others', authenticate, requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const fromCookie = req.cookies?.[config.refreshCookieName];
    const raw = typeof fromCookie === 'string' ? fromCookie : '';
    const currentRow = raw ? await findValidRefreshToken(raw) : null;
    const keepId = currentRow?.id || null;
    await db.collection('refresh_tokens').updateMany(
      { user_id: req.user.id, revoked_at: null, ...(keepId ? { id: { $ne: keepId } } : {}) },
      { $set: { revoked_at: new Date() } }
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('[auth/sessions/revoke-others]', err);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL', message: 'Failed to revoke other sessions.' } });
  }
});

/**
 * 2FA (TOTP)
 */
router.get('/2fa/status', authenticate, requireAuth, async (req, res) => {
  const db = getDb();
  const user = await db.collection('users').findOne({ id: req.user.id });
  return res.json({ success: true, data: { enabled: !!user?.twofa_secret } });
});

router.post('/2fa/setup', authenticate, requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const users = db.collection('users');
    const user = await users.findOne({ id: req.user.id });
    if (!user) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found.' } });
    const secret = authenticator.generateSecret();
    const label = encodeURIComponent(`AOLIC:${user.email || user.id}`);
    const issuer = encodeURIComponent('Aura Wellness');
    const otpauthUrl = `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await users.updateOne(
      { id: user.id },
      { $set: { twofa_pending_secret: secret, twofa_pending_expires_at: expiresAt } }
    );
    return res.json({ success: true, data: { secret, otpauthUrl, expiresAt } });
  } catch (err) {
    console.error('[auth/2fa/setup]', err);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL', message: 'Failed to start 2FA setup.' } });
  }
});

router.post('/2fa/enable', authenticate, requireAuth, async (req, res) => {
  const schema = z.object({ code: z.string().min(4).max(32) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'code is required' } });
  }
  try {
    const db = getDb();
    const users = db.collection('users');
    const user = await users.findOne({ id: req.user.id });
    const pending = user?.twofa_pending_secret;
    const exp = user?.twofa_pending_expires_at ? new Date(user.twofa_pending_expires_at) : null;
    if (!pending || !exp || exp <= new Date()) {
      return res.status(400).json({ success: false, error: { code: 'SETUP_EXPIRED', message: '2FA setup expired. Start again.' } });
    }
    const ok = authenticator.check(String(parsed.data.code).replace(/\s+/g, ''), pending);
    if (!ok) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_CODE', message: 'Invalid code.' } });
    }
    const codes = generateRecoveryCodes(10);
    const hashes = codes.map((c) => hashToken(normalizeRecoveryCode(c)));
    await users.updateOne(
      { id: user.id },
      {
        $set: { twofa_secret: pending, twofa_recovery_hashes: hashes },
        $unset: { twofa_pending_secret: '', twofa_pending_expires_at: '' },
      }
    );
    return res.json({ success: true, data: { recoveryCodes: codes } });
  } catch (err) {
    console.error('[auth/2fa/enable]', err);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL', message: 'Failed to enable 2FA.' } });
  }
});

router.post('/2fa/disable', authenticate, requireAuth, async (req, res) => {
  const schema = z.object({ password: z.string().min(1), code: z.string().min(4).max(64) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'password and code required' } });
  }
  try {
    const db = getDb();
    const users = db.collection('users');
    const user = await users.findOne({ id: req.user.id });
    if (!user || !user.password_hash) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found.' } });
    if (!user.twofa_secret) return res.json({ success: true });
    const okPw = await verifyPassword(user.password_hash, stripNullBytes(parsed.data.password, 1024));
    if (!okPw) return res.status(401).json({ success: false, error: { code: 'INVALID_PASSWORD', message: 'Password incorrect.' } });
    const code = String(parsed.data.code).replace(/\s+/g, '');
    const rec = normalizeRecoveryCode(parsed.data.code);
    const hashes = Array.isArray(user.twofa_recovery_hashes) ? user.twofa_recovery_hashes : [];
    const okTotp = authenticator.check(code, user.twofa_secret);
    const okRecovery = rec ? hashes.includes(hashToken(rec)) : false;
    if (!okTotp && !okRecovery) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_CODE', message: 'Invalid code.' } });
    }
    await users.updateOne(
      { id: user.id },
      { $unset: { twofa_secret: '', twofa_recovery_hashes: '' } }
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('[auth/2fa/disable]', err);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL', message: 'Failed to disable 2FA.' } });
  }
});

/**
 * POST /api/v1/auth/verify-email/request
 * Resend verification email (rate limited per email/day).
 */
router.post('/verify-email/request', async (req, res) => {
  const email = z.string().email().safeParse(req.body?.email);
  if (!email.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Valid email required.' },
    });
  }
  if (!isEmailConfigured()) {
    return emailNotConfigured(res);
  }
  const normalized = email.data.toLowerCase();
  try {
    const db = getDb();
    const users = db.collection('users');
    const user = await users.findOne({ email: normalized, deleted_at: null });
    // Always return generic success to avoid account enumeration.
    if (!user) {
      return res.json({ success: true, message: 'If an account exists, verification email was sent.' });
    }
    if (user.email_verified) {
      return res.json({ success: true, message: 'If an account exists, verification email was sent.' });
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const sentCount = await db.collection('auth_tokens').countDocuments({
      purpose: 'email_verify',
      email: normalized,
      created_at: { $gte: since },
    });
    if (sentCount >= config.verifyEmailMaxPerDay) {
      return res.json({ success: true, message: 'If an account exists, verification email was sent.' });
    }

    const token = randomUUID() + randomUUID();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await db.collection('auth_tokens').insertOne({
      id: randomUUID(),
      user_id: user.id,
      email: normalized,
      token_hash: tokenHash,
      purpose: 'email_verify',
      expires_at: expiresAt,
      used_at: null,
      created_at: new Date(),
    });
    const verifyUrl = `${config.emailLinkBase}/auth/verify-email?email=${encodeURIComponent(
      normalized
    )}&token=${encodeURIComponent(token)}`;
    await sendVerifyEmail({
      to: normalized,
      name: user.name,
      verifyUrl,
      validMinutes: 24 * 60,
    });
    return res.json({ success: true, message: 'If an account exists, verification email was sent.' });
  } catch (err) {
    if (dbUnavailable(res, err)) return;
    return res.json({ success: true, message: 'If an account exists, verification email was sent.' });
  }
});

/**
 * POST /api/v1/auth/verify-email/confirm
 * Confirms verification token and marks user email as verified.
 */
router.post('/verify-email/confirm', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    token: z.string().min(10),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.flatten().fieldErrors },
    });
  }
  try {
    const { email, token } = parsed.data;
    const normalized = email.toLowerCase();
    const th = hashToken(token);
    const db = getDb();
    const tok = await db.collection('auth_tokens').findOne({
      purpose: 'email_verify',
      token_hash: th,
      email: normalized,
      used_at: null,
      expires_at: { $gt: new Date() },
    });
    if (!tok) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired verification link.' },
      });
    }
    await db.collection('users').updateOne(
      { id: tok.user_id },
      { $set: { email_verified: true, updated_at: new Date() } }
    );
    await db.collection('auth_tokens').updateOne({ token_hash: th }, { $set: { used_at: new Date() } });
    return res.json({ success: true });
  } catch (err) {
    if (dbUnavailable(res, err)) return;
    return res.status(500).json({ success: false, error: { message: 'Verification failed.' } });
  }
});

router.post('/refresh', async (req, res) => {
  const fromCookie = req.cookies?.[config.refreshCookieName];
  const fromBody = req.body?.refreshToken;
  const raw =
    typeof fromCookie === 'string' && fromCookie.length
      ? fromCookie
      : typeof fromBody === 'string'
        ? fromBody
        : '';
  if (!raw.length) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Refresh session missing. Sign in again.' },
    });
  }
  try {
    const row = await findValidRefreshToken(raw);
    if (!row) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_REFRESH', message: 'Session expired. Please sign in again.' },
      });
    }
    const db = getDb();
    const user = await db.collection('users').findOne({ id: row.user_id, deleted_at: null });
    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_REFRESH', message: 'Account inactive.' },
      });
    }
    const newRaw = generateRefreshTokenRaw();
    await rotateRefreshToken(row, newRaw, {
      userAgent: req.headers['user-agent'],
      ip: clientIp(req),
      ttlDays: config.refreshTtlDays,
      sessionKind: row.session_kind || 'user',
    });
    const { token: accessToken } = signAccessToken(user.id, user.role);
    setUserRefreshCookie(res, newRaw, refreshCookieMaxAgeMs());
    return res.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRaw,
      },
    });
  } catch (err) {
    if (dbUnavailable(res, err)) return;
    console.error('[auth/refresh]', err);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL', message: 'Refresh failed.' },
    });
  }
});

router.post('/logout', authenticate, async (req, res) => {
  const rawRefresh =
    (typeof req.cookies?.[config.refreshCookieName] === 'string' && req.cookies[config.refreshCookieName]) ||
    req.body?.refreshToken;
  try {
    if (typeof rawRefresh === 'string' && rawRefresh.length) {
      const row = await findValidRefreshToken(rawRefresh);
      if (row) await revokeRefreshTokenId(row.id);
    }
    if (req.user?.jti && req.user?.id && req.accessTokenRaw) {
      const exp = jwt.decode(req.accessTokenRaw)?.exp;
      const expIso = exp ? new Date(exp * 1000).toISOString() : new Date(Date.now() + 20 * 60 * 1000).toISOString();
      await revokeAccessJti(req.user.jti, req.user.id, expIso);
    }
    clearUserRefreshCookie(res);
    return res.json({ success: true });
  } catch (err) {
    if (dbUnavailable(res, err)) return;
    clearUserRefreshCookie(res);
    return res.json({ success: true });
  }
});

router.get('/me', authenticate, requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const user = await db.collection('users').findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found.' },
      });
    }
    return res.json({
      success: true,
      data: { user: publicUser(user) },
    });
  } catch (err) {
    if (dbUnavailable(res, err)) return;
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL', message: 'Failed to load user.' },
    });
  }
});

router.post('/anonymous', async (req, res) => {
  const id = randomUUID();
  try {
    const db = getDb();
    await db.collection('anonymous_guests').insertOne({ id, created_at: new Date() });
    return res.json({ success: true, data: { anonymousId: id } });
  } catch (err) {
    if (dbUnavailable(res, err)) return;
    if (err.code === 11000) {
      return res.json({ success: true, data: { anonymousId: id } });
    }
    return res.json({ success: true, data: { anonymousId: id } });
  }
});

router.post('/forgot-password', async (req, res) => {
  const email = z.string().email().safeParse(req.body?.email);
  if (!email.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Valid email required.' },
    });
  }
  if (!isEmailConfigured()) {
    return emailNotConfigured(res);
  }
  try {
    const db = getDb();
    const users = db.collection('users');
    const user = await users.findOne({ email: email.data.toLowerCase() });
    const token = randomUUID() + randomUUID();
    const tokenHash = hashToken(token);
    if (user) {
      // Rate limit: per user/email per day (rolling 24h)
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const sentCount = await db.collection('auth_tokens').countDocuments({
        purpose: 'password_reset',
        email: email.data.toLowerCase(),
        created_at: { $gte: since },
      });
      if (sentCount >= config.resetPasswordMaxPerDay) {
        return res.json({
          success: true,
          message: 'If an account exists, reset instructions were sent.',
        });
      }

      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await db.collection('auth_tokens').insertOne({
        id: randomUUID(),
        user_id: user.id,
        email: email.data.toLowerCase(),
        token_hash: tokenHash,
        purpose: 'password_reset',
        expires_at: expiresAt,
        used_at: null,
        created_at: new Date(),
      });

      const resetUrl = `${config.emailLinkBase}/auth/reset-password?email=${encodeURIComponent(
        email.data.toLowerCase()
      )}&token=${encodeURIComponent(token)}`;
      await sendPasswordResetEmail({
        to: email.data.toLowerCase(),
        name: user.name,
        resetUrl,
      });
    }
    return res.json({
      success: true,
      message: 'If an account exists, reset instructions were sent.',
    });
  } catch (err) {
    if (dbUnavailable(res, err)) return;
    return res.json({ success: true });
  }
});

router.post('/reset-password', async (req, res) => {
  const strongPw = z
    .string()
    .min(10)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/);
  const schema = z.object({
    email: z.string().email(),
    token: z.string().min(10),
    newPassword: strongPw,
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.flatten().fieldErrors },
    });
  }
  try {
    const { email, token, newPassword } = parsed.data;
    const th = hashToken(token);
    const db = getDb();
    const tok = await db.collection('auth_tokens').findOne({
      purpose: 'password_reset',
      token_hash: th,
      email: email.toLowerCase(),
      used_at: null,
      expires_at: { $gt: new Date() },
    });
    if (!tok) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired reset link.' },
      });
    }
    const ph = await hashPassword(newPassword);
    await db.collection('users').updateOne({ id: tok.user_id }, { $set: { password_hash: ph, updated_at: new Date() } });
    await db.collection('auth_tokens').updateOne({ token_hash: th }, { $set: { used_at: new Date() } });
    return res.json({ success: true });
  } catch (err) {
    if (dbUnavailable(res, err)) return;
    return res.status(500).json({ success: false, error: { message: 'Reset failed.' } });
  }
});

/** Legacy Events admin — replaces Supabase `admin-verify` edge function when EVENTS_ADMIN_PASSWORD is set. */
router.post('/events-admin-verify', async (req, res) => {
  const password = req.body?.password;
  if (!config.eventsAdminPassword) {
    return res.status(503).json({
      success: false,
      error: { code: 'NOT_CONFIGURED', message: 'Events admin password not configured on server.' },
    });
  }
  if (typeof password === 'string' && password === config.eventsAdminPassword) {
    return res.json({ success: true, data: { adminId: 'events-admin' } });
  }
  return res.status(401).json({ success: false, error: { message: 'Invalid password.' } });
});

export default router;
