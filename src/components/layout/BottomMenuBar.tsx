/**
 * Bottom Menu Bar — Fixed 5-item navigation (Home, Explore, Programs, Seva, Profile)
 * Visible on all screen sizes. Safe area padding for iOS.
 */

import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, BookOpen, Briefcase, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const menuItems = [
  { icon: Home, labelKey: 'nav.home', label: 'Home', path: '/' },
  { icon: Compass, labelKey: 'nav.explore', label: 'Explore', path: '/explore' },
  { icon: BookOpen, labelKey: 'nav.programs', label: 'Programs', path: '/programs' },
  { icon: Briefcase, labelKey: 'nav.sevaCareers', label: 'Seva', path: '/seva-careers' },
  { icon: User, labelKey: 'nav.profile', label: 'Profile', path: '/profile' },
];

function isActivePath(path: string, currentPath: string): boolean {
  if (path === '/') return currentPath === '/';
  return currentPath === path || currentPath.startsWith(path + '/');
}

export const BottomMenuBar = () => {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-[1000] h-16 border-t border-border bg-white dark:bg-background/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex h-full items-center justify-around px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(item.path, location.pathname);
          const label = item.labelKey ? t(item.labelKey) : item.label;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 min-w-[56px] flex-1 max-w-[80px] h-14 rounded-lg transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                active
                  ? 'text-primary'
                  : 'text-[#9CA3AF] hover:text-foreground'
              )}
              aria-current={active ? 'page' : undefined}
              aria-label={label}
            >
              {active && (
                <motion.div
                  layoutId="bottomNavActiveIndicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full bg-primary"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                size={24}
                className={cn(
                  'relative z-10 transition-all shrink-0',
                  active ? 'text-primary stroke-[2.5]' : 'text-[#9CA3AF] stroke-[1.5]'
                )}
                strokeWidth={active ? 2.5 : 1.5}
                aria-hidden
              />
              <span
                className={cn(
                  'relative z-10 text-[10px] font-medium leading-tight',
                  active ? 'text-primary' : 'text-[#9CA3AF]'
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
