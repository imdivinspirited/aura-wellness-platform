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
import { v4 as uuidv4 } from 'uuid';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Generate tokens
function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
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
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Registration failed' },
      });
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
    body('email').isEmail().normalizeEmail(),
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

      const { email, password } = req.body;

      // Find user with password
      const user = await User.findOne({ email }).select('+password');
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
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Login failed' },
      });
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
    const newAnonymousId = `anon_${generateUUID()}_${Date.now()}`;
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create anonymous user' },
    });
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

      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid refresh token' },
        });
      }

      const { accessToken } = generateTokens(user._id.toString());

      res.json({
        success: true,
        data: { accessToken },
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid refresh token' },
      });
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get user' },
    });
  }
});
