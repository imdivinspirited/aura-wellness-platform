/**
 * Programs Routes
 *
 * Program listing and details endpoints.
 */

import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

export const programsRouter = Router();

/**
 * GET /api/v1/programs
 * Get all programs
 */
programsRouter.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // In production, fetch from database
    // For now, return sample data
    res.json({
      success: true,
      data: {
        programs: [],
        message: 'Programs endpoint - to be implemented with database',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get programs' },
    });
  }
});
