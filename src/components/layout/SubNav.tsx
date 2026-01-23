import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useNavigationStore } from '@/stores/navigationStore';
import { getSubNavItems, getChildNavItems, type NavItem } from '@/config/navigation';
import { useTranslation } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const MAX_VISIBLE_ITEMS = 8;

interface SubNavItemProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
  showLabel?: boolean;
}

const SubNavItem = ({ item, isActive, onClick, showLabel = false }: SubNavItemProps) => {
  const [hovered, setHovered] = useState(false);
  const Icon = item.icon;
  const labelVisible = showLabel || hovered;
  const { t } = useTranslation();
  const label = item.labelKey ? t(item.labelKey) : item.label;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'group relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-lg transition-colors duration-200',
        'min-w-[60px] flex-1 max-w-[100px] h-[44px]', // Reduced height
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        isActive
          ? 'text-primary bg-primary/10'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="subNavActiveIndicator"
          className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20"
          initial={false}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}

      {/* Icon with hover effects */}
      {Icon && (
        <Icon
          className={cn(
            'relative z-10 h-5 w-5 transition-all duration-200',
            isActive && 'scale-110',
            hovered && !isActive && 'scale-105' // Subtle scale on hover
          )}
          strokeWidth={isActive ? 2.5 : hovered ? 2.2 : 2}
        />
      )}

      {/* Label Tooltip - Show on hover, positioned above icon */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            key="hover-label"
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[100] pointer-events-none"
          >
            <div
              className={cn(
                'relative whitespace-nowrap px-3 py-1.5 rounded-md shadow-lg',
                'text-xs font-medium',
                'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900',
                'border border-gray-700 dark:border-gray-300',
                isActive && 'font-semibold'
              )}
            >
              {label}
              {/* Arrow pointing down */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                <div className="w-2 h-2 bg-gray-900 dark:bg-gray-100 border-r border-b border-gray-700 dark:border-gray-300 transform rotate-45" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge */}
      {item.badge && (
        <Badge
          className="absolute -top-1 -right-1 h-4 px-1.5 text-[9px] bg-primary text-primary-foreground"
        >
          {item.badge}
        </Badge>
      )}
    </button>
  );
};

// More dropdown for overflow items
const MoreDropdown = ({ items, onItemClick, activeId }: {
  items: NavItem[];
  onItemClick: (id: string) => void;
  activeId: string | null;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center gap-1 h-auto px-4 py-3 text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="h-5 w-5" />
          <span className="text-xs">More</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={cn(
                activeId === item.id && 'bg-primary/10 text-primary'
              )}
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {item.label}
              {item.badge && (
                <Badge className="ml-auto h-4 px-1.5 text-[9px]" variant="secondary">
                  {item.badge}
                </Badge>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Sub-navigation bar (direct children of main nav item)
export const SubNavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeMainNav, activeSubNav, setActiveSubNav } = useNavigationStore();

  const subItems = activeMainNav ? getSubNavItems(activeMainNav) : [];

  if (!activeMainNav || subItems.length === 0) return null;

  const visibleItems = subItems.slice(0, MAX_VISIBLE_ITEMS);
  const overflowItems = subItems.slice(MAX_VISIBLE_ITEMS);

  const handleSubNavClick = (item: NavItem) => {
    setActiveSubNav(item.id);
    if (item.href) {
      navigate(item.href);
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      role="navigation"
      aria-label="Sub navigation"
      className="subnav-bar w-full bg-background/95 backdrop-blur-md border-t border-border/50 shadow-lg"
      style={{
        background: 'hsl(var(--background) / 0.95)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="container">
        <div
          className="flex items-center gap-1 py-1 overflow-x-auto overflow-y-visible scrollbar-hide md:justify-center"
          role="menubar"
        >
          {visibleItems.map((item) => (
            <SubNavItem
              key={item.id}
              item={item}
              isActive={activeSubNav === item.id}
              onClick={() => handleSubNavClick(item)}
            />
          ))}

          {overflowItems.length > 0 && (
            <MoreDropdown
              items={overflowItems}
              onItemClick={(id) => {
                const item = overflowItems.find(i => i.id === id);
                if (item) handleSubNavClick(item);
              }}
              activeId={activeSubNav}
            />
          )}
        </div>
      </div>
    </motion.nav>
  );
};

// Child navigation bar (grandchildren of main nav item)
export const ChildNavBar = () => {
  const { activeMainNav, activeSubNav, activeChildNav, setActiveChildNav } = useNavigationStore();

  const childItems = activeMainNav && activeSubNav
    ? getChildNavItems(activeMainNav, activeSubNav)
    : [];

  if (!activeSubNav || childItems.length === 0) return null;

  const visibleItems = childItems.slice(0, MAX_VISIBLE_ITEMS);
  const overflowItems = childItems.slice(MAX_VISIBLE_ITEMS);

  const handleItemClick = (item: NavItem) => {
    setActiveChildNav(item.id);

    // Handle external URL redirect
    if (item.externalUrl) {
      try {
        // Try to open in iframe context, fallback to new tab
        window.open(item.externalUrl, '_blank', 'noopener,noreferrer');
      } catch {
        window.location.href = item.externalUrl;
      }
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      role="navigation"
      aria-label="Child navigation"
      className="subnav-bar w-full border-t border-border bg-muted"
      style={{
        background: 'hsl(var(--muted))',
        backdropFilter: 'none',
      }}
    >
      <div className="container">
        <div
          className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide md:justify-center"
          role="menubar"
        >
          {visibleItems.map((item) => (
            <Link
              key={item.id}
              to={item.href || '#'}
              onClick={(e) => {
                if (item.externalUrl) {
                  e.preventDefault();
                  handleItemClick(item);
                } else {
                  setActiveChildNav(item.id);
                }
              }}
              className={cn(
                'group relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200',
                'text-sm font-medium',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                activeChildNav === item.id
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              {item.label}
            </Link>
          ))}

          {overflowItems.length > 0 && (
            <MoreDropdown
              items={overflowItems}
              onItemClick={(id) => {
                const item = childItems.find(i => i.id === id);
                if (item) handleItemClick(item);
              }}
              activeId={activeChildNav}
            />
          )}
        </div>
      </div>
    </motion.nav>
  );
};
