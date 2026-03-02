import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { navigationItems, type NavItem } from '@/config/navigation';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useNavigationStore } from '@/stores/navigationStore';
import { useSidebarStore } from '@/stores/sidebarStore';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

/* ---------------- MAIN NAV ITEM ---------------- */

const MainNavItem = ({ item, isCollapsed }: { item: NavItem; isCollapsed: boolean }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeMainNav, setActiveMainNav } = useNavigationStore();
  const { t } = useTranslation();

  const isActive =
    activeMainNav === item.id || (item.href && location.pathname.startsWith(item.href));

  const Icon = item.icon;
  const label = item.labelKey ? t(item.labelKey) : item.label;

  const handleClick = () => {
    if (item.children?.length) {
      setActiveMainNav(item.id);
      if (item.href) navigate(item.href);
    } else {
      setActiveMainNav(null);
    }
  };

  const content = (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition',
        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        isActive && 'bg-primary/10 text-primary',
        isCollapsed && 'justify-center px-2'
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            'h-5 w-5 shrink-0',
            isActive
              ? 'text-primary'
              : 'text-sidebar-foreground/70 group-hover:text-sidebar-foreground'
          )}
        />
      )}

      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {item.badge && (
            <Badge className="ml-auto h-5 bg-primary/10 text-primary text-[10px]">
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </div>
  );

  const wrapped = isCollapsed ? (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  ) : (
    content
  );

  return (
    <Link
      to={item.href || '#'}
      onClick={handleClick}
      className="block rounded-lg focus:outline-none focus-visible:ring-2"
    >
      {wrapped}
    </Link>
  );
};

/* ---------------- DESKTOP SIDEBAR ---------------- */

export const Sidebar = () => {
  const navigate = useNavigate();
  const { isCollapsed, toggleCollapsed } = useSidebarStore();
  const { clearAll } = useNavigationStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border flex flex-col"
    >
      {/* -------- LOGO / BRAND (CLICKABLE) -------- */}
      <div
        onClick={() => {
          clearAll();
          navigate('/');
        }}
        className={cn(
          'flex items-center gap-3 border-b border-sidebar-border px-4 py-4',
          'cursor-pointer hover:bg-sidebar-accent transition',
          isCollapsed && 'justify-center px-2'
        )}
      >
        <img
          src="/images/logos/aolic_logo.png"
          alt="Art of Living Logo"
          className="h-10 w-auto object-contain block dark:hidden"
          style={{ minWidth: 40 }}
        />
        <img
          src="/images/logos/aolic_logo_white.png"
          alt="Art of Living Logo"
          className="h-10 w-auto object-contain hidden dark:block"
          style={{ minWidth: 40 }}
        />

        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="min-w-0"
          >
            <h1 className="text-lg font-semibold truncate">Art of Living</h1>
            <p className="text-xs text-muted-foreground truncate">Bangalore Ashram</p>
          </motion.div>
        )}
      </div>

      {/* -------- NAVIGATION -------- */}
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="space-y-1">
          {navigationItems.map(item => (
            <MainNavItem key={item.id} item={item} isCollapsed={isCollapsed} />
          ))}
        </nav>
      </ScrollArea>

      {/* -------- COLLAPSE BUTTON -------- */}
      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          onClick={toggleCollapsed}
          className={cn('w-full h-11 justify-center', !isCollapsed && 'justify-start')}
        >
          <motion.div animate={{ rotate: isCollapsed ? 0 : 180 }} transition={{ duration: 0.3 }}>
            <ChevronLeft className="h-4 w-4" />
          </motion.div>
          {!isCollapsed && <span className="ml-2">Collapse</span>}
        </Button>
      </div>
    </motion.aside>
  );
};

/* ---------------- MOBILE SIDEBAR ---------------- */

export const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { clearAll } = useNavigationStore();

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="lg:hidden">
        <Menu className="h-5 w-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed left-0 top-0 z-50 h-screen w-72 bg-sidebar border-r"
            >
              {/* MOBILE LOGO */}
              <div
                onClick={() => {
                  clearAll();
                  navigate('/');
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-4 border-b cursor-pointer hover:bg-sidebar-accent"
              >
                <div className="relative h-10 w-auto" style={{ minWidth: 40 }}>
                  <img
                    src="/images/logos/aolic_logo.png"
                    alt="Art of Living Logo"
                    className="h-10 w-auto object-contain block dark:hidden"
                  />
                  <img
                    src="/images/logos/aolic_logo_white.png"
                    alt="Art of Living Logo"
                    className="h-10 w-auto object-contain hidden dark:block"
                  />
                </div>
                <div>
                  <h1 className="font-semibold">Art of Living</h1>
                  <p className="text-xs text-muted-foreground">Bangalore Ashram</p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <ScrollArea className="h-[calc(100vh-80px)] px-3 py-2">
                {navigationItems.map(item => (
                  <MainNavItem key={item.id} item={item} isCollapsed={false} />
                ))}
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
