import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { navigationItems, type NavItem } from '@/config/navigation';
import { useTranslation } from '@/lib/i18n';
import { translateNavLabel } from '@/lib/navI18n';
import { cn } from '@/lib/utils';
import { useNavigationStore } from '@/stores/navigationStore';
import { useSidebarStore } from '@/stores/sidebarStore';
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLogoHomeNavigation } from '@/hooks/useLogoHomeNavigation';
import { AolicLogo } from '@/components/branding/AolicLogo';

const SPRING_SNAPPY = { type: 'spring' as const, stiffness: 460, damping: 34, mass: 0.78 };
const SPRING_SOFT = { type: 'spring' as const, stiffness: 380, damping: 32, mass: 0.85 };
const STAGGER_MS = 0.042;
const ASIDE_SPRING = { type: 'spring' as const, stiffness: 280, damping: 36, mass: 0.65 };

/** Micro-film grain — makes frosted glass feel physical (very subtle). */
const GLASS_NOISE_DATA =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.6'/%3E%3C/svg%3E\")";

function navItemIsActive(item: NavItem, pathname: string, activeMainNav: string | null): boolean {
  if (activeMainNav === item.id) return true;
  if (item.href && pathname.startsWith(item.href)) return true;
  return false;
}

type MainNavItemProps = {
  item: NavItem;
  isCollapsed: boolean;
  isActive: boolean;
  index: number;
};

