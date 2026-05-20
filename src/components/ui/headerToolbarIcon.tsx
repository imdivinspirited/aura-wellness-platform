import { cn } from '@/lib/utils';

/**
 * Ghost icon triggers — `group` drives icon-only hover (zoom / glow).
 * Overrides shadcn `ghost` so hover/active me koi background / chip nahi dikhe.
 */
export const headerToolbarIconButtonClass = cn(
  'group relative flex h-9 w-9 shrink-0 items-center justify-center overflow-visible p-0 sm:h-10 sm:w-10',
  'rounded-xl border-0 bg-transparent shadow-none',
  'text-muted-foreground transition-colors duration-200',
  'hover:text-foreground hover:bg-muted/35 active:bg-muted/45',
  'data-[state=open]:bg-muted/25',
  'focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  '[&_svg]:pointer-events-none [&_svg]:!h-[1.15rem] [&_svg]:!w-[1.15rem] sm:[&_svg]:!h-5 sm:[&_svg]:!w-5',
);
