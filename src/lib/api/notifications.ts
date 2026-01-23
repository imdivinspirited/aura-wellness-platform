/**
 * Notifications API
 *
 * API functions for notifications.
 */

import { apiClient } from './client';
import type { Notification, NotificationType } from '@/stores/notificationStore';

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    unreadCount: number;
  };
}

/**
 * Get user's notifications
 */
export async function getNotifications(): Promise<NotificationsResponse> {
  return apiClient.get<NotificationsResponse>('/notifications');
}

/**
 * Create notification
 */
export async function createNotification(data: {
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
}): Promise<{ success: boolean; data: { notification: Notification } }> {
  return apiClient.post('/notifications', data);
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(id: string): Promise<{ success: boolean; data: { notification: Notification } }> {
  return apiClient.put(`/notifications/${id}/read`, {});
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(): Promise<{ success: boolean; message: string }> {
  return apiClient.put('/notifications/read-all', {});
}

/**
 * Delete notification
 */
export async function deleteNotification(id: string): Promise<{ success: boolean; message: string }> {
  return apiClient.delete(`/notifications/${id}`);
}
