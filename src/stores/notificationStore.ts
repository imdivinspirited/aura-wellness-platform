/**
 * Notification Store (Zustand)
 *
 * - Logged out: local-only rows (id prefix `local_`), persisted in localStorage.
 * - Logged in: server is source of truth (`GET /api/v1/notifications`); retention handled server-side.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'cart'
  | 'program'
  | 'registration';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
  replaceFromServer: (notifications: Notification[], unreadCount: number) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
          read: false,
          timestamp: new Date().toISOString(),
        };

        set((state) => {
          const updated = [newNotification, ...state.notifications].slice(0, 80);
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.read).length,
          };
        });
      },

      replaceFromServer: (notifications, unreadCount) => {
        const locals = get().notifications.filter((n) => n.id.startsWith('local_'));
        const merged = [...locals, ...notifications]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 80);
        const unread = merged.filter((n) => !n.read).length;
        set({
          notifications: merged,
          unreadCount: typeof unreadCount === 'number' ? unreadCount : unread,
        });
      },

      markAsRead: (id) => {
        set((state) => {
          const updated = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.read).length,
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      removeNotification: (id) => {
        set((state) => {
          const updated = state.notifications.filter((n) => n.id !== id);
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.read).length,
          };
        });
      },

      clearAll: () => {
        set({
          notifications: [],
          unreadCount: 0,
        });
      },
    }),
    {
      name: 'aolic-bangalore-notifications',
      partialize: (state) => ({ notifications: state.notifications }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.unreadCount = state.notifications.filter((n) => !n.read).length;
        }
      },
    }
  )
);
