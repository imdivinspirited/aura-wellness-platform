import type { Notification } from '@/stores/notificationStore';

export function mapServerNotification(raw: Record<string, unknown>): Notification {
  return {
    id: String(raw.id ?? ''),
    type: (raw.type as Notification['type']) || 'info',
    title: String(raw.title ?? ''),
    message: String(raw.message ?? ''),
    read: Boolean(raw.read),
    timestamp: String(raw.timestamp ?? new Date().toISOString()),
    actionUrl: raw.actionUrl != null ? String(raw.actionUrl) : undefined,
    actionLabel: raw.actionLabel != null ? String(raw.actionLabel) : undefined,
  };
}
