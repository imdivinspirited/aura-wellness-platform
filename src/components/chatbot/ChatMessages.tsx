import { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import type { ChatMessage } from '@/hooks/useChat';

const LOTUS_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-[#FF6B35]">
    <path d="M12 2c-.6 0-1.2.3-1.5.8L8.5 8.5C7.5 9.5 6 10 4.5 10c-1 0-1.5.5-1.5 1.5S3.5 13 4.5 13c2.5 0 4.5-1 6-2.5 1.5 1.5 3.5 2.5 6 2.5 1 0 1.5-.5 1.5-1.5s-.5-1.5-1.5-1.5c-1.5 0-3-.5-4-1.5l-2-5.7C10.2 2.3 11.4 2 12 2zm0 4l1.5 4c-.5.3-1 .5-1.5.5s-1-.2-1.5-.5L12 6z" />
  </svg>
);

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
      className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
    >
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF6B35]/10 mb-4">
            {LOTUS_SVG}
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">Jay Gurudev 🙏</p>
          <p className="text-xs max-w-[260px] leading-relaxed">
            Ask about programs, events, visiting the ashram, Seva opportunities, and more.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {[
              "What programs are available?",
              "How to visit the ashram?",
              "Seva opportunities",
            ].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => onSuggestedQuestion?.(q)}
                className="rounded-full border border-[#C9A227]/40 bg-[#C9A227]/8 px-3 py-1 text-xs font-medium text-foreground hover:bg-[#C9A227]/20 transition-colors"
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
