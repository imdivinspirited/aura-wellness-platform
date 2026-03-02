/**
 * Services Routes
 *
 * Service listing and details endpoints.
 */

import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

export const servicesRouter = Router();

/**
 * GET /api/v1/services
 * Get all services
 */
servicesRouter.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // In production, fetch from database
    res.json({
      success: true,
      data: {
        services: [],
        message: 'Services endpoint - to be implemented with database',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get services' },
    });
  }
});
