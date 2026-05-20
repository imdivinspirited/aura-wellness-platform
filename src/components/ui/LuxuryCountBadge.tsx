import { cn } from '@/lib/utils';

/** Unread count — brand primary pill, readable on toolbars and FAB. */
export function LuxuryCountBadge({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  const label = count > 99 ? '99+' : String(count);
  return (
    <div
      className={cn(
        'pointer-events-none absolute -right-0.5 -top-0.5 z-[2]',
        'flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full px-1',
        'border border-primary/20 bg-primary text-primary-foreground shadow-sm',
        'text-[10px] font-semibold tabular-nums tracking-tight',
        'dark:border-primary/30',
        className,
      )}
    >
      {label}
    </div>
  );
}
