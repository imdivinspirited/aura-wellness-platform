import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Settings, User, UserRound } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getMyProfile } from '@/lib/api/profile';
import { avatarUrlWithCacheBuster } from '@/lib/profile/avatarDisplayUrl';
import { useAuthStore } from '@/stores/authStore';
import { useRootStore } from '@/stores/rootStore';

const triggerClass = cn(
  'group relative flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-full sm:h-10 sm:w-10',
  'border-0 bg-transparent p-0 shadow-none outline-none',
  'hover:!bg-transparent active:!bg-transparent focus-visible:!bg-transparent data-[state=open]:!bg-transparent',
  'focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
);

const innerSize = 'h-[2.125rem] w-[2.125rem] sm:h-[2.375rem] sm:w-[2.375rem]';

const springTransition = { type: 'spring' as const, stiffness: 420, damping: 28, mass: 0.85 };

export function HeaderProfileTrigger() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isLoading: authLoading } = useAuthStore();
  const deactivateRootMode = useRootStore((s) => s.deactivateRootMode);

  const profileQ = useQuery({
    queryKey: ['me', 'profile-full'],
    queryFn: () => getMyProfile() as Promise<{
      success?: boolean;
      data?: { user?: { name?: string; email?: string }; details?: { avatarUrl?: string; avatarUpdatedAt?: string } };
    }>,
    enabled: isAuthenticated && !authLoading,
    staleTime: 60_000,
  });

  const details = profileQ.data?.data?.details;
  const avatarSrc = useMemo(
    () => avatarUrlWithCacheBuster(details?.avatarUrl, details?.avatarUpdatedAt),
    [details?.avatarUrl, details?.avatarUpdatedAt],
  );

  const displayName = user?.name?.trim() || '';
  const initial = (displayName || user?.email || '?').charAt(0).toUpperCase();
  const hasPhoto = Boolean(avatarSrc);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          type="button"
          aria-label="Open profile menu"
          aria-haspopup="menu"
          className={triggerClass}
          whileHover={{ scale: 1.045 }}
          whileTap={{ scale: 0.96 }}
          transition={springTransition}
        >
          <span className="relative flex h-full w-full items-center justify-center">
            <AnimatePresence mode="wait" initial={false}>
              {!isAuthenticated ? (
                <motion.span
                  key="guest"
                  className="flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Guest: gradient ring + silhouette — not a generic “U” */}
                  <span
                    className={cn(
                      'relative flex items-center justify-center rounded-full bg-gradient-to-br from-primary/45 via-primary/15 to-secondary/35 p-[2.5px] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
                      innerSize,
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-full w-full items-center justify-center rounded-full border border-border/50 bg-background/95 backdrop-blur-[2px]',
                        'transition-[box-shadow] duration-300 ease-out',
                        'group-hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.14)]',
                      )}
                    >
                      <UserRound
                        className="h-[15px] w-[15px] text-muted-foreground/85 sm:h-[17px] sm:w-[17px]"
                        strokeWidth={1.65}
                        aria-hidden
                      />
                    </span>
                  </span>
                </motion.span>
              ) : (
                <motion.span
                  key="signed-in"
                  className="flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span
                    className={cn(
                      'relative rounded-full p-[2px] shadow-[0_0_0_1px_hsl(var(--primary)/0.18)]',
                      'bg-gradient-to-br from-primary/35 via-transparent to-secondary/30',
                      innerSize,
                    )}
                  >
                    <Avatar className="h-full w-full border border-border/40 shadow-sm">
                      {hasPhoto ? (
                        <AvatarImage
                          src={avatarSrc}
                          alt={displayName || 'Profile'}
                          className="object-cover transition-[filter] duration-300 ease-out motion-safe:group-hover:brightness-[1.04]"
                        />
                      ) : null}
                      <AvatarFallback
                        className={cn(
                          'bg-gradient-to-br from-primary via-primary/92 to-secondary text-[0.8125rem] font-semibold tracking-tight text-primary-foreground',
                          'font-serif sm:text-[0.9375rem]',
                        )}
                      >
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                  </span>
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </motion.button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[min(calc(100vw-1.5rem),20rem)] sm:w-56 overflow-hidden rounded-xl border-border/80 p-0 shadow-lg"
        align="end"
        sideOffset={8}
        forceMount
      >
        {isAuthenticated && (
          <>
            <DropdownMenuLabel className="border-b border-border/60 bg-muted/40 px-3 py-3 font-normal">
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="truncate text-sm font-semibold leading-tight">{user?.name || 'User'}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <div className="space-y-0.5 p-1.5">
              <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                <Link to="/profile">
                  <User className="mr-2 h-4 w-4 shrink-0" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                <Link to="/settings">
                  <Settings className="mr-2 h-4 w-4 shrink-0" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                className="cursor-pointer rounded-lg text-destructive focus:text-destructive"
                onClick={async () => {
                  deactivateRootMode();
                  await logout();
                }}
              >
                <LogOut className="mr-2 h-4 w-4 shrink-0" />
                Logout
              </DropdownMenuItem>
            </div>
          </>
        )}
        {!isAuthenticated && (
          <div className="space-y-0.5 p-1.5">
            <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer rounded-lg">
              <User className="mr-2 h-4 w-4 shrink-0" />
              Dashboard / Sign In
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer rounded-lg">
              <Settings className="mr-2 h-4 w-4 shrink-0" />
              Settings
            </DropdownMenuItem>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
