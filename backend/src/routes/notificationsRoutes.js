/**
 * GET/PUT/DELETE /api/v1/notifications — per-user in-app notifications (Mongo).
 */
import { Router } from 'express';
import { authenticate, requireAuth } from '../middleware/authenticate.js';
import { getDb } from '../db.js';
import {
  listNotificationsForUser,
  countUnread,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../lib/inAppNotificationsRepo.js';

const router = Router();

router.get('/', authenticate, requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Authentication required.' } });
    }
    const db = getDb();
    const notifications = await listNotificationsForUser(db, userId, 80);
    const unreadCount = await countUnread(db, userId);
    return res.json({
      success: true,
      data: { notifications, unreadCount },
    });
  } catch (e) {
    const code = e?.code === 'MONGO_UNAVAILABLE' ? 503 : 500;
    return res.status(code).json({
      success: false,
      error: { message: e?.message || 'Failed to load notifications' },
    });
  }
});

router.put('/read-all', authenticate, requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Authentication required.' } });
    }
    const db = getDb();
    await markAllNotificationsRead(db, userId);
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: { message: e?.message || 'Failed to update notifications' },
    });
  }
});

router.put('/:id/read', authenticate, requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Authentication required.' } });
    }
    const db = getDb();
    const n = await markNotificationRead(db, userId, req.params.id);
    if (!n) {
      return res.status(404).json({ success: false, error: { message: 'Notification not found' } });
    }
    return res.json({ success: true, data: { notification: n } });
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: { message: e?.message || 'Failed to update notification' },
    });
  }
});

router.delete('/:id', authenticate, requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Authentication required.' } });
    }
    const db = getDb();
    const ok = await deleteNotification(db, userId, req.params.id);
    if (!ok) {
      return res.status(404).json({ success: false, error: { message: 'Notification not found' } });
    }
    return res.json({ success: true, message: 'Notification deleted' });
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: { message: e?.message || 'Failed to delete notification' },
    });
  }
});

export default router;
