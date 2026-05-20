import { useRef, useEffect } from 'react';
import { OperatorIcon } from '@/components/chatbot/OperatorIcon';
import { MessageBubble } from './MessageBubble';
import type { ChatMessage } from '@/hooks/useChat';

interface ChatMessagesProps {
  messages: ChatMessage[];
  loading: boolean;
  showTypingIndicator?: boolean;
  showTimestamps?: boolean;
  showSuggestions?: boolean;
  onSuggestedQuestion?: (q: string) => void;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessages({
  messages,
  showTimestamps = true,
  showSuggestions = true,
  onSuggestedQuestion,
  bottomRef,
}: ChatMessagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, bottomRef]);

  return (
    <div
      ref={containerRef}
      className="chat-messages-scroll flex min-h-0 flex-1 flex-col space-y-3 overflow-y-auto bg-muted/40 p-4"
    >
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center px-2 py-10 text-center">
          <div className="mb-6 flex justify-center">
            <OperatorIcon size="hero" className="text-primary/80" />
          </div>
          <p className="font-serif text-lg font-semibold tracking-tight text-foreground">Jay Gurudev</p>
          <p className="mt-2 max-w-[280px] text-xs leading-relaxed text-muted-foreground">
            Your concierge for programs, events, ashram visits, Seva, and everything indexed on this site — with
            source-backed answers.
          </p>
          <div className="mt-6 flex w-full max-w-[300px] flex-wrap justify-center gap-2">
            {['Programs & courses', 'Visit the ashram', 'Seva & careers'].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => onSuggestedQuestion?.(q)}
                className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          msg={msg}
          showTimestamps={showTimestamps}
          onSuggestedQuestion={onSuggestedQuestion}
          showSuggestions={showSuggestions}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
