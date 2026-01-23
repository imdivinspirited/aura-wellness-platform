/**
 * Notification Bell Component
 *
 * Bell icon with badge showing unread count.
 * Opens notification drawer on click.
 */

import { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotificationStore } from '@/stores/notificationStore';
import { NotificationDrawer } from './NotificationDrawer';
import { useState } from 'react';

export function NotificationBell() {
  const { unreadCount, notifications } = useNotificationStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize with sample notifications if empty (only once)
  useEffect(() => {
    if (!hasInitialized && notifications.length === 0) {
      setHasInitialized(true);
      // Add welcome notification
      try {
        useNotificationStore.getState().addNotification({
          type: 'info',
          title: 'Welcome!',
          message: 'Discover our programs and start your wellness journey.',
        });
      } catch (error) {
        // Silently fail if store not ready
        console.warn('Notification store not ready:', error);
      }
    }
  }, [notifications.length, hasInitialized]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsDrawerOpen(true)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
      <NotificationDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
    </>
  );
}
