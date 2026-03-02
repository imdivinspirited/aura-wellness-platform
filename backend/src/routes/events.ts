/**
 * Events Routes
 *
 * Event listing and details endpoints.
 */

import { Router, Response } from 'express';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import { DonationConfig } from '../models/DonationConfig';

export const eventsRouter = Router();

/**
 * GET /api/v1/events
 * Get all events
 */
eventsRouter.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // In production, fetch from database
    res.json({
      success: true,
      data: {
        events: [],
        message: 'Events endpoint - to be implemented with database',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get events' },
    });
  }
});

/**
 * GET /api/v1/events/:slug/donation
 * Public-readable donation configuration for an event.
 */
eventsRouter.get('/:slug/donation', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;
    const config = await DonationConfig.findOne({ eventSlug: slug });

    res.json({
      success: true,
      data: {
        eventSlug: slug,
        config: config
          ? {
              googlePay: config.googlePay,
              phonePe: config.phonePe,
              upiId: config.upiId,
              qrImagePath: config.qrImagePath,
              phoneNumber: config.phoneNumber,
            }
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get donation config' },
    });
  }
});

/**
 * PUT /api/v1/events/:slug/donation
 * Admin/Root editable donation configuration for an event.
 */
eventsRouter.put(
  '/:slug/donation',
  authenticate,
  requireRole(['admin', 'root']),
  [
    body('googlePay').optional().isString(),
    body('phonePe').optional().isString(),
    body('upiId').optional().isString(),
    body('qrImagePath').optional().isString(),
    body('phoneNumber').optional().isString(),
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

      const { slug } = req.params;
      const { googlePay, phonePe, upiId, qrImagePath, phoneNumber } = req.body;

      const updated = await DonationConfig.findOneAndUpdate(
        { eventSlug: slug },
        { eventSlug: slug, googlePay, phonePe, upiId, qrImagePath, phoneNumber },
        { upsert: true, new: true }
      );

      res.json({
        success: true,
        data: {
          eventSlug: slug,
          config: {
            googlePay: updated.googlePay,
            phonePe: updated.phonePe,
            upiId: updated.upiId,
            qrImagePath: updated.qrImagePath,
            phoneNumber: updated.phoneNumber,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update donation config' },
      });
    }
  }
);
