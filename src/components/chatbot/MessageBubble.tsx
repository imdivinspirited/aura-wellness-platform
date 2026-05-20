import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, ThumbsUp, ThumbsDown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OperatorIcon } from '@/components/chatbot/OperatorIcon';
import { cn } from '@/lib/utils';
import { getSourceLabel } from './ModeToggle';
import type { ChatMessage } from '@/hooks/useChat';

function AssistantAvatar() {
  return (
    <OperatorIcon size="sm" className="shrink-0 text-muted-foreground" />
  );
}

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
      {!isUser && <AssistantAvatar />}
      <div className={cn('flex max-w-[88%] flex-col', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm',
            isUser
              ? 'rounded-br-md border border-primary/25 bg-primary/10 text-foreground'
              : 'rounded-bl-md border border-border bg-card text-card-foreground'
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
            <div className="prose prose-sm max-w-none pr-8 text-foreground [&_a]:text-primary [&_a]:underline-offset-2 [&_p]:text-foreground [&_li]:text-foreground [&_strong]:font-semibold">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              {msg.isStreaming && (
                <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse rounded-full bg-primary align-text-bottom" />
              )}
            </div>
          )}
        </div>
        {!isUser && msg.sources && msg.sources.length > 0 && !msg.isStreaming && (
          <div className="mt-2 flex flex-wrap gap-1.5 px-0.5">
            <span className="w-full text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Sources
            </span>
            {msg.sources.slice(0, 5).map((s, i) => (
              <a
                key={`${s.title}-${i}`}
                href={s.url || '#'}
                target={s.url ? '_blank' : undefined}
                rel={s.url ? 'noopener noreferrer' : undefined}
                className={cn(
                  'inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[11px] text-foreground transition-colors',
                  s.url && 'hover:bg-muted'
                )}
                onClick={(e) => !s.url && e.preventDefault()}
              >
                <span className="truncate">{s.title}</span>
              </a>
            ))}
          </div>
        )}
        {showTimestamps && (
          <span className="mt-1 px-1 text-[11px] text-muted-foreground">
            {new Date(msg.timestamp).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
        {sourceLabel && (
          <span className="mt-0.5 px-1 text-[10px] text-muted-foreground">{sourceLabel}</span>
        )}
        {!isUser && showSuggestions && msg.suggested_questions && msg.suggested_questions.length > 0 && !msg.isStreaming && (
          <div className="mt-2.5 flex flex-col gap-1.5 w-full">
            <span className="px-1 text-[11px] font-medium text-muted-foreground">You may also ask</span>
            <div className="flex flex-wrap gap-1.5">
              {msg.suggested_questions.slice(0, 3).map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSuggestedQuestion?.(q)}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
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
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
          <User className="h-4 w-4" aria-hidden />
        </div>
      )}
    </div>
  );
}
