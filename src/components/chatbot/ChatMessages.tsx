import { useRef, useEffect } from 'react';
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
      className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
    >
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FF6B35]/10 mb-3">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-[#FF6B35]">
              <path d="M12 2c-.6 0-1.2.3-1.5.8L8.5 8.5C7.5 9.5 6 10 4.5 10c-1 0-1.5.5-1.5 1.5S3.5 13 4.5 13c2.5 0 4.5-1 6-2.5 1.5 1.5 3.5 2.5 6 2.5 1 0 1.5-.5 1.5-1.5s-.5-1.5-1.5-1.5c-1.5 0-3-.5-4-1.5l-2-5.7C10.2 2.3 11.4 2 12 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium">Ask about programs, events, or the ashram.</p>
          <p className="text-xs mt-1">Choose Platform Only (our content) or Global Search.</p>
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
