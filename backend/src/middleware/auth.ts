/**
 * Authentication Middleware
 *
 * JWT token verification and user authentication.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  /**
   * `passport` also declares `req.user` globally as `Express.User`.
   * Keep this typed as `any` here to avoid type conflicts while still
   * providing a single place for our auth fields.
   */
  user?: any;
  userId?: string;
  anonymousId?: string;
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('CRITICAL: JWT_SECRET environment variable must be set');
}

/**
 * Verify JWT token and attach user to request
 */
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from header or cookie
    const token =
      req.headers.authorization?.replace('Bearer ', '') ||
      req.cookies?.accessToken;

    if (!token) {
      // Check for anonymous ID
      const anonymousId = req.headers['x-anonymous-id'] as string || req.cookies?.anonymousId;
      if (anonymousId) {
        req.anonymousId = anonymousId;
      }
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET as string) as unknown as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: 'User not found' },
      });
      return;
    }

    if (user.status && user.status !== 'active') {
      res.status(401).json({
        success: false,
        error: { message: 'Account is not active' },
      });
      return;
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    // Token invalid, but allow anonymous access
    const anonymousId = req.headers['x-anonymous-id'] as string || req.cookies?.anonymousId;
    if (anonymousId) {
      req.anonymousId = anonymousId;
    }
    next();
  }
}

/**
 * Require authentication (must have valid token)
 */
export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user && !req.anonymousId) {
    res.status(401).json({
      success: false,
      error: { message: 'Authentication required' },
    });
    return;
  }
  next();
}

/**
 * Require logged-in user (not anonymous)
 */
export function requireUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: { message: 'User authentication required' },
    });
    return;
  }
  next();
}

/**
 * Require a logged-in user with one of the allowed roles.
 */
export function requireRole(allowed: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { message: 'User authentication required' },
      });
      return;
    }
    const userRoles = Array.isArray(req.user.roles) && req.user.roles.length > 0
      ? req.user.roles
      : [req.user.role];

    const ok = allowed.some((r) => userRoles.includes(r));
    if (!ok) {
      res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions' },
      });
      return;
    }
    next();
  };
}
