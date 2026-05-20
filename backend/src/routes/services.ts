/**
 * Services Routes
 *
 * Service listing and details endpoints.
 */

import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Service } from '../models/Service';

export const servicesRouter = Router();

/**
 * GET /api/v1/services
 * Get all services
 */
servicesRouter.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const services = await Service.find({}).sort({ createdAt: -1 }).lean();
    res.json({
      success: true,
      data: {
        services,
      },
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get services' },
    });
    return;
  }
});
