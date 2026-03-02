/**
 * Notification Routes
 *
 * Notification management endpoints.
 */

import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Notification } from '../models/Notification';
import { authenticate, AuthRequest, requireAuth } from '../middleware/auth';

export const notificationsRouter = Router();

/**
 * GET /api/v1/notifications
 * Get user's notifications
 */
notificationsRouter.get('/', authenticate, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const identifier = req.userId || req.anonymousId;
    if (!identifier) {
      return res.status(401).json({
        success: false,
        error: { message: 'Not authenticated' },
      });
    }

    const notifications = await Notification.find(
      req.userId ? { userId: req.userId } : { anonymousId: req.anonymousId }
    )
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter((n) => !n.read).length;

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get notifications' },
    });
  }
});

/**
 * POST /api/v1/notifications
 * Create notification
 */
notificationsRouter.post(
  '/',
  authenticate,
  requireAuth,
  [
    body('type').isIn(['info', 'success', 'warning', 'error', 'cart', 'program', 'registration']),
    body('title').notEmpty(),
    body('message').notEmpty(),
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

      const identifier = req.userId || req.anonymousId;
      if (!identifier) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
      }

      const { type, title, message, actionUrl, actionLabel } = req.body;

      const notification = new Notification({
        userId: req.userId,
        anonymousId: req.anonymousId,
        type,
        title,
        message,
        actionUrl,
        actionLabel,
      });

      await notification.save();

      res.status(201).json({
        success: true,
        data: { notification },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to create notification' },
      });
    }
  }
);

/**
 * PUT /api/v1/notifications/:id/read
 * Mark notification as read
 */
notificationsRouter.put(
  '/:id/read',
  authenticate,
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const identifier = req.userId || req.anonymousId;
      if (!identifier) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
      }

      const notification = await Notification.findOne({
        _id: req.params.id,
        ...(req.userId ? { userId: req.userId } : { anonymousId: req.anonymousId }),
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: { message: 'Notification not found' },
        });
      }

      notification.read = true;
      await notification.save();

      res.json({
        success: true,
        data: { notification },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update notification' },
      });
    }
  }
);

/**
 * PUT /api/v1/notifications/read-all
 * Mark all notifications as read
 */
notificationsRouter.put('/read-all', authenticate, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const identifier = req.userId || req.anonymousId;
    if (!identifier) {
      return res.status(401).json({
        success: false,
        error: { message: 'Not authenticated' },
      });
    }

    await Notification.updateMany(
      {
        ...(req.userId ? { userId: req.userId } : { anonymousId: req.anonymousId }),
        read: false,
      },
      { read: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update notifications' },
    });
  }
});

/**
 * DELETE /api/v1/notifications/:id
 * Delete notification
 */
notificationsRouter.delete(
  '/:id',
  authenticate,
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const identifier = req.userId || req.anonymousId;
      if (!identifier) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
      }

      const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        ...(req.userId ? { userId: req.userId } : { anonymousId: req.anonymousId }),
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: { message: 'Notification not found' },
        });
      }

      res.json({
        success: true,
        message: 'Notification deleted',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to delete notification' },
      });
    }
  }
);
