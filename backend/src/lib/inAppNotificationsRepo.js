/**
 * In-app notifications — native MongoDB (aligned with users.id UUID).
 * Retention: read → purge 24h after read_at; unread → purge 3 days after created_at.
 */
import { randomUUID } from 'crypto';

export const IN_APP_NOTIFICATIONS = 'in_app_notifications';

const READ_TTL_MS = 24 * 60 * 60 * 1000;
const UNREAD_TTL_MS = 3 * 24 * 60 * 60 * 1000;

export async function ensureInAppNotificationIndexes(db) {
  const c = db.collection(IN_APP_NOTIFICATIONS);
  await c.createIndexes([
    { key: { user_id: 1, created_at: -1 } },
    { key: { user_id: 1, dedupe_key: 1 }, unique: true },
    { key: { read: 1, read_at: 1 } },
    { key: { read: 1, created_at: 1 } },
  ]);
}

/**
 * Delete expired notifications for all users.
 */
export async function purgeExpiredNotifications(db) {
  const now = Date.now();
  const readCutoff = new Date(now - READ_TTL_MS);
  const unreadCutoff = new Date(now - UNREAD_TTL_MS);
  const c = db.collection(IN_APP_NOTIFICATIONS);
  const r = await c.deleteMany({
    $or: [
      { read: true, read_at: { $lt: readCutoff } },
      { read: false, created_at: { $lt: unreadCutoff } },
    ],
  });
  return r.deletedCount ?? 0;
}

function mapDoc(row) {
  if (!row) return null;
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    read: row.read,
    timestamp: (row.created_at instanceof Date ? row.created_at : new Date(row.created_at)).toISOString(),
    actionUrl: row.action_url || undefined,
    actionLabel: row.action_label || undefined,
    readAt: row.read_at ? (row.read_at instanceof Date ? row.read_at : new Date(row.read_at)).toISOString() : undefined,
  };
}

export async function listNotificationsForUser(db, userId, limit = 80) {
  const rows = await db
    .collection(IN_APP_NOTIFICATIONS)
    .find({ user_id: userId })
    .sort({ created_at: -1 })
    .limit(limit)
    .toArray();
  return rows.map(mapDoc);
}

/**
 * Upsert one notification per user (dedupe_key unique per user).
 */
export async function upsertNotificationForUser(db, userId, payload) {
  const now = new Date();
  const newId = randomUUID();
  const c = db.collection(IN_APP_NOTIFICATIONS);
  await c.updateOne(
    { user_id: userId, dedupe_key: payload.dedupe_key },
    {
      $set: {
        type: payload.type,
        title: payload.title,
        message: payload.message,
        action_url: payload.action_url ?? null,
        action_label: payload.action_label ?? null,
        updated_at: now,
      },
      $setOnInsert: {
        id: newId,
        user_id: userId,
        dedupe_key: payload.dedupe_key,
        read: false,
        read_at: null,
        created_at: now,
      },
    },
    { upsert: true }
  );
  const row = await c.findOne({ user_id: userId, dedupe_key: payload.dedupe_key });
  return row?.id ?? newId;
}

export async function markNotificationRead(db, userId, notificationId) {
  const c = db.collection(IN_APP_NOTIFICATIONS);
  const readAt = new Date();
  const doc = await c.findOne({ id: notificationId, user_id: userId });
  if (!doc) return null;
  await c.updateOne(
    { id: notificationId, user_id: userId },
    { $set: { read: true, read_at: readAt, updated_at: readAt } }
  );
  return mapDoc(await c.findOne({ id: notificationId, user_id: userId }));
}

export async function markAllNotificationsRead(db, userId) {
  const readAt = new Date();
  await db.collection(IN_APP_NOTIFICATIONS).updateMany(
    { user_id: userId, read: false },
    { $set: { read: true, read_at: readAt, updated_at: readAt } }
  );
}

export async function deleteNotification(db, userId, notificationId) {
  const r = await db.collection(IN_APP_NOTIFICATIONS).deleteOne({ id: notificationId, user_id: userId });
  return r.deletedCount > 0;
}

export async function countUnread(db, userId) {
  return db.collection(IN_APP_NOTIFICATIONS).countDocuments({ user_id: userId, read: false });
}
