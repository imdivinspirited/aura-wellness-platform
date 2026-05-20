/**
 * Authentication Routes
 *
 * Login, register, refresh token, anonymous user creation.
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { authRateLimiter } from '../middleware/rateLimiter';
import { authenticate, AuthRequest } from '../middleware/auth';
import crypto from 'crypto';
import { RefreshToken } from '../models/RefreshToken';
import { PasswordResetToken } from '../models/PasswordResetToken';
import { isEmailConfigured, sendPasswordResetEmail } from '../services/email';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('CRITICAL: JWT_SECRET and JWT_REFRESH_SECRET environment variables must be set');
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const APP_WEB_URL = (process.env.APP_WEB_URL || 'http://localhost:5173').replace(/\/$/, '');

function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

// Generate tokens
function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, JWT_SECRET as string, {
    expiresIn: JWT_EXPIRES_IN as any,
  } as any);

  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET as string, {
    expiresIn: JWT_REFRESH_EXPIRES_IN as any,
  } as any);

  return { accessToken, refreshToken };
}

async function persistRefreshToken(opts: {
  userId: string;
  refreshToken: string;
  req: Request;
}): Promise<void> {
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

function parseDurationMs(value: string): number {
  // minimal parser supporting: 15m, 7d, 24h, 3600s
  const v = String(value || '').trim();
  const m = v.match(/^(\d+)\s*([smhd])$/i);
  if (!m) {
    // Fallback: 7 days
    return 7 * 24 * 60 * 60 * 1000;
  }
  const n = parseInt(m[1], 10);
  const unit = m[2].toLowerCase();
  if (unit === 's') return n * 1000;
  if (unit === 'm') return n * 60 * 1000;
  if (unit === 'h') return n * 60 * 60 * 1000;
  return n * 24 * 60 * 60 * 1000;
}

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
authRouter.post(
  '/register',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').trim().notEmpty(),
    body('phone').optional().isString().trim(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { message: 'Validation failed', errors: errors.array() },
        });
      }

      const { email, password, name, phone } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: { message: 'User already exists' },
        });
      }

      // Create user
      const user = new User({
        email,
        password,
        name,
        phone,
      });

      await user.save();

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id.toString());
      await persistRefreshToken({ userId: user._id.toString(), refreshToken, req });

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            roles: user.roles,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Registration failed' },
      });
      return;
    }
  }
);

/**
 * POST /api/v1/auth/login
 * Login user
 */
authRouter.post(
  '/login',
  authRateLimiter,
  [
    body('identifier').optional().isString().trim().notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().isString().trim().notEmpty(),
    body('password').notEmpty(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { message: 'Validation failed', errors: errors.array() },
        });
      }

      const { identifier, email, phone, password } = req.body as {
        identifier?: string;
        email?: string;
        phone?: string;
        password: string;
      };

      const rawId = (identifier || email || phone || '').trim();
      if (!rawId) {
        return res.status(400).json({
          success: false,
          error: { message: 'Email or phone is required' },
        });
      }

      const isEmail = rawId.includes('@');
      const query = isEmail ? { email: rawId.toLowerCase() } : { phone: rawId };

      // Find user with password
      const user = await User.findOne(query).select('+password');
      if (!user || !user.password) {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid credentials' },
        });
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid credentials' },
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id.toString());
      await persistRefreshToken({ userId: user._id.toString(), refreshToken, req });

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      res.json({
        success: true,
        data: {
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            roles: user.roles,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Login failed' },
      });
      return;
    }
  }
);

/**
 * POST /api/v1/auth/anonymous
 * Create or get anonymous user ID
 */
authRouter.post('/anonymous', async (req: Request, res: Response) => {
  try {
    const { anonymousId } = req.body;

    if (anonymousId) {
      // Verify anonymous ID exists
      const user = await User.findOne({ anonymousId });
      if (user) {
        return res.json({
          success: true,
          data: { anonymousId: user.anonymousId },
        });
      }
    }

    // Generate new anonymous ID
    const newAnonymousId = `anon_${crypto.randomUUID()}_${Date.now()}`;
    const user = new User({
      anonymousId: newAnonymousId,
      name: 'Guest User',
      email: `${newAnonymousId}@anonymous.local`,
    });

    await user.save();

    res.json({
      success: true,
      data: { anonymousId: newAnonymousId },
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create anonymous user' },
    });
    return;
  }
});

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
authRouter.post(
  '/refresh',
  [
    body('refreshToken').notEmpty(),
  ],
  async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET as string) as unknown as { userId: string };
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid refresh token' },
        });
      }

      if (user.status && user.status !== 'active') {
        return res.status(401).json({
          success: false,
          error: { message: 'Account is not active' },
        });
      }

      const tokenHash = sha256Hex(refreshToken);
      const stored = await RefreshToken.findOne({
        userId: user._id,
        tokenHash,
        revokedAt: { $exists: false },
      });
      if (!stored) {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid refresh token' },
        });
      }

      // Rotate refresh tokens: revoke old, issue new access+refresh
      const { accessToken, refreshToken: nextRefreshToken } = generateTokens(user._id.toString());
      const nextHash = sha256Hex(nextRefreshToken);

      stored.revokedAt = new Date();
      stored.replacedByTokenHash = nextHash;
      await stored.save();
      await persistRefreshToken({ userId: user._id.toString(), refreshToken: nextRefreshToken, req });

      res.json({
        success: true,
        data: { accessToken, refreshToken: nextRefreshToken },
      });
      return;
    } catch (error) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid refresh token' },
      });
      return;
    }
  }
);

