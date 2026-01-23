/**
 * Notification Drawer Component
 *
 * Side drawer showing all notifications with read/unread states.
 */

import { X, Check, CheckCheck, Trash2, ExternalLink, Bell } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNotificationStore, type Notification } from '@/stores/notificationStore';
import { useNavigate } from 'react-router-dom';

interface NotificationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return '✓';
    case 'warning':
      return '⚠';
    case 'error':
      return '✕';
    case 'cart':
      return '🛒';
    case 'program':
      return '📚';
    case 'registration':
      return '📝';
    default:
      return 'ℹ';
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'warning':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'error':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'cart':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'program':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    case 'registration':
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }
};

export function NotificationDrawer({ open, onOpenChange }: NotificationDrawerProps) {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } =
    useNotificationStore();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      if (notification.actionUrl.startsWith('http')) {
        window.open(notification.actionUrl, '_blank', 'noopener,noreferrer');
      } else {
        navigate(notification.actionUrl);
        onOpenChange(false);
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Notifications</SheetTitle>
              <SheetDescription>
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </SheetDescription>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-2">No notifications</p>
              <p className="text-sm text-muted-foreground">
                You're all caught up! We'll notify you of important updates.
              </p>
            </div>
          ) : (
            <>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-all
                    ${notification.read ? 'bg-muted/30' : 'bg-background border-primary/20'}
                    hover:shadow-md
                  `}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`
                        h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0
                        ${getNotificationColor(notification.type)}
                      `}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4
                          className={`text-sm font-medium ${
                            notification.read ? 'text-muted-foreground' : 'text-foreground'
                          }`}
                        >
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleDateString()}
                        </span>
                        {notification.actionUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(notification);
                            }}
                          >
                            {notification.actionLabel || 'View'}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Separator className="my-4" />

              <Button
                variant="outline"
                className="w-full"
                onClick={clearAll}
              >
                Clear All Notifications
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
