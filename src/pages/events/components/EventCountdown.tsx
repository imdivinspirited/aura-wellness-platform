import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

function formatParts(ms: number) {
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  const totalS = Math.floor(ms / 1000);
  const d = Math.floor(totalS / 86400);
  const h = Math.floor((totalS % 86400) / 3600);
  const m = Math.floor((totalS % 3600) / 60);
  const s = totalS % 60;
  return { d, h, m, s };
}

function useRemainingMs(target: number) {
  const [remaining, setRemaining] = useState(() => Math.max(0, target - Date.now()));

  useEffect(() => {
    setRemaining(Math.max(0, target - Date.now()));
  }, [target]);

  useEffect(() => {
    let id: ReturnType<typeof window.setInterval> | undefined;

    const tick = () => {
      setRemaining(Math.max(0, target - Date.now()));
    };

    const start = () => {
      id = window.setInterval(tick, 1000);
    };

    const stop = () => {
      if (id !== undefined) window.clearInterval(id);
      id = undefined;
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        stop();
      } else {
        tick();
        start();
      }
    };

    tick();
    start();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [target]);

  return remaining;
}

type EventCountdownProps = {
  targetIso: string;
  className?: string;
  /** e.g. "Time until event starts" */
  accessibilityLabel: string;
  onElapsed?: () => void;
  /** `xs` = dense strip (hero); `sm` default; `md` = large cells */
  size?: 'xs' | 'sm' | 'md';
};

export function EventCountdown({
  targetIso,
  className,
  accessibilityLabel,
  onElapsed,
  size = 'sm',
}: EventCountdownProps) {
  const isXs = size === 'xs';
  const isMd = size === 'md';
  const target = useMemo(() => new Date(targetIso).getTime(), [targetIso]);
  const remaining = useRemainingMs(target);
  const elapsedFired = useRef(false);
  const onElapsedRef = useRef(onElapsed);

  onElapsedRef.current = onElapsed;

  useEffect(() => {
    elapsedFired.current = false;
  }, [target]);

  useEffect(() => {
    if (remaining === 0 && !elapsedFired.current) {
      elapsedFired.current = true;
      onElapsedRef.current?.();
    }
  }, [remaining]);

  const { d, h, m, s } = formatParts(remaining);

  const segments =
    d > 0
      ? [
          { label: 'Days', value: d, key: 'd' as const },
          { label: 'Hrs', value: h, key: 'h' as const },
          { label: 'Min', value: m, key: 'm' as const },
          { label: 'Sec', value: s, key: 's' as const },
        ]
      : [
          { label: 'Hrs', value: h, key: 'h' as const },
          { label: 'Min', value: m, key: 'm' as const },
          { label: 'Sec', value: s, key: 's' as const },
        ];

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div
      className={cn('w-full', className)}
      role="timer"
      aria-live="polite"
      aria-label={accessibilityLabel}
      data-countdown-end={targetIso}
    >
      {/* Segmented chassis: gradient bezel + inset glass cells (HUD / luxury clock) */}
      <div
        className={cn(
          'w-full overflow-hidden rounded-2xl p-px shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
          isXs
            ? 'bg-gradient-to-b from-white/25 via-white/10 to-white/[0.07] ring-1 ring-white/10'
            : 'rounded-[1.05rem] bg-gradient-to-b from-primary/25 via-primary/12 to-primary/[0.08] ring-1 ring-primary/20 dark:from-white/15 dark:via-white/8 dark:to-white/[0.05] dark:ring-white/10',
          isMd && 'rounded-2xl p-[2px]'
        )}
      >
        <div
          className={cn(
            'grid min-w-0 gap-px',
            segments.length === 4 ? 'grid-cols-4' : 'grid-cols-3'
          )}
        >
          {segments.map((seg, index) => {
            const isLast = index === segments.length - 1;
            const display = seg.key === 'd' ? String(seg.value) : pad(seg.value);
            return (
              <div
                key={seg.key}
                className={cn(
                  'relative min-w-0 text-center',
                  isXs
                    ? 'bg-gradient-to-b from-white/[0.14] via-white/[0.06] to-black/30 backdrop-blur-md'
                    : 'bg-gradient-to-b from-background/95 via-background/90 to-muted/25 backdrop-blur-sm dark:from-[hsl(222_24%_11%/0.92)] dark:via-[hsl(222_26%_9%/0.88)] dark:to-[hsl(222_28%_7%/0.95)]',
                  isXs ? 'px-1 py-1.5 sm:px-1.5 sm:py-2' : isMd ? 'px-2 py-3 sm:px-3 sm:py-3.5' : 'px-2 py-2.5 sm:px-2.5 sm:py-3',
                  'first:rounded-l-[0.85rem] last:rounded-r-[0.85rem]',
                  !isXs && 'first:rounded-l-[1rem] last:rounded-r-[1rem]',
                  isMd && 'first:rounded-l-[1.1rem] last:rounded-r-[1.1rem]',
                  isLast &&
                    isXs &&
                    'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[0_0_20px_-2px_rgba(251,191,36,0.18)]'
                )}
              >
                <span
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-90"
                  aria-hidden
                />
                <p
                  className={cn(
                    'font-mono tabular-nums font-semibold tracking-tight',
                    isXs &&
                      'bg-gradient-to-b from-white to-white/85 bg-clip-text text-[0.72rem] leading-none text-transparent md:text-[0.8rem]',
                    !isXs &&
                      cn(
                        'text-foreground dark:bg-gradient-to-b dark:from-white dark:to-white/90 dark:bg-clip-text dark:text-transparent',
                        isMd ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'
                      )
                  )}
                >
                  {display}
                </p>
                <p
                  className={cn(
                    'font-semibold uppercase',
                    isXs
                      ? 'mt-1 text-[0.42rem] leading-none tracking-[0.12em] text-amber-100/75'
                      : 'mt-1 text-[0.52rem] tracking-[0.16em] text-muted-foreground sm:text-[0.55rem] sm:tracking-[0.2em]'
                  )}
                >
                  {seg.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
