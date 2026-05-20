import { useRef, useEffect } from 'react';
import { Paperclip, Send, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const MAX_ROWS = 5;
const MIN_ROWS = 1;

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  disabled?: boolean;
  placeholder?: string;
  showCharCount?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onStop,
  disabled,
  placeholder = 'Ask about programs, events, the ashram…',
  showCharCount = true,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = 24;
    const rows = Math.min(MAX_ROWS, Math.max(MIN_ROWS, Math.floor(el.scrollHeight / lineHeight)));
    el.rows = rows;
    el.style.height = `${rows * lineHeight}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (busy) return;
      onSubmit();
    }
  };

  const busy = !!disabled;
  const canSend = value.trim().length > 0 && !busy;

  return (
    <div className="border-t border-border bg-background p-3">
      <div className="flex gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex cursor-not-allowed items-center justify-center rounded-lg p-2 text-muted-foreground">
                <Paperclip className="h-5 w-5" />
              </span>
            </TooltipTrigger>
            <TooltipContent>Coming soon</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={false}
          rows={MIN_ROWS}
          className={cn(
            'min-h-[40px] max-h-[120px] flex-1 resize-none rounded-lg bg-transparent px-2 py-2 text-sm outline-none',
            'text-foreground placeholder:text-muted-foreground'
          )}
          aria-label="Chat message"
        />
        {busy && onStop ? (
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={onStop}
            className="h-10 w-10 shrink-0 rounded-xl"
            aria-label="Stop generating"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            disabled={!canSend}
            onClick={onSubmit}
            className="h-10 w-10 shrink-0 rounded-xl"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Enter to send · Shift+Enter for a new line</span>
        {showCharCount && value.length > 100 && <span>{value.length} characters</span>}
      </div>
    </div>
  );
}
