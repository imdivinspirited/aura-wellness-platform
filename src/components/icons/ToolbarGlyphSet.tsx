import { cn } from '@/lib/utils';

/** Icon-only hover: slight scale, lift, soft glow (parent must use `group`). */
const ICON_MOTION = cn(
  'transition-[transform,color,filter] duration-300 ease-out will-change-transform',
  'motion-reduce:transition-none motion-reduce:group-hover:transform-none motion-reduce:group-hover:filter-none',
  'group-hover:scale-[1.07] group-hover:-translate-y-px',
  'group-hover:text-foreground group-hover:drop-shadow-[0_2px_8px_rgba(0,0,0,0.12)]',
  'dark:group-hover:drop-shadow-[0_2px_14px_rgba(255,255,255,0.07)]',
);

/** Default toolbar size; override with className (e.g. chat hero). */
const GLYPH = cn('h-5 w-5 shrink-0 text-muted-foreground/90', ICON_MOTION);

const sw = 1.35;

/**
 * Do overlapping bubbles + subtle lines — chat; premium stroke (toolbar `group` par hover).
 */
export function ToolbarConciergeGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn(GLYPH, className)} aria-hidden>
      <path
        d="M14 9a2 2 0 01-2 2H6l-4 4V4a2 2 0 012-2h8a2 2 0 012 2v5z"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 9h2a2 2 0 012 2v11l-4-4h-6a2 2 0 01-2-2v-1"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.2 13.2h4.1M15.2 15h2.8"
        stroke="currentColor"
        strokeWidth={1.15}
        strokeLinecap="round"
        className="opacity-[0.38] transition-opacity duration-300 group-hover:opacity-60"
      />
    </svg>
  );
}

export function ToolbarBellGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn(GLYPH, className)} aria-hidden>
      <path
        d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.3 21a1.94 1.94 0 003.4 0"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ToolbarCartGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn(GLYPH, className)} aria-hidden>
      <circle cx="8" cy="21" r="1" stroke="currentColor" strokeWidth={sw} fill="none" />
      <circle cx="19" cy="21" r="1" stroke="currentColor" strokeWidth={sw} fill="none" />
      <path
        d="M2.05 2.05h2l2.66 12.42a2 2 0 002 1.58h9.78a2 2 0 001.95-1.57l1.65-7.43H5.12"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
