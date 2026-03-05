import { useEffect, useState, useRef, useCallback } from 'react';
import { useChatbotStore } from '@/stores/chatbotStore';
import { useChat, type ChatMessage } from '@/hooks/useChat';
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
  const { messages, loading, mode, setMode, sendMessage } = useChat();
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

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label="Close chat"
        className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm md:backdrop-blur-0"
        onClick={handleBackdropClick}
        onKeyDown={(e) => e.key === 'Escape' && handleClose()}
      />
      <div
        className={cn(
          'fixed top-0 right-0 z-[9999] flex h-full w-full flex-col bg-background shadow-[0_20px_60px_rgba(0,0,0,0.15)]',
          'transition-transform duration-300'
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
            {loading && settings.showTypingIndicator && (
              <div className="shrink-0 px-3 pb-2">
                <TypingIndicator />
              </div>
            )}
            <ChatInput
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              disabled={loading}
              showCharCount={true}
            />
          </>
        )}
      </div>
    </>
  );
}
