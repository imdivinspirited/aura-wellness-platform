import { Router } from 'express';
import { randomUUID, timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';
import { getDb, isMongoReady } from '../db.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { config, isProd } from '../config.js';
import {
  signRootAccessToken,
  signRootRefreshToken,
  verifyRootRefreshToken,
} from '../lib/rootJwt.js';
import { revokeAccessJti } from '../lib/tokenStore.js';
import { requireRootAuth } from '../middleware/rootAuthMiddleware.js';
import { setRootRefreshCookieSession, clearRootRefreshCookie } from '../lib/httpCookies.js';

const router = Router();

/** Detailed root auth messages (wrong email vs wrong password, which email is root). Off in production unless ROOT_DEV_AUTH_HINTS=1. */
function rootAuthDetailErrors() {
  return !isProd() || process.env.ROOT_DEV_AUTH_HINTS === '1';
}

/** Same value as `config.rootSecretKey` — exported for scripts/tests that need the phrase. */
export const ROOT_SECRET_PHRASE = config.rootSecretKey;

/** @param {string} input */
function verifySecretPhraseConstantTime(input) {
  const a = Buffer.from(String(config.rootSecretKey), 'utf8');
  const b = Buffer.from(String(input ?? ''), 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function clientIp(req) {
  const x = req.headers['x-forwarded-for'];
  if (typeof x === 'string' && x.length) return x.split(',')[0].trim();
  return req.socket?.remoteAddress || '';
}

/** Login lockout: 5 fails → 1 hour per IP+identifier */
const rootLoginLock = new Map();

function lockKey(ip, ident) {
  return `${ip}|${String(ident).toLowerCase()}`;
}

function isRootLockedOut(ip, ident) {
  const e = rootLoginLock.get(lockKey(ip, ident));
  if (!e?.lockedUntil) return false;
  if (Date.now() < e.lockedUntil) return true;
  rootLoginLock.delete(lockKey(ip, ident));
  return false;
}

function rootLockoutRemainingMs(ip, ident) {
  const e = rootLoginLock.get(lockKey(ip, ident));
  if (!e?.lockedUntil) return 0;
  return Math.max(0, e.lockedUntil - Date.now());
}

function recordRootFailure(ip, ident) {
  const k = lockKey(ip, ident);
  let e = rootLoginLock.get(k) || { fails: 0, lockedUntil: 0 };
  e.fails += 1;
  if (e.fails >= 5) {
    e.lockedUntil = Date.now() + 60 * 60 * 1000;
    e.fails = 0;
  }
  rootLoginLock.set(k, e);
}

function clearRootFailures(ip, ident) {
  rootLoginLock.delete(lockKey(ip, ident));
}

async function logSignup(db, { success, ip, reason, email }) {
  try {
    await db.collection('root_signup_attempts').insertOne({
      id: randomUUID(),
      success,
      reason: reason || null,
      email: email || null,
      ip: ip || null,
      created_at: new Date(),
    });
  } catch (e) {
    console.error('[root/signup log]', e?.message || e);
  }
}

async function logRootLogin(db, { success, ip, userAgent, identifier, reason }) {
  try {
    await db.collection('root_login_attempts').insertOne({
      id: randomUUID(),
      identifier: String(identifier || ''),
      success,
      reason: reason || null,
      ip: ip || null,
      user_agent: userAgent || null,
      created_at: new Date(),
    });
    await db.collection('audit_log').insertOne({
      id: randomUUID(),
      actor_type: 'root',
      actor_id: String(identifier || 'unknown'),
      action: success ? 'ROOT_LOGIN_SUCCESS' : 'ROOT_LOGIN_FAILED',
      resource: 'users',
      payload: { reason: reason || null },
      ip: ip || null,
      created_at: new Date(),
    });
  } catch (e) {
    console.error('[root/login log]', e?.message || e);
  }
}

function publicRootUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: 'root',
  };
}

function isValidEmail(s) {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

function passwordStrengthError(pw) {
  if (typeof pw !== 'string' || pw.length < 8) {
    return 'Password must be at least 8 characters.';
  }
  if (!/[A-Z]/.test(pw)) return 'Password must include an uppercase letter.';
  if (!/[0-9]/.test(pw)) return 'Password must include a number.';
  if (!/[^A-Za-z0-9]/.test(pw)) return 'Password must include a special character.';
  return null;
}

/** POST /root/signup — name, email, password (no username) */
router.post('/signup', async (req, res) => {
  const ip = clientIp(req);
  const b = req.body || {};
  const fromName = typeof b.name === 'string' ? b.name.trim() : '';
  const fromFullName = typeof b.fullName === 'string' ? b.fullName.trim() : '';
  const displayName = fromName || fromFullName;
  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : '';
  const password = b.password;
  const confirmPassword = b.confirmPassword;
  const secretKey = b.secretKey;

  console.info(`[root/signup] attempt ts=${new Date().toISOString()} ip=${ip || 'unknown'} email=${email || '(none)'}`);

  if (!displayName || !email || password == null || confirmPassword == null || secretKey == null) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION', message: 'All fields required' },
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION', message: 'Valid email required' },
    });
  }

  if (!isMongoReady()) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: 'Database is not connected. Start MongoDB and ensure MONGODB_URI is set in backend/.env.',
      },
    });
  }

  if (!verifySecretPhraseConstantTime(secretKey)) {
    const db = getDb();
    await logSignup(db, { success: false, ip, reason: 'invalid_secret', email });
    try {
      await db.collection('security_events').insertOne({
        id: randomUUID(),
        type: 'ROOT_SIGNUP_INVALID_SECRET',
        ip,
        created_at: new Date(),
      });
    } catch {
      /* ignore */
    }
    return res.status(403).json({
      success: false,
      error: { code: 'INVALID_SECRET', message: 'Invalid secret key' },
    });
  }

  try {
    const db = getDb();

    const existingRoot = await db.collection('users').findOne({ role: 'root', deleted_at: null });
    if (existingRoot) {
      await logSignup(db, { success: false, ip, reason: 'root_exists', email });
      const msg = rootAuthDetailErrors()
        ? `Root already exists for email: ${existingRoot.email}. Sign in with that email and password, or run CONFIRM_CLEAR_ROOT=yes npm run clear-root (backend folder) to remove it and sign up again.`
        : 'Root account already exists. Please sign in with that account.';
      return res.status(403).json({
        success: false,
        message: msg,
        error: {
          code: 'ROOT_EXISTS',
          message: msg,
        },
      });
    }

    const userByEmail = await db.collection('users').findOne({ email, deleted_at: null });
    if (userByEmail) {
      await logSignup(db, { success: false, ip, reason: 'email_taken', email });
      return res.status(409).json({
        success: false,
        error: { code: 'EMAIL_TAKEN', message: 'Email already registered' },
      });
    }

    if (String(password) !== String(confirmPassword)) {
      return res.status(400).json({
        success: false,
        error: { code: 'PASSWORD_MISMATCH', message: 'Passwords do not match' },
      });
    }

    const pwErr = passwordStrengthError(String(password));
    if (pwErr) {
      return res.status(400).json({
        success: false,
        error: { code: 'WEAK_PASSWORD', message: pwErr },
      });
    }

    const id = randomUUID();
    const now = new Date();
    const password_hash = await hashPassword(String(password));

    await db.collection('users').insertOne({
      id,
      name: displayName,
      email,
      phone: null,
      password_hash,
      role: 'root',
      secret_key_verified: true,
      status: 'active',
      login_history: [],
      signup_ip: ip || null,
      signup_timestamp: now,
      last_login_at: null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    });

    await logSignup(db, { success: true, ip, reason: null, email });

    return res.status(201).json({
      success: true,
      message: 'Root account created successfully',
    });
  } catch (err) {
    console.error('[root/signup]', err);
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE', message: 'Email already registered' },
      });
    }
    if (err.code === 'MONGO_UNAVAILABLE' || err.code === 'DATABASE_NOT_CONFIGURED') {
      return res.status(503).json({
        success: false,
        error: {
          code: err.code,
          message:
            err.code === 'DATABASE_NOT_CONFIGURED'
              ? 'MongoDB URI is not configured in backend/.env.'
              : 'Database is not connected.',
        },
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL', message: 'Signup failed.' },
    });
  }
});

