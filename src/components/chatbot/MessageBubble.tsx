import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getSourceLabel } from './ModeToggle';
import type { ChatMessage } from '@/hooks/useChat';

const LOTUS_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[#FF6B35]">
    <path d="M12 2c-.6 0-1.2.3-1.5.8L8.5 8.5C7.5 9.5 6 10 4.5 10c-1 0-1.5.5-1.5 1.5S3.5 13 4.5 13c2.5 0 4.5-1 6-2.5 1.5 1.5 3.5 2.5 6 2.5 1 0 1.5-.5 1.5-1.5s-.5-1.5-1.5-1.5c-1.5 0-3-.5-4-1.5l-2-5.7C10.2 2.3 11.4 2 12 2zm0 4l1.5 4c-.5.3-1 .5-1.5.5s-1-.2-1.5-.5L12 6z" />
  </svg>
);

interface MessageBubbleProps {
  msg: ChatMessage;
  showTimestamps?: boolean;
  onSuggestedQuestion?: (q: string) => void;
  onCopy?: (text: string) => void;
  onRate?: (messageId: string, rating: 1 | -1) => void;
  showSuggestions?: boolean;
}

export function MessageBubble({
  msg,
  showTimestamps = true,
  onSuggestedQuestion,
  onCopy,
  onRate,
  showSuggestions = true,
}: MessageBubbleProps) {
  const [hover, setHover] = useState(false);
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === 'user';

  const handleCopy = useCallback(() => {
    const text = msg.content;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      onCopy?.(text);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [msg.content, onCopy]);

  const sourceLabel = !isUser && msg.source ? getSourceLabel(msg.source) : '';

  return (
    <div
      className={cn('flex gap-2', isUser ? 'justify-end' : 'justify-start')}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF6B35]/10">
          {LOTUS_SVG}
        </div>
      )}
      <div className={cn('flex max-w-[85%] flex-col', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'relative rounded-[20px] px-4 py-2 text-sm shadow-sm',
            isUser
              ? 'rounded-br-[4px] bg-gradient-to-br from-[#FF6B35] to-[#FF8C5A] text-white'
              : 'rounded-bl-[4px] bg-[#FAFAF8] text-[#1C1C1C] dark:bg-[#2D2D44] dark:text-[#F5F5F5]'
          )}
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {hover && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
              aria-label="Copy message"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied && <span className="absolute -top-1 -right-1 text-[10px]">✓</span>}
            </Button>
          )}
          {isUser ? (
            <div className="whitespace-pre-wrap break-words pr-8">{msg.content}</div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none pr-8">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
        {showTimestamps && (
          <span className="mt-1 text-[12px] text-muted-foreground">
            {new Date(msg.timestamp).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
        {sourceLabel && (
          <span className="mt-0.5 text-[11px] text-muted-foreground">{sourceLabel}</span>
        )}
        {!isUser && showSuggestions && msg.suggested_questions && msg.suggested_questions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {msg.suggested_questions.slice(0, 3).map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSuggestedQuestion?.(q)}
                className="rounded-full border border-[#C9A227]/50 bg-[#C9A227]/10 px-3 py-1 text-xs font-medium text-foreground hover:bg-[#C9A227]/20 dark:border-[#C9A227]/30 dark:bg-[#C9A227]/20"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        {!isUser && onRate && msg.id && (
          <div className="mt-1 flex gap-1">
            <button
              type="button"
              onClick={() => onRate(msg.id, 1)}
              aria-label="Good response"
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onRate(msg.id, -1)}
              aria-label="Bad response"
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF6B35]/20">
          <span className="text-sm">👤</span>
        </div>
      )}
    </div>
  );
}
