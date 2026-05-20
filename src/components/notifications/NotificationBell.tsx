/**
 * Notification Bell — badge count; syncs from GET /api/v1/notifications when logged in.
 */

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/stores/notificationStore';
import { NotificationDrawer } from './NotificationDrawer';
import { getAccessToken } from '@/lib/auth/accessToken';
import { getNotifications } from '@/lib/api/notifications';
import { mapServerNotification } from '@/lib/notifications/mapServerNotification';
import { LuxuryCountBadge } from '@/components/ui/LuxuryCountBadge';
import { headerToolbarIconButtonClass } from '@/components/ui/headerToolbarIcon';
import { ToolbarBellGlyph } from '@/components/icons/ToolbarGlyphSet';

export function NotificationBell() {
  const { unreadCount, replaceFromServer } = useNotificationStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      if (!getAccessToken()) return;
      try {
        const res = await getNotifications();
        if (cancelled || !res?.success || !res.data) return;
        const rows = (res.data.notifications as Record<string, unknown>[]).map(mapServerNotification);
        replaceFromServer(rows, res.data.unreadCount);
      } catch {
        /* offline */
      }
    };
    sync();
    const id = window.setInterval(sync, 90_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [replaceFromServer]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={headerToolbarIconButtonClass}
        onClick={() => setIsDrawerOpen(true)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <ToolbarBellGlyph />
        {unreadCount > 0 && <LuxuryCountBadge count={unreadCount} />}
      </Button>
      <NotificationDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
    </>
  );
}
