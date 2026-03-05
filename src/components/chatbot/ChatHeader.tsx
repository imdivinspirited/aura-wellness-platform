import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ModeToggle } from './ModeToggle';

const OM_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-[#FF6B35]">
    <path d="M12 2c-.6 0-1.2.3-1.5.8L8.5 8.5C7.5 9.5 6 10 4.5 10c-1 0-1.5.5-1.5 1.5S3.5 13 4.5 13c2.5 0 4.5-1 6-2.5 1.5 1.5 3.5 2.5 6 2.5 1 0 1.5-.5 1.5-1.5s-.5-1.5-1.5-1.5c-1.5 0-3-.5-4-1.5l-2-5.7C10.2 2.3 11.4 2 12 2zm0 4l1.5 4c-.5.3-1 .5-1.5.5s-1-.2-1.5-.5L12 6z" />
  </svg>
);

interface ChatHeaderProps {
  mode: 'platform' | 'global';
  onModeChange: (m: 'platform' | 'global') => void;
  onClose: () => void;
  onProfileClick: () => void;
  onFullscreen?: () => void;
}

export function ChatHeader({
  mode,
  onModeChange,
  onClose,
  onProfileClick,
  onFullscreen,
}: ChatHeaderProps) {
  return (
    <header className="flex shrink-0 flex-col gap-2 border-b border-border bg-card px-3 py-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6B35]/10">
            {OM_SVG}
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              AOLIC Support
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-green-600 dark:text-green-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Online
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg"
            onClick={onClose}
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ModeToggle mode={mode} onModeChange={onModeChange} />
    </header>
  );
}