/** POST /root/login */
router.post('/login', async (req, res) => {
  const identifierRaw = req.body?.email ?? req.body?.identifier;
  const password = req.body?.password;
  const secretKey = req.body?.secretKey;

  if (
    typeof identifierRaw !== 'string' ||
    !identifierRaw.trim() ||
    typeof password !== 'string' ||
    !password.length ||
    typeof secretKey !== 'string'
  ) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION', message: 'Email, password, and secret key required' },
    });
  }

  const identEarly = identifierRaw.trim().toLowerCase();
  if (!isValidEmail(identEarly)) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION', message: 'Valid email required' },
    });
  }

  if (!isMongoReady()) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: 'Database is not connected. Start MongoDB and ensure MONGODB_URI is set in backend/.env.',
      },
    });
  }

  if (!verifySecretPhraseConstantTime(secretKey)) {
    const db = getDb();
    await logRootLogin(db, {
      success: false,
      ip: clientIp(req),
      userAgent: req.headers['user-agent'],
      identifier: identifierRaw,
      reason: 'invalid_secret',
    });
    try {
      await db.collection('security_events').insertOne({
        id: randomUUID(),
        type: 'ROOT_LOGIN_INVALID_SECRET',
        ip: clientIp(req),
        created_at: new Date(),
      });
    } catch {
      /* ignore */
    }
    return res.status(403).json({
      success: false,
      error: { code: 'INVALID_SECRET', message: 'Invalid secret key' },
    });
  }

  const ip = clientIp(req);
  const ident = identEarly;

  if (config.rootAllowedIps.length && !config.rootAllowedIps.includes(ip)) {
    return res.status(403).json({
      success: false,
      error: { code: 'IP_NOT_ALLOWED', message: 'Root access denied from this network.' },
    });
  }

  if (isRootLockedOut(ip, ident)) {
    const ms = rootLockoutRemainingMs(ip, ident);
    return res.status(429).json({
      success: false,
      error: {
        code: 'LOCKED_OUT',
        message: `Too many failed attempts. Try again in ${Math.ceil(ms / 60000)} minute(s).`,
      },
    });
  }

  try {
    const db = getDb();
    const user = await db.collection('users').findOne({
      email: ident,
      role: 'root',
      deleted_at: null,
    });

    const fail = async (reason) => {
      recordRootFailure(ip, ident);
      await logRootLogin(db, {
        success: false,
        ip,
        userAgent: req.headers['user-agent'],
        identifier: ident,
        reason,
      });
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID', message: 'Invalid credentials' },
      });
    };

    if (!user) {
      if (rootAuthDetailErrors()) {
        recordRootFailure(ip, ident);
        await logRootLogin(db, {
          success: false,
          ip,
          userAgent: req.headers['user-agent'],
          identifier: ident,
          reason: 'not_found',
        });
        return res.status(401).json({
          success: false,
          error: {
            code: 'ROOT_EMAIL_UNKNOWN',
            message:
              'No root user with this email. Root is already taken by another email (e.g. a test signup). From the backend folder run: npm run list-root — then sign in with that email, or CONFIRM_CLEAR_ROOT=yes npm run clear-root to remove it and sign up again.',
          },
        });
      }
      return fail('not_found');
    }

    if (!user.password_hash) {
      await logRootLogin(db, {
        success: false,
        ip,
        userAgent: req.headers['user-agent'],
        identifier: ident,
        reason: 'no_password_hash',
      });
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID',
          message: rootAuthDetailErrors()
            ? 'This root user has no password set. Run CONFIRM_CLEAR_ROOT=yes npm run clear-root in backend, then sign up again.'
            : 'Invalid credentials',
        },
      });
    }

    if (user.status && user.status !== 'active') {
      await logRootLogin(db, {
        success: false,
        ip,
        userAgent: req.headers['user-agent'],
        identifier: ident,
        reason: 'inactive',
      });
      return res.status(403).json({
        success: false,
        error: { code: 'SUSPENDED', message: 'Account suspended' },
      });
    }

    const ok = await verifyPassword(user.password_hash, password);
    if (!ok) {
      if (rootAuthDetailErrors()) {
        recordRootFailure(ip, ident);
        await logRootLogin(db, {
          success: false,
          ip,
          userAgent: req.headers['user-agent'],
          identifier: ident,
          reason: 'bad_password',
        });
        return res.status(401).json({
          success: false,
          error: {
            code: 'ROOT_BAD_PASSWORD',
            message:
              'Wrong password for this root account. If you did not create this user, run npm run list-root to see which email is root, or clear-root to reset (local dev).',
          },
        });
      }
      return fail('bad_password');
    }

    clearRootFailures(ip, ident);

    const loginEntry = {
      at: new Date().toISOString(),
      ip: ip || null,
      user_agent: req.headers['user-agent'] || null,
    };

    const prevHist = Array.isArray(user.login_history) ? user.login_history : [];
    const login_history = [...prevHist, loginEntry].slice(-50);

    await db.collection('users').updateOne(
      { id: user.id },
      {
        $set: {
          last_login_at: new Date(),
          updated_at: new Date(),
          login_history,
        },
      }
    );

    await logRootLogin(db, {
      success: true,
      ip,
      userAgent: req.headers['user-agent'],
      identifier: ident,
      reason: null,
    });

    const { token: accessToken } = signRootAccessToken(user.id);
    const refreshToken = signRootRefreshToken(user.id);
    setRootRefreshCookieSession(res, refreshToken);

    return res.json({
      success: true,
      data: {
        accessToken,
        user: publicRootUser(user),
      },
    });
  } catch (err) {
    console.error('[root/login]', err);
    if (err.code === 'MONGO_UNAVAILABLE' || err.code === 'DATABASE_NOT_CONFIGURED') {
      return res.status(503).json({
        success: false,
        error: {
          code: err.code,
          message:
            err.code === 'DATABASE_NOT_CONFIGURED'
              ? 'MongoDB URI is not configured in backend/.env.'
              : 'Database is not connected.',
        },
      });
    }
    const detail =
      !isProd() && err && typeof err === 'object' && 'message' in err ? String(err.message) : '';
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL',
        message: isProd() ? 'Login failed.' : detail || 'Login failed.',
      },
    });
  }
});

