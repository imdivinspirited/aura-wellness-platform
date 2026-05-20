import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/** Subtle film grain — no external asset (same as mood check) */
export const onboardingNoiseDataUri =
  "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E";

export function onboardingDialogOverlayClassName(isDark: boolean) {
  return cn(
    'z-[10100] backdrop-blur-md sm:backdrop-blur-xl',
    isDark
      ? 'bg-[radial-gradient(ellipse_120%_100%_at_50%_-30%,rgba(30,58,138,0.45)_0%,rgba(2,6,23,0.94)_42%,rgba(0,0,0,0.97)_100%)]'
      : 'bg-gradient-to-br from-amber-50/90 via-stone-50/85 to-sky-100/80',
    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
  );
}

export function onboardingDialogContentClassName(isDark: boolean) {
  return cn(
    'relative z-[10101] gap-0 border-0 p-0 shadow-none',
    'fixed left-0 top-0 flex h-[100dvh] max-h-[100dvh] min-h-0 w-full max-w-none translate-x-0 translate-y-0 flex-col overflow-hidden rounded-none bg-transparent',
    'pt-[max(0.25rem,env(safe-area-inset-top,0px))] pb-[max(0.25rem,env(safe-area-inset-bottom,0px))]',
    isDark
      ? 'sm:rounded-[1.75rem] sm:border sm:border-white/[0.07] sm:bg-zinc-950/20 sm:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_40px_100px_-20px_rgba(0,0,0,0.85),0_0_100px_-30px_rgba(99,102,241,0.18)] sm:backdrop-blur-[2px]'
      : 'sm:rounded-[1.75rem] sm:border sm:border-white/70 sm:bg-white/30 sm:shadow-[0_32px_90px_-24px_rgba(15,23,42,0.14),0_0_0_1px_rgba(255,255,255,0.9)_inset] sm:backdrop-blur-2xl',
    'sm:left-1/2 sm:top-1/2 sm:h-[min(92dvh,680px)] sm:max-h-[min(92dvh,680px)] sm:max-w-[min(94vw,520px)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:overflow-hidden sm:pt-0 sm:pb-0',
    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    isDark
      ? '[&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:border [&>button]:border-white/[0.12] [&>button]:bg-white/[0.06] [&>button]:p-2 [&>button]:text-slate-200 [&>button]:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] [&>button]:backdrop-blur-md [&>button]:transition-colors hover:[&>button]:border-white/25 hover:[&>button]:bg-white/12 hover:[&>button]:text-white'
      : '[&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:border [&>button]:border-white/80 [&>button]:bg-white/70 [&>button]:p-2 [&>button]:text-foreground [&>button]:shadow-sm [&>button]:backdrop-blur-md [&>button]:transition-colors hover:[&>button]:bg-white/90'
  );
}

type OnboardingModalFrameProps = {
  isDark: boolean;
  reduceMotion: boolean;
  /** Mood grid uses fixed height; language/appearance scroll inside */
  bodyOverflow?: 'hidden' | 'auto';
  children: React.ReactNode;
};

/**
 * Shared atmospheric background + inner column for mood, language, and appearance onboarding modals.
 */
export function OnboardingModalFrame({ isDark, reduceMotion, bodyOverflow = 'hidden', children }: OnboardingModalFrameProps) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 min-h-full w-full overflow-hidden rounded-[inherit]">
        {isDark ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-[#060a14] via-[#030712] to-[#010409]" aria-hidden />
            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_110%_75%_at_50%_-35%,rgba(79,70,229,0.28),transparent_58%)]"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_100%_0%,rgba(251,191,36,0.14),transparent_52%)]"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_65%_45%_at_0%_100%,rgba(14,165,233,0.1),transparent_48%)]"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,transparent_35%,rgba(0,0,0,0.45)_100%)]"
              aria-hidden
            />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-background/95 to-sky-50/40" aria-hidden />
            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_100%_72%_at_50%_-28%,hsl(var(--primary)/0.14),transparent_56%)]"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_88%_58%_at_100%_0%,hsl(var(--accent)/0.12),transparent_54%)]"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_58%_48%_at_0%_100%,hsl(var(--primary)/0.08),transparent_50%)]"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.65)_0%,transparent_45%,rgba(255,255,255,0.2)_100%)]"
              aria-hidden
            />
          </>
        )}
        {!reduceMotion && isDark && (
          <>
            <motion.div
              className="absolute -left-1/4 top-1/4 h-[min(55vw,420px)] w-[min(55vw,420px)] rounded-full bg-cyan-500/15 blur-[100px]"
              animate={{ opacity: [0.45, 0.75, 0.45], scale: [1, 1.05, 1] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden
            />
            <motion.div
              className="absolute -right-1/4 bottom-0 h-[min(60vw,480px)] w-[min(60vw,480px)] rounded-full bg-violet-600/12 blur-[110px]"
              animate={{ opacity: [0.35, 0.65, 0.35], scale: [1.02, 1, 1.02] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              aria-hidden
            />
            <motion.div
              className="absolute left-1/2 top-1/3 h-[min(45vw,320px)] w-[min(45vw,320px)] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[90px]"
              animate={{ opacity: [0.3, 0.55, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              aria-hidden
            />
          </>
        )}
        {!reduceMotion && !isDark && (
          <>
            <motion.div
              className="absolute -left-1/4 top-1/4 h-[min(55vw,420px)] w-[min(55vw,420px)] rounded-full bg-primary/10 blur-[100px]"
              animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.04, 1] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden
            />
            <motion.div
              className="absolute -right-1/4 bottom-0 h-[min(60vw,480px)] w-[min(60vw,480px)] rounded-full bg-accent/12 blur-[110px]"
              animate={{ opacity: [0.28, 0.48, 0.28], scale: [1.02, 1, 1.02] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              aria-hidden
            />
          </>
        )}
        <div
          className={cn('absolute inset-0 mix-blend-overlay', isDark ? 'opacity-[0.35]' : 'opacity-[0.2]')}
          style={{ backgroundImage: `url("${onboardingNoiseDataUri}")` }}
          aria-hidden
        />
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-t via-transparent to-transparent',
            isDark ? 'from-[#030508] opacity-90' : 'from-background/80 opacity-95'
          )}
          aria-hidden
        />
      </div>

      <div
        className={cn(
          'relative z-10 flex min-h-0 w-full flex-1 flex-col px-2 sm:px-6',
          bodyOverflow === 'auto' ? 'overflow-y-auto overflow-x-hidden' : 'overflow-hidden'
        )}
      >
        {children}
      </div>
    </>
  );
}
