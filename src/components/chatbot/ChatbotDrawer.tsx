import { useEffect, useState, useRef, useCallback } from 'react';
import { useChatbotStore } from '@/stores/chatbotStore';
import { useChat } from '@/hooks/useChat';
import { useChatSettings } from '@/hooks/useChatSettings';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { DashboardView } from './DashboardView';
import { cn } from '@/lib/utils';

const CHAT_PANEL_KEY = 'aol_chat_panel_open';

interface ChatbotDrawerProps {
  onClose?: () => void;
}

export function ChatbotDrawer({ onClose }: ChatbotDrawerProps) {
  const { isOpen, setOpen } = useChatbotStore();
  const { settings } = useChatSettings();
  const { messages, loading, mode, setMode, sendMessage, stopGeneration } = useChat();
  const [input, setInput] = useState('');
  const [slideIn, setSlideIn] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      try {
        localStorage.setItem(CHAT_PANEL_KEY, 'true');
      } catch {
        // ignore
      }
      const t = requestAnimationFrame(() => setSlideIn(true));
      return () => cancelAnimationFrame(t);
    }
    setSlideIn(false);
    try {
      localStorage.setItem(CHAT_PANEL_KEY, 'false');
    } catch {
      // ignore
    }
  }, [isOpen]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [isOpen, messages, scrollToBottom]);

  const handleClose = useCallback(() => {
    setOpen(false);
    onClose?.();
  }, [setOpen, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) handleClose();
    },
    [handleClose]
  );

  const handleSubmit = useCallback(() => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    sendMessage(text);
  }, [input, loading, sendMessage]);

  const handleSuggestedQuestion = useCallback(
    (q: string) => {
      setInput(q);
      sendMessage(q);
    },
    [sendMessage]
  );

  if (!isOpen) return null;

  const showTypingBar =
    loading &&
    settings.showTypingIndicator &&
    !messages.some((m) => m.isStreaming && m.content.length > 0);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label="Close chat"
        className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-md"
        onClick={handleBackdropClick}
        onKeyDown={(e) => e.key === 'Escape' && handleClose()}
      />
      <div
        className={cn(
          'fixed bottom-0 right-0 z-[9999] flex h-full w-full flex-col md:h-[min(720px,calc(100vh-3rem))] md:w-[440px] md:bottom-6 md:right-6',
          'rounded-none md:rounded-2xl overflow-hidden',
          'border border-border bg-background',
          'shadow-2xl ring-1 ring-black/5 dark:ring-white/10',
          'transition-transform duration-500 ease-out'
        )}
        style={{
          transform: slideIn ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {showDashboard ? (
          <DashboardView onBack={() => setShowDashboard(false)} />
        ) : (
          <>
            <ChatHeader
              mode={mode}
              onModeChange={setMode}
              onClose={handleClose}
              onProfileClick={() => setShowDashboard(true)}
            />
            <ChatMessages
              messages={messages}
              loading={loading}
              showTypingIndicator={settings.showTypingIndicator}
              showTimestamps={settings.showTimestamps}
              showSuggestions={settings.autoSuggestQuestions}
              onSuggestedQuestion={handleSuggestedQuestion}
              bottomRef={bottomRef}
            />
            {showTypingBar && (
              <div className="shrink-0 px-4 pb-2">
                <TypingIndicator />
              </div>
            )}
            <ChatInput
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              onStop={stopGeneration}
              disabled={loading}
              showCharCount={true}
            />
          </>
        )}
      </div>
    </>
  );
}
