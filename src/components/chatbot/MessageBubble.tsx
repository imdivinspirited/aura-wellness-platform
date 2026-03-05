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
      className={cn('flex gap-2.5', isUser ? 'justify-end' : 'justify-start')}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF6B35]/10 mt-0.5">
          {LOTUS_SVG}
        </div>
      )}
      <div className={cn('flex max-w-[85%] flex-col', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'rounded-br-sm bg-gradient-to-br from-[#C9A227]/20 to-[#C9A227]/10 text-foreground border border-[#C9A227]/30'
              : 'rounded-bl-sm bg-card text-card-foreground border border-[#C9A227]/15 shadow-sm'
          )}
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
            <div className="prose prose-sm dark:prose-invert max-w-none pr-8 [&_a]:text-[#1B4B6F] dark:[&_a]:text-[#7BB8E0] [&_a]:underline">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              {msg.isStreaming && (
                <span className="inline-block h-4 w-0.5 animate-pulse bg-[#FF6B35] ml-0.5 align-text-bottom rounded-full" />
              )}
            </div>
          )}
        </div>
        {showTimestamps && (
          <span className="mt-1 text-[11px] text-muted-foreground px-1">
            {new Date(msg.timestamp).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
        {sourceLabel && (
          <span className="mt-0.5 text-[10px] text-muted-foreground px-1">{sourceLabel}</span>
        )}
        {!isUser && showSuggestions && msg.suggested_questions && msg.suggested_questions.length > 0 && !msg.isStreaming && (
          <div className="mt-2.5 flex flex-col gap-1.5 w-full">
            <span className="text-[11px] text-muted-foreground font-medium px-1">You may also ask:</span>
            <div className="flex flex-wrap gap-1.5">
              {msg.suggested_questions.slice(0, 3).map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSuggestedQuestion?.(q)}
                  className="rounded-full border border-[#C9A227]/40 bg-[#C9A227]/8 px-3 py-1 text-xs font-medium text-foreground hover:bg-[#C9A227]/20 hover:border-[#C9A227]/60 transition-colors duration-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {!isUser && onRate && msg.id && !msg.isStreaming && (
          <div className="mt-1 flex gap-1 px-1">
            <button
              type="button"
              onClick={() => onRate(msg.id, 1)}
              aria-label="Good response"
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onRate(msg.id, -1)}
              aria-label="Bad response"
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
          <span className="text-sm">👤</span>
        </div>
      )}
    </div>
  );
}
