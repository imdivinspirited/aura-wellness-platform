/**
 * Programs Routes
 *
 * Program listing and details endpoints.
 */

import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Program } from '../models/Program';

export const programsRouter = Router();

/**
 * GET /api/v1/programs
 * Get all programs
 */
programsRouter.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const programs = await Program.find({}).sort({ createdAt: -1 }).lean();
    res.json({
      success: true,
      data: {
        programs,
      },
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get programs' },
    });
    return;
  }
});
