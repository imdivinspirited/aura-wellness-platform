/**
 * User Profile (Full) Routes
 *
 * Combines core User fields with extended UserProfile details.
 * Enables form auto-fill and dashboard resume/certificate generation.
 */

import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest, requireUser } from '../middleware/auth';
import { User } from '../models/User';
import { UserProfile } from '../models/UserProfile';

export const usersProfileRouter = Router();

function validate(req: AuthRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, error: { message: 'Validation failed', errors: errors.array() } });
    return false;
  }
  return true;
}

/**
 * GET /api/v1/users/profile/full
 */
usersProfileRouter.get('/profile/full', authenticate, requireUser, async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId).select('-password').lean();
  if (!user) {
    res.status(404).json({ success: false, error: { message: 'User not found' } });
    return;
  }
  const details = await UserProfile.findOne({ userId: user._id }).lean();
  res.json({ success: true, data: { user, details } });
  return;
});

/**
 * PUT /api/v1/users/profile/full
 */
usersProfileRouter.put(
  '/profile/full',
  authenticate,
  requireUser,
  [
    body('name').optional().isString().trim().notEmpty(),
    body('phone').optional().isString().trim(),
    body('details').optional().isObject(),
    body('details.whatsapp').optional().isString().trim(),
    body('details.age').optional().isInt({ min: 0, max: 120 }),
    body('details.gender').optional().isString().trim(),
    body('details.city').optional().isString().trim(),
    body('details.state').optional().isString().trim(),
    body('details.country').optional().isString().trim(),
    body('details.education').optional().isString().trim(),
    body('details.skills').optional().isString().trim(),
    body('details.availableFrom').optional().isISO8601(),
    body('details.duration').optional().isString().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    if (!validate(req, res)) return;

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ success: false, error: { message: 'User not found' } });
      return;
    }

    const { name, phone, details } = req.body as {
      name?: string;
      phone?: string;
      details?: any;
    };

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    await user.save();

    let updatedDetails = await UserProfile.findOne({ userId: user._id });
    if (!updatedDetails) {
      updatedDetails = new UserProfile({ userId: user._id });
    }

    if (details && typeof details === 'object') {
      if (details.whatsapp !== undefined) updatedDetails.whatsapp = details.whatsapp;
      if (details.age !== undefined) updatedDetails.age = details.age;
      if (details.gender !== undefined) updatedDetails.gender = details.gender;
      if (details.city !== undefined) updatedDetails.city = details.city;
      if (details.state !== undefined) updatedDetails.state = details.state;
      if (details.country !== undefined) updatedDetails.country = details.country;
      if (details.education !== undefined) updatedDetails.education = details.education;
      if (details.skills !== undefined) updatedDetails.skills = details.skills;
      if (details.availableFrom !== undefined) updatedDetails.availableFrom = new Date(details.availableFrom);
      if (details.duration !== undefined) updatedDetails.duration = details.duration;
    }

    await updatedDetails.save();

    res.json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          roles: user.roles,
        },
        details: updatedDetails.toObject(),
      },
    });
    return;
  }
);

