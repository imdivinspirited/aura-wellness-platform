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

/* -------------------------------------------------------------------------- */
/*  Premium motion curves                                                     */
/* -------------------------------------------------------------------------- */
const SPRING_SNAPPY = { type: 'spring' as const, stiffness: 500, damping: 36, mass: 0.7 };
const SPRING_SOFT = { type: 'spring' as const, stiffness: 360, damping: 34, mass: 0.85 };
const STAGGER_MS = 0.038;
const ASIDE_SPRING = { type: 'spring' as const, stiffness: 320, damping: 38, mass: 0.62 };

/** Micro-film grain — adds tactile depth to the frosted surface. */
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
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group relative block overflow-visible rounded-xl border border-transparent',
        'transition-[border-color,box-shadow,background-color] duration-300 ease-out',
        'hover:border-white/[0.06]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950/60',
      )}
    >
      <motion.div
        whileTap={reduceMotion ? undefined : { scale: 0.985 }}
        transition={{ type: 'spring', stiffness: 540, damping: 40 }}
        className="relative"
      >
        {/* Hover wash — only when not active */}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 z-[0] rounded-xl transition-opacity duration-300 ease-out',
            !isActive &&
              'opacity-0 group-hover:opacity-100 bg-gradient-to-br from-white/[0.06] via-white/[0.025] to-transparent shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
          )}
          aria-hidden
        />

        {/* Sliding active surface — shared layout across items */}
        {isActive && (
          <motion.div
            layoutId="sidebarNavHighlight"
            className={cn(
              'pointer-events-none absolute inset-0 z-[1] rounded-xl',
              'bg-gradient-to-br from-indigo-500/[0.18] via-violet-500/[0.10] to-sky-500/[0.08]',
              'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.10),inset_0_0_0_1px_rgba(255,255,255,0.06),0_10px_30px_-14px_rgba(79,70,229,0.45)]',
              'backdrop-blur-xl',
            )}
            initial={false}
            transition={layoutTransition}
          />
        )}

        {/* Active left rail — premium indigo glow */}
        {isActive && !isCollapsed && (
          <motion.div
            layoutId="sidebarNavRail"
            className="pointer-events-none absolute left-0 top-1/2 z-[3] h-[60%] w-[2.5px] -translate-y-1/2 rounded-full bg-gradient-to-b from-indigo-300 via-indigo-400 to-violet-500 shadow-[0_0_12px_rgba(129,140,248,0.65)]"
            initial={false}
            transition={layoutTransition}
          />
        )}

        <div
          className={cn(
            'relative z-[2] flex items-center gap-3 px-3 py-2.5 text-[0.8125rem] font-medium tracking-wide',
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
                      scale: isActive ? 1.08 : 1,
                    }
              }
              transition={springTransition}
            >
              {isActive && !reduceMotion && (
                <span
                  className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-indigo-400/25 blur-md"
                  aria-hidden
                />
              )}
              <Icon
                className={cn(
                  'h-[1.2rem] w-[1.2rem] transition-colors duration-200',
                  isActive
                    ? 'text-white drop-shadow-[0_1px_4px_rgba(129,140,248,0.55)]'
                    : 'text-slate-400/90 group-hover:text-slate-100',
                )}
                strokeWidth={isActive ? 2.4 : 1.9}
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
                    ? 'text-white'
                    : 'text-slate-400/90 group-hover:text-slate-100',
                )}
              >
                {label}
              </span>
              {item.badge && (
                <Badge
                  className={cn(
                    'ml-auto h-5 shrink-0 border-0 text-[10px] font-bold tracking-wider',
                    isActive
                      ? 'bg-indigo-400/25 text-indigo-50 shadow-[inset_0_0_0_1px_rgba(165,180,252,0.25)]'
                      : 'bg-white/[0.06] text-slate-400 group-hover:bg-white/[0.10] group-hover:text-slate-100',
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
      initial={reduceMotion ? false : { opacity: 0, x: -12 }}
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
            sideOffset={12}
            className="border border-white/10 bg-slate-950/95 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-100 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-2xl"
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
      transition={reduceMotion ? { duration: 0.2 } : ASIDE_SPRING}
      aria-label="Primary"
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col overflow-hidden isolate',
        /* Luxury deep-indigo glass — works in both light and dark mode */
        'border-r border-white/[0.06]',
        'bg-[linear-gradient(180deg,rgba(15,17,32,0.92)_0%,rgba(10,12,24,0.94)_55%,rgba(6,8,18,0.96)_100%)]',
        'backdrop-blur-2xl backdrop-saturate-150',
        'shadow-[12px_0_60px_-24px_rgba(0,0,0,0.6),inset_-1px_0_0_0_rgba(255,255,255,0.04),inset_1px_0_0_0_rgba(255,255,255,0.05)]',
        'will-change-[width] [transform:translateZ(0)]',
      )}
    >
      {/* Top accent glow — premium signature */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 z-[1] h-48 w-[120%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(closest-side,rgba(99,102,241,0.22),transparent_70%)] opacity-90"
        aria-hidden
      />

      {/* Film grain — physical glass texture */}
      <div
        className="pointer-events-none absolute inset-0 z-[3] opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: GLASS_NOISE_DATA, backgroundRepeat: 'repeat' }}
        aria-hidden
      />

      {/* Inner vignette — deepens edges */}
      <div
        className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)] opacity-70"
        aria-hidden
      />

      {/* Right edge — refined rim light */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-px bg-gradient-to-b from-white/[0.08] via-indigo-400/15 to-transparent"
        aria-hidden
      />

      {/* Bottom depth fade */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-44 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
        aria-hidden
      />

      {/* Top hairline */}
      <div
        className="pointer-events-none absolute left-4 right-4 top-0 z-[6] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
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
        aria-label="Go to home"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            clearAll();
            goHomeViaLogo();
          }
        }}
        whileHover={reduceMotion ? undefined : { scale: 1.005 }}
        whileTap={reduceMotion ? undefined : { scale: 0.995 }}
        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        className={cn(
          'relative z-[4] flex cursor-pointer select-none items-center gap-3 border-b border-white/[0.06] px-4 py-5',
          'bg-gradient-to-b from-white/[0.03] to-transparent',
          'transition-colors duration-300 hover:from-white/[0.05]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950/60',
          isCollapsed && 'justify-center px-2 py-4',
        )}
      >
        <motion.div
          className="relative shrink-0"
          whileHover={reduceMotion ? undefined : { scale: 1.04 }}
          transition={{ type: 'spring', stiffness: 400, damping: 24 }}
        >
          <span
            className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-indigo-400/20 blur-lg"
            aria-hidden
          />
          <AolicLogo
            alt="Bangalore Ashram"
            className="h-10 w-auto object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
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
            <h1 className="font-display text-[1.05rem] font-semibold leading-snug tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Bangalore Ashram
            </h1>
            <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              The Art of Living International Centre
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* -------- NAVIGATION -------- */}
      <ScrollArea className="relative z-[4] min-h-0 flex-1 scroll-smooth px-3 py-4 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.10)_transparent]">
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
      <div className="relative z-[4] border-t border-white/[0.06] bg-gradient-to-t from-black/40 via-black/10 to-transparent p-3 backdrop-blur-xl">
        <motion.div whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
          <Button
            variant="ghost"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-pressed={isCollapsed}
            className={cn(
              'group/collapse h-11 w-full justify-center rounded-xl border border-white/[0.08]',
              'bg-white/[0.03] text-slate-300 backdrop-blur-xl',
              'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_4px_20px_-8px_rgba(0,0,0,0.45)]',
              'transition-all duration-200 ease-out',
              'hover:border-indigo-400/30 hover:bg-white/[0.06] hover:text-white hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.10),0_8px_28px_-8px_rgba(79,70,229,0.45)]',
              'focus-visible:ring-2 focus-visible:ring-indigo-400/50',
              !isCollapsed && 'justify-start px-3',
            )}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={reduceMotion ? { duration: 0.2 } : { type: 'spring', stiffness: 280, damping: 24 }}
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
