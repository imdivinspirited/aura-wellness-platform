import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const LOTUS_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
    <path d="M12 2c-.6 0-1.2.3-1.5.8L8.5 8.5C7.5 9.5 6 10 4.5 10c-1 0-1.5.5-1.5 1.5S3.5 13 4.5 13c2.5 0 4.5-1 6-2.5 1.5 1.5 3.5 2.5 6 2.5 1 0 1.5-.5 1.5-1.5s-.5-1.5-1.5-1.5c-1.5 0-3-.5-4-1.5l-2-5.7C10.2 2.3 11.4 2 12 2zm0 4l1.5 4c-.5.3-1 .5-1.5.5s-1-.2-1.5-.5L12 6zm-3 6c-1.2 0-2.5.4-3.5 1.2l-2.2 2.2c-.5.5-.5 1.3 0 1.8s1.3.5 1.8 0l2.2-2.2c.8-1 1.2-2.3 1.2-3.5H9zm6 0v-.5c0-1.2.4-2.5 1.2-3.5l2.2-2.2c.5-.5 1.3-.5 1.8 0s.5 1.3 0 1.8l-2.2 2.2c-1 .8-1.2 2.3-1.2 3.5H15zm-6 4h.5c1.2 0 2.5-.4 3.5-1.2l2.2-2.2c.5-.5.5-1.3 0-1.8s-1.3-.5-1.8 0l-2.2 2.2c-.8 1-1.2 2.3-1.2 3.5H9zm6 0c0-1.2-.4-2.5-1.2-3.5l-2.2-2.2c-.5-.5-1.3-.5-1.8 0s-.5 1.3 0 1.8l2.2 2.2c1 .8 2.3 1.2 3.5 1.2h.5z" />
  </svg>
);

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
            aria-label="Chat with AOL Assistant"
            className={cn(
              'fixed bottom-6 right-6 z-[9990] flex h-14 w-14 items-center justify-center rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
              'bg-[#FF6B35] text-white hover:bg-[#FF8C5A] hover:scale-105 active:scale-95',
              'animate-[pulse_2s_ease-in-out_infinite]',
              'md:bottom-8 md:right-8 md:h-16 md:w-16',
              'border border-[#C9A227]/30',
              className
            )}
          >
            {LOTUS_SVG}
            {showBadge && unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" className="font-medium">
          Chat with AOL Assistant
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
