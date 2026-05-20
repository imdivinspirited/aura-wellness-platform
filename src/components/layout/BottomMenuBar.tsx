/**
 * Bottom bar — main sections only (home via header/branding; profile via header avatar).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, BookOpen, Briefcase, Heart, Globe, Calendar, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { translateNavLabel } from '@/lib/navI18n';

const menuItems = [
  { icon: BookOpen, labelKey: 'nav.programs', label: 'Programs', path: '/programs' },
  { icon: Heart, labelKey: 'nav.services', label: 'Services', path: '/services' },
  { icon: Globe, labelKey: 'nav.international', label: 'International', path: '/international' },
  { icon: Calendar, labelKey: 'nav.events', label: 'Events', path: '/events' },
  { icon: Compass, labelKey: 'nav.explore', label: 'Explore', path: '/explore' },
  { icon: Users, labelKey: 'nav.connect', label: 'Connect', path: '/connect' },
  { icon: Briefcase, labelKey: 'nav.sevaCareers', label: 'Seva', path: '/seva-careers' },
];

function isActivePath(path: string, currentPath: string): boolean {
  if (path === '/') return currentPath === '/';
  return currentPath === path || currentPath.startsWith(path + '/');
}

export const BottomMenuBar = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const [isHovering, setIsHovering] = useState(false);
  const [isDockVisible, setIsDockVisible] = useState(true);
  const lastYRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const showDock = () => setIsDockVisible(true);
  const hideDock = () => setIsDockVisible(false);

  const shouldForceShow = useMemo(() => isHovering, [isHovering]);

  useEffect(() => {
    lastYRef.current = typeof window !== 'undefined' ? window.scrollY : 0;
    setIsDockVisible(true);

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        const y = window.scrollY || 0;
        const last = lastYRef.current;
        const delta = y - last;
        lastYRef.current = y;

        // Always show near the top.
        if (y < 16) {
          showDock();
          return;
        }

        // If user is interacting with the dock, don't hide.
        if (shouldForceShow) {
          showDock();
          return;
        }

        // Small scroll noise ignored.
        if (Math.abs(delta) < 6) return;

        // Scroll down => hide. Scroll up => show.
        if (delta > 0) hideDock();
        else showDock();
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll as any);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [shouldForceShow]);

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-[1000]"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onFocusCapture={() => setIsHovering(true)}
      onBlurCapture={() => setIsHovering(false)}
      onTouchStart={() => setIsDockVisible(true)}
    >
      {/* Premium floating dock (mobile) */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/70 via-background/20 to-transparent backdrop-blur-[1px] dark:from-background/55"
        aria-hidden
        animate={{ opacity: isDockVisible ? 1 : 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      />

      <motion.div
        className="relative w-full px-2 pb-1.5 pt-1"
        animate={{ y: isDockVisible ? 0 : 88, opacity: isDockVisible ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 520, damping: 40 }}
        style={{ pointerEvents: isDockVisible ? 'auto' : 'none' }}
      >
        <div
          className={cn(
            'pointer-events-auto relative flex h-[54px] items-center justify-between gap-0.5 overflow-hidden rounded-[22px] sm:gap-1',
            'border border-border/60 bg-background/90 shadow-[0_10px_26px_-18px_rgba(0,0,0,0.22)] backdrop-blur-md',
            'dark:border-white/10 dark:bg-background/78 dark:shadow-[0_12px_28px_-18px_rgba(0,0,0,0.45)]',
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            aria-hidden
            style={{
              background:
                'radial-gradient(600px 120px at 50% 0%, hsl(var(--primary)/0.16), transparent 55%), radial-gradient(520px 140px at 10% 120%, hsl(var(--secondary)/0.12), transparent 60%), radial-gradient(520px 140px at 90% 120%, hsl(var(--accent)/0.12), transparent 60%)',
            }}
          />

        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(item.path, location.pathname);
          const label = translateNavLabel(item, (k) => t(k as any));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-0.5 py-1 sm:px-1',
                'transition-all duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
              aria-current={active ? 'page' : undefined}
              aria-label={label}
            >
              {active ? (
                <motion.div
                  layoutId="bottomNavActivePill"
                  className="absolute inset-x-2 inset-y-1 rounded-2xl bg-primary/12 ring-1 ring-primary/20"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 520, damping: 34 }}
                  aria-hidden
                />
              ) : null}

              {active ? (
                <motion.div
                  layoutId="bottomNavActiveDot"
                  className="absolute -bottom-1 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-primary/80 to-transparent"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 520, damping: 34 }}
                  aria-hidden
                />
              ) : null}

              <Icon
                size={20}
                className={cn(
                  'relative z-10 shrink-0 transition-transform duration-200',
                  active ? 'scale-[1.03] text-primary' : 'text-muted-foreground',
                )}
                strokeWidth={active ? 2.25 : 1.75}
                aria-hidden
              />
              <span
                className={cn(
                  'relative z-10 max-w-full truncate px-0.5 text-center text-[8px] font-medium leading-tight tracking-tight sm:px-1 sm:text-[9px]',
                  active ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
        </div>
      </motion.div>
    </nav>
  );
};