/**
 * POST /api/v1/auth/logout
 * Logout by revoking a refresh token (client should also clear storage).
 */
authRouter.post(
  '/logout',
  [body('refreshToken').optional().isString().trim().notEmpty()],
  async (req: Request, res: Response) => {
    try {
      const refreshToken = (req.body?.refreshToken as string | undefined) || '';
      if (refreshToken) {
        const tokenHash = sha256Hex(refreshToken);
        await RefreshToken.updateOne({ tokenHash }, { $set: { revokedAt: new Date() } });
      }
      res.json({ success: true });
      return;
    } catch {
      // logout should be best-effort
      res.json({ success: true });
      return;
    }
  }
);

/**
 * POST /api/v1/auth/forgot-password
 * Always returns success to avoid email enumeration.
 */
authRouter.post(
  '/forgot-password',
  authRateLimiter,
  [body('email').isEmail().normalizeEmail()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', errors: errors.array() },
      });
    }

    const email = String(req.body.email).toLowerCase().trim();
    if (!isEmailConfigured()) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'EMAIL_NOT_CONFIGURED',
          message: 'Email delivery is not configured on the server.',
        },
      });
    }
    const user = await User.findOne({ email });
    if (user && user.status === 'active') {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = sha256Hex(rawToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await PasswordResetToken.create({
        userId: user._id,
        tokenHash,
        expiresAt,
      });

      const resetUrl = `${APP_WEB_URL}/auth/reset-password?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(email)}`;
      await sendPasswordResetEmail({ to: email, name: user.name, resetUrl });
    }

    res.json({ success: true });
    return;
  }
);

/**
 * POST /api/v1/auth/reset-password
 */
authRouter.post(
  '/reset-password',
  authRateLimiter,
  [body('email').isEmail().normalizeEmail(), body('token').isString().trim().notEmpty(), body('newPassword').isLength({ min: 8 })],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', errors: errors.array() },
      });
    }

    const email = String(req.body.email).toLowerCase().trim();
    const token = String(req.body.token).trim();
    const newPassword = String(req.body.newPassword);

    const user = await User.findOne({ email }).select('+password');
    if (!user || user.status !== 'active') {
      return res.status(400).json({ success: false, error: { message: 'Invalid reset request' } });
    }

    const tokenHash = sha256Hex(token);
    const record = await PasswordResetToken.findOne({
      userId: user._id,
      tokenHash,
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });
    if (!record) {
      return res.status(400).json({ success: false, error: { message: 'Invalid or expired token' } });
    }

    user.password = newPassword;
    await user.save();

    record.usedAt = new Date();
    await record.save();

    // Revoke all refresh tokens for safety
    await RefreshToken.updateMany({ userId: user._id, revokedAt: { $exists: false } }, { $set: { revokedAt: new Date() } });

    res.json({ success: true });
    return;
  }
);

/**
 * POST /api/v1/auth/confirm-password
 * Used before danger-zone actions.
 */
authRouter.post(
  '/confirm-password',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, error: { message: 'Authentication required' } });
      }
      const password = String(req.body?.password || '');
      if (!password) {
        return res.status(400).json({ success: false, error: { message: 'Password is required' } });
      }
      const user = await User.findById(req.userId).select('+password');
      if (!user || !user.password) {
        return res.status(404).json({ success: false, error: { message: 'User not found' } });
      }
      const ok = await user.comparePassword(password);
      if (!ok) {
        return res.status(401).json({ success: false, error: { message: 'Invalid password' } });
      }
      res.json({ success: true });
      return;
    } catch {
      res.status(500).json({ success: false, error: { message: 'Failed to confirm password' } });
      return;
    }
  }
);

/**
 * GET /api/v1/auth/me
 * Get current user
 */
authRouter.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user && !req.anonymousId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Not authenticated' },
      });
    }

    if (req.user) {
      return res.json({
        success: true,
        data: {
          user: {
            id: req.user._id.toString(),
            email: req.user.email,
            name: req.user.name,
            role: req.user.role,
            roles: req.user.roles,
          },
        },
      });
    }

    // Anonymous user
    res.json({
      success: true,
      data: {
        anonymousId: req.anonymousId,
      },
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get user' },
    });
    return;
  }
});
