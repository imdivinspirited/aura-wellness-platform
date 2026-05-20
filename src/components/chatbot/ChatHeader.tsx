import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolbarConciergeGlyph } from '@/components/icons/ToolbarGlyphSet';
import { CHATBOT_SUBTITLE } from '@/lib/chat/assistantConstants';

interface ChatHeaderProps {
  mode: 'platform';
  onModeChange: (m: 'platform') => void;
  onClose: () => void;
  onProfileClick: () => void;
  onFullscreen?: () => void;
}

export function ChatHeader({ onClose }: ChatHeaderProps) {
  return (
    <header className="shrink-0 border-b border-border bg-card px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <ToolbarConciergeGlyph className="!h-10 !w-10 shrink-0 text-primary" />
          <div className="min-w-0 pt-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate font-serif text-base font-semibold tracking-tight text-foreground">
                Concierge
              </h2>
              <span className="rounded-md border border-border bg-muted/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Live
              </span>
            </div>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{CHATBOT_SUBTITLE}</p>
            <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
              <span>Indexed answers · verified links</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={onClose}
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
