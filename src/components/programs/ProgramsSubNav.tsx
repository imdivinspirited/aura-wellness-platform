import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Zap,
  Baby,
  GraduationCap,
  LayoutGrid,
  RotateCcw,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

const navItems: NavItem[] = [
  { id: 'beginning', label: 'Beginning', icon: Sparkles, href: '/programs/beginning' },
  { id: 'advanced', label: 'Advanced', icon: Zap, href: '/programs/advanced' },
  { id: 'children', label: 'Children', icon: Baby, href: '/programs/children' },
  { id: 'teens', label: 'Teens', icon: GraduationCap, href: '/programs/teens' },
  { id: 'more', label: 'More Programs', icon: LayoutGrid, href: '/programs/more' },
  { id: 'retreats', label: 'Retreats', icon: RotateCcw, href: '/programs/retreats' },
];

interface ProgramsSubNavProps {
  activeItem?: string;
  onItemClick?: (id: string) => void;
}

export const ProgramsSubNav = ({ activeItem, onItemClick }: ProgramsSubNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active item from URL
  const getActiveFromPath = () => {
    const path = location.pathname;
    if (path.includes('/beginning')) return 'beginning';
    if (path.includes('/advance')) return 'advanced';
    if (path.includes('/children-teens')) return 'children';
    if (path.includes('/more')) return 'more';
    if (path.includes('/retreats')) return 'retreats';
    return 'beginning';
  };

  const [active, setActive] = useState(activeItem || getActiveFromPath());

  useEffect(() => {
    setActive(getActiveFromPath());
  }, [location.pathname]);

  const handleClick = (id: string, href: string) => {
    setActive(id);
    if (onItemClick) {
      onItemClick(id);
    } else {
      navigate(href);
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Program categories"
      className="w-full bg-card/80 backdrop-blur-sm border-t border-border/50 shadow-soft"
    >
      <div className="container">
        <ul
          className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide md:justify-center md:gap-4 lg:gap-6"
          role="menubar"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;

            return (
              <li key={item.id} role="none" className="flex-shrink-0">
                <button
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => handleClick(item.id, item.href)}
                  className={cn(
                    'relative flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all duration-200',
                    'min-w-[80px] md:min-w-[90px]',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}

                  {/* Icon */}
                  <Icon
                    className={cn(
                      'relative z-10 h-5 w-5 transition-transform duration-200',
                      isActive && 'scale-110'
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />

                  {/* Label */}
                  <span
                    className={cn(
                      'relative z-10 text-xs font-medium whitespace-nowrap transition-colors',
                      isActive && 'font-semibold'
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