/** POST /root/refresh */
router.post('/refresh', (req, res) => {
  const raw = req.cookies?.[config.rootRefreshCookieName];
  if (typeof raw !== 'string' || !raw.length) {
    return res.status(401).json({
      success: false,
      error: { code: 'NO_REFRESH', message: 'No root session.' },
    });
  }
  try {
    const payload = verifyRootRefreshToken(raw);
    const { token: accessToken } = signRootAccessToken(payload.sub);
    const nextRefresh = signRootRefreshToken(payload.sub);
    setRootRefreshCookieSession(res, nextRefresh);
    return res.json({
      success: true,
      data: { accessToken },
    });
  } catch {
    clearRootRefreshCookie(res);
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_REFRESH', message: 'Root session expired.' },
    });
  }
});

/** POST /root/logout — clears httpOnly refresh cookie; blacklists Bearer access token if present */
router.post('/logout', async (req, res) => {
  clearRootRefreshCookie(res);
  const h = req.headers.authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(h);
  if (m) {
    try {
      const decoded = jwt.decode(m[1]);
      const jti = decoded && typeof decoded === 'object' ? decoded.jti : undefined;
      const sub = decoded && typeof decoded === 'object' ? decoded.sub : undefined;
      const exp = decoded && typeof decoded === 'object' ? decoded.exp : undefined;
      if (typeof jti === 'string' && typeof sub === 'string' && typeof exp === 'number') {
        const expIso = new Date(exp * 1000).toISOString();
        await revokeAccessJti(jti, sub, expIso);
      }
    } catch (e) {
      console.error('[root/logout]', e?.message || e);
    }
  }
  return res.json({ success: true });
});

/** GET /root/me */
router.get('/me', requireRootAuth, async (req, res) => {
  try {
    const db = getDb();
    const user = await db.collection('users').findOne({ id: req.rootUser.id, role: 'root', deleted_at: null });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Root user not found.' },
      });
    }
    return res.json({
      success: true,
      data: { user: publicRootUser(user) },
    });
  } catch (e) {
    console.error('[root/me]', e);
    return res.status(500).json({ success: false, error: { message: 'Failed.' } });
  }
});

/** Legacy: recent attempts — keep for admin */
router.get('/security/recent-logins', requireRootAuth, async (_req, res) => {
  try {
    const db = getDb();
    const rows = await db
      .collection('root_login_attempts')
      .find({})
      .sort({ created_at: -1 })
      .limit(100)
      .toArray();
    return res.json({ success: true, data: { attempts: rows } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, error: { message: 'Failed to load log.' } });
  }
});

export default router;
