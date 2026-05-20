import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LuxuryCountBadge } from '@/components/ui/LuxuryCountBadge';
import { ToolbarConciergeGlyph } from '@/components/icons/ToolbarGlyphSet';
import { cn } from '@/lib/utils';

interface FloatingButtonProps {
  onClick: () => void;
  unreadCount: number;
  showBadge: boolean;
  className?: string;
}

export function FloatingButton({ onClick, unreadCount, showBadge, className }: FloatingButtonProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            aria-label="Open concierge chat"
            className={cn(
              'group relative fixed bottom-6 right-6 z-[9990] flex h-12 w-12 items-center justify-center md:bottom-8 md:right-8 md:h-14 md:w-14',
              'rounded-full border-0 bg-transparent p-0 shadow-none outline-none',
              'active:scale-[0.98]',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              className,
            )}
          >
            <span className="relative flex items-center justify-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
              <ToolbarConciergeGlyph className="!h-8 !w-8 text-foreground/90 md:!h-9 md:!w-9" />
              {showBadge && unreadCount > 0 && <LuxuryCountBadge count={unreadCount} />}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" className="font-medium">
          Site concierge · instant help
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