const MainNavItem = memo(function MainNavItem({ item, isCollapsed, isActive, index }: MainNavItemProps) {
  const navigate = useNavigate();
  const { setActiveMainNav } = useNavigationStore();
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  const Icon = item.icon;
  const label = translateNavLabel(item, (k) => t(k as any));

  const handleClick = useCallback(() => {
    if (item.children?.length) {
      setActiveMainNav(item.id);
      if (item.href) navigate(item.href);
    } else {
      setActiveMainNav(null);
    }
  }, [item.children?.length, item.href, item.id, navigate, setActiveMainNav]);

  const springTransition = reduceMotion ? { duration: 0.15 } : SPRING_SNAPPY;
  const layoutTransition = reduceMotion ? { duration: 0 } : SPRING_SOFT;

  const linkBody = (
    <Link
      to={item.href || '#'}
      onClick={handleClick}
      className={cn(
        'group relative block overflow-visible rounded-2xl border border-transparent',
        'transition-[border-color,box-shadow] duration-300',
        'hover:border-zinc-500/25 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] dark:hover:border-white/10',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-800/50 dark:focus-visible:ring-white/20 dark:focus-visible:ring-offset-zinc-950',
      )}
    >
      <motion.div
        whileTap={reduceMotion ? undefined : { scale: 0.985 }}
        transition={{ type: 'spring', stiffness: 520, damping: 38 }}
        className="relative"
      >
        {/* Hover wash — only when not active */}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 z-[0] rounded-2xl transition-all duration-300',
            !isActive &&
              'opacity-0 group-hover:opacity-100 group-hover:bg-gradient-to-br group-hover:from-zinc-500/15 group-hover:via-zinc-600/10 group-hover:to-zinc-700/8 group-hover:backdrop-blur-2xl group-hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_4px_20px_-8px_rgba(0,0,0,0.12)] dark:group-hover:from-zinc-800/40 dark:group-hover:via-zinc-900/55 dark:group-hover:to-black/40 dark:group-hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_6px_28px_-6px_rgba(0,0,0,0.5)]',
          )}
          aria-hidden
        />

        {/* Sliding active surface — shared layout across items */}
        {isActive && (
          <motion.div
            layoutId="sidebarNavHighlight"
            className={cn(
              'pointer-events-none absolute inset-0 z-[1] rounded-2xl backdrop-blur-2xl dark:backdrop-blur-3xl',
              'bg-gradient-to-br from-zinc-300/50 via-zinc-400/25 to-zinc-500/15',
              'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),inset_0_0_0_1px_rgba(255,255,255,0.15),0_8px_28px_-12px_rgba(0,0,0,0.15)]',
              'dark:from-zinc-800/80 dark:via-zinc-900/75 dark:to-black/60',
              'dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),inset_0_0_0_1px_rgba(255,255,255,0.05),inset_0_-12px_20px_-8px_rgba(0,0,0,0.5),0_12px_40px_-14px_rgba(0,0,0,0.6)]',
            )}
            initial={false}
            transition={layoutTransition}
          />
        )}

        {/* Active left rail — expanded only (neutral, no gold) */}
        {isActive && !isCollapsed && (
          <motion.div
            layoutId="sidebarNavRail"
            className="pointer-events-none absolute left-0 top-1/2 z-[3] h-[58%] w-[3px] -translate-y-1/2 rounded-full bg-zinc-600 shadow-[0_0_12px_rgba(0,0,0,0.35)] dark:bg-zinc-400 dark:shadow-[0_0_14px_rgba(0,0,0,0.45)]"
            initial={false}
            transition={layoutTransition}
          />
        )}

        <div
          className={cn(
            'relative z-[2] flex items-center gap-3 px-3 py-2.5 text-[0.8125rem] font-semibold tracking-wide',
            isActive && !isCollapsed && 'pl-[15px]',
            isCollapsed && 'justify-center px-2 py-2.5',
          )}
        >
          {Icon && (
            <motion.span
              className="relative flex shrink-0"
              animate={
                reduceMotion
                  ? undefined
                  : {
                      scale: isActive ? 1.06 : 1,
                    }
              }
              transition={springTransition}
            >
              <Icon
                className={cn(
                  'h-[1.2rem] w-[1.2rem] transition-colors duration-200',
                  isActive
                    ? 'text-zinc-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] dark:text-zinc-50 dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]'
                    : 'text-zinc-400 group-hover:text-zinc-200 dark:text-zinc-500 dark:group-hover:text-zinc-200',
                )}
                strokeWidth={isActive ? 2.45 : 2}
                aria-hidden
              />
            </motion.span>
          )}

          {!isCollapsed && (
            <>
              <span
                className={cn(
                  'min-w-0 flex-1 truncate transition-colors duration-200',
                  isActive
                    ? 'text-zinc-50 dark:text-zinc-50'
                    : 'text-zinc-400 group-hover:text-zinc-200 dark:text-zinc-500 dark:group-hover:text-zinc-200',
                )}
              >
                {label}
              </span>
              {item.badge && (
                <Badge
                  className={cn(
                    'ml-auto h-5 shrink-0 border-0 text-[10px] font-bold tracking-wider',
                    isActive
                      ? 'bg-zinc-600/50 text-zinc-100 shadow-sm dark:bg-zinc-700/60 dark:text-zinc-100'
                      : 'bg-zinc-700/25 text-zinc-400 group-hover:bg-zinc-600/35 group-hover:text-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-500 dark:group-hover:bg-zinc-700/45 dark:group-hover:text-zinc-300',
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </div>
      </motion.div>
    </Link>
  );

  const staggered = (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: reduceMotion ? 0 : index * STAGGER_MS,
        duration: reduceMotion ? 0 : 0.35,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative"
    >
      {isCollapsed ? (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{linkBody}</TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={10}
            className="border border-zinc-400/35 bg-gradient-to-br from-zinc-600/35 to-zinc-700/25 px-3 py-2 text-sm font-semibold text-zinc-100 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-2xl backdrop-saturate-100 dark:border-white/10 dark:from-zinc-950/98 dark:via-zinc-950/92 dark:to-black/85 dark:text-zinc-200 dark:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.06)] dark:backdrop-blur-3xl"
          >
            {label}
          </TooltipContent>
        </Tooltip>
      ) : (
        linkBody
      )}
    </motion.div>
  );

  return staggered;
});

/* ---------------- DESKTOP SIDEBAR ---------------- */

export const Sidebar = () => {
  const { isCollapsed, toggleCollapsed } = useSidebarStore();
  const { clearAll } = useNavigationStore();
  const { goHomeViaLogo } = useLogoHomeNavigation();
  const location = useLocation();
  const activeMainNav = useNavigationStore((s) => s.activeMainNav);
  const reduceMotion = useReducedMotion();

  const activePredicate = useMemo(
    () => (item: NavItem) => navItemIsActive(item, location.pathname, activeMainNav),
    [location.pathname, activeMainNav],
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={reduceMotion ? { duration: 0.22 } : ASIDE_SPRING}
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col overflow-hidden isolate',
        /* Low white: dark-smoke (light) + near-black glass (dark) — no bright top wash */
        'border-r border-zinc-500/25 bg-gradient-to-b from-zinc-600/30 via-zinc-700/22 to-zinc-800/28',
        'backdrop-blur-[48px] backdrop-saturate-110',
        'shadow-[12px_0_80px_-28px_rgba(0,0,0,0.28),inset_0_0_0_1px_rgba(255,255,255,0.1),inset_1px_0_0_rgba(255,255,255,0.06)]',
        'dark:border-white/[0.08] dark:from-black/82 dark:via-zinc-950/90 dark:to-black/78',
        'dark:backdrop-blur-[56px] dark:backdrop-saturate-95',
        'dark:shadow-[16px_0_100px_-32px_rgba(0,0,0,0.82),8px_0_40px_-12px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(255,255,255,0.06),inset_1px_0_0_rgba(255,255,255,0.04),inset_-1px_0_24px_-8px_rgba(0,0,0,0.4)]',
        'will-change-[width]',
      )}
    >
      {/* Film grain — physical glass texture */}
      <div
        className="pointer-events-none absolute inset-0 z-[3] opacity-[0.055] mix-blend-overlay dark:opacity-[0.09] dark:mix-blend-soft-light"
        style={{ backgroundImage: GLASS_NOISE_DATA, backgroundRepeat: 'repeat' }}
        aria-hidden
      />

      {/* Light: subtle depth from bottom/sides only — no white top blob */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(90%_70%_at_50%_110%,rgba(0,0,0,0.12)_0%,transparent_50%),radial-gradient(70%_50%_at_0%_50%,rgba(0,0,0,0.06)_0%,transparent_45%)] opacity-90 dark:hidden"
        aria-hidden
      />
      {/* Dark: corners + bottom weight only; top stays dark */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] hidden bg-[radial-gradient(110%_70%_at_50%_105%,rgba(0,0,0,0.65)_0%,transparent_55%),radial-gradient(85%_55%_at_0%_100%,rgba(0,0,0,0.6)_0%,transparent_50%),radial-gradient(80%_50%_at_100%_100%,rgba(0,0,0,0.55)_0%,transparent_48%)] dark:block"
        aria-hidden
      />

      {/* Inner vignette — dark: deepens edges */}
      <div
        className="pointer-events-none absolute inset-0 z-[2] hidden bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.55)_100%)] opacity-70 dark:block"
        aria-hidden
      />

      {/* Bare specular — very dim, no white band at top */}
      <div
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-transparent via-transparent to-zinc-500/5 opacity-80 dark:via-white/[0.02] dark:to-transparent dark:opacity-100"
        aria-hidden
      />

      {/* Right edge — faint rim */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-px bg-gradient-to-b from-zinc-400/30 via-zinc-500/20 to-zinc-700/35 opacity-80 dark:from-zinc-600/40 dark:via-zinc-700/25 dark:to-black/60 dark:opacity-90"
        aria-hidden
      />

      {/* Bottom depth fade */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-36 bg-gradient-to-t from-black/[0.05] to-transparent dark:h-44 dark:from-black/65 dark:via-black/25"
        aria-hidden
      />

      {/* Top: hairline only — no glow / no white wash */}
      <div
        className="pointer-events-none absolute left-4 right-4 top-0 z-[6] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-60 dark:via-white/8 dark:opacity-80"
        aria-hidden
      />

      {/* -------- LOGO / BRAND -------- */}
      <motion.div
        onClick={() => {
          clearAll();
          goHomeViaLogo();
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            clearAll();
            goHomeViaLogo();
          }
        }}
        whileHover={reduceMotion ? undefined : { scale: 1.01 }}
        whileTap={reduceMotion ? undefined : { scale: 0.995 }}
        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        className={cn(
          'relative z-[1] flex cursor-pointer select-none items-center gap-3 border-b border-zinc-500/20 px-4 py-5',
          'bg-gradient-to-b from-zinc-700/25 via-zinc-800/15 to-transparent backdrop-blur-xl',
          'shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.15),inset_0_1px_0_0_rgba(255,255,255,0.06)]',
          'transition-all duration-300 hover:from-zinc-600/30 hover:via-zinc-700/18',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-800/40 dark:focus-visible:ring-white/15 dark:focus-visible:ring-offset-zinc-950',
          'dark:border-white/[0.08] dark:from-zinc-950/80 dark:via-black/50 dark:to-black/35 dark:backdrop-blur-2xl',
          'dark:shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.05),inset_0_1px_0_0_rgba(255,255,255,0.04),0_12px_40px_-20px_rgba(0,0,0,0.5)]',
          isCollapsed && 'justify-center px-2 py-4',
        )}
      >
        <motion.div
          className="relative shrink-0"
          whileHover={reduceMotion ? undefined : { scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 400, damping: 24 }}
        >
          <AolicLogo
            alt="Bangalore Ashram"
            className="h-10 w-auto object-contain drop-shadow-md"
            style={{ minWidth: 40 }}
          />
        </motion.div>

        {!isCollapsed && (
          <motion.div
            key="brand-text"
            initial={reduceMotion ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.05 }}
            className="min-w-0"
          >
            <h1 className="font-display text-[1.05rem] font-semibold leading-snug tracking-tight text-zinc-100 dark:text-zinc-50">
              Bangalore Ashram
            </h1>
            <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-500">
              The Art of Living International Centre
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* -------- NAVIGATION -------- */}
      <ScrollArea className="relative z-[1] min-h-0 flex-1 scroll-smooth px-3 py-4 [scrollbar-width:thin] [scrollbar-color:rgba(63,63,70,0.25)_transparent] dark:[scrollbar-color:rgba(255,255,255,0.12)_transparent]">
        <LayoutGroup id="sidebar-nav">
          <nav className="flex flex-col gap-1" aria-label="Primary application menu">
            {navigationItems.map((item, index) => (
              <MainNavItem
                key={item.id}
                item={item}
                isCollapsed={isCollapsed}
                isActive={activePredicate(item)}
                index={index}
              />
            ))}
          </nav>
        </LayoutGroup>
      </ScrollArea>

      {/* -------- COLLAPSE -------- */}
      <div className="relative z-[1] border-t border-zinc-600/25 bg-gradient-to-t from-black/20 via-zinc-800/15 to-transparent p-3 backdrop-blur-2xl dark:border-white/[0.08] dark:from-black/60 dark:via-zinc-950/45 dark:to-transparent dark:backdrop-blur-3xl">
        <motion.div whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
          <Button
            variant="ghost"
            onClick={toggleCollapsed}
            className={cn(
              'group/collapse h-11 w-full justify-center rounded-2xl border border-zinc-500/30',
              'bg-gradient-to-b from-zinc-600/25 to-zinc-800/30 text-zinc-200 backdrop-blur-xl dark:text-zinc-400',
              'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_4px_20px_-8px_rgba(0,0,0,0.2)] transition-all duration-200',
              'hover:border-zinc-400/35 hover:from-zinc-500/35 hover:to-zinc-700/35 hover:text-zinc-50 hover:shadow-lg dark:hover:text-zinc-200',
              'focus-visible:ring-2 focus-visible:ring-zinc-500/40 dark:focus-visible:ring-white/15',
              'dark:border-white/12 dark:from-zinc-900/70 dark:to-black/55 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_8px_32px_-8px_rgba(0,0,0,0.55)] dark:hover:from-zinc-800/50 dark:hover:to-black/50',
              !isCollapsed && 'justify-start px-3',
            )}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={reduceMotion ? { duration: 0.2 } : { type: 'spring', stiffness: 260, damping: 22 }}
            >
              <ChevronLeft className="h-4 w-4 transition-transform group-hover/collapse:translate-x-[-1px]" strokeWidth={2.25} />
            </motion.div>
            {!isCollapsed && (
              <span className="ml-2 text-sm font-semibold tracking-wide">Collapse</span>
            )}
          </Button>
        </motion.div>
      </div>
    </motion.aside>
  );
};
