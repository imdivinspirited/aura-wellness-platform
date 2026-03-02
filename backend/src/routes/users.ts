/**
 * User Routes
 *
 * User profile and management endpoints.
 */

import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { authenticate, AuthRequest, requireUser } from '../middleware/auth';

export const usersRouter = Router();

/**
 * GET /api/v1/users/profile
 * Get user profile
 */
usersRouter.get('/profile', authenticate, requireUser, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get profile' },
    });
  }
});

/**
 * PUT /api/v1/users/profile
 * Update user profile
 */
usersRouter.put(
  '/profile',
  authenticate,
  requireUser,
  [
    body('name').optional().trim().notEmpty(),
    body('phone').optional().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { message: 'Validation failed', errors: errors.array() },
        });
      }

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' },
        });
      }

      const { name, phone } = req.body;
      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;

      await user.save();

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update profile' },
      });
    }
  }
);

/**
 * PUT /api/v1/users/password
 * Change password
 */
usersRouter.put(
  '/password',
  authenticate,
  requireUser,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { message: 'Validation failed', errors: errors.array() },
        });
      }

      const user = await User.findById(req.userId).select('+password');
      if (!user || !user.password) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' },
        });
      }

      const { currentPassword, newPassword } = req.body;

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: { message: 'Current password is incorrect' },
        });
      }

      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update password' },
      });
    }
  }
);
