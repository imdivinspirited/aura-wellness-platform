import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToolbarBellGlyph } from '@/components/icons/ToolbarGlyphSet';

type Size = 'sm' | 'md' | 'lg';

const sizeClass: Record<Size, string> = {
  sm: 'h-6 w-6',
  md: 'h-7 w-7',
  lg: 'h-10 w-10',
};

/**
 * Bell for sheets / empty states — `lg` matches header toolbar size.
 */
export function NotificationGlyph({ className, size = 'md' }: { className?: string; size?: Size }) {
  if (size === 'lg') {
    return <ToolbarBellGlyph className={cn('!h-10 !w-10 text-muted-foreground', className)} />;
  }
  return (
    <Bell
      className={cn('shrink-0 text-muted-foreground', sizeClass[size], className)}
      strokeWidth={1.5}
      aria-hidden
    />
  );
}
