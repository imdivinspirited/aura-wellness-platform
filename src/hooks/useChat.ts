/**
 * useChat — AOL Assistant with streaming support for platform mode.
 */

import { useState, useCallback, useRef } from 'react';
import {
  getSessionId,
  type ChatMode,
  type DataSource,
} from '@/lib/chat/backendChatApi';
import { getAnswer, streamPlatformChat, type AnswerSource } from '@/lib/chat/chatService';

const SESSION_KEY = 'aol_chat_session';

export type ChatMessageSource = AnswerSource | DataSource;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source?: ChatMessageSource;
  timestamp: number;
  response_time_ms?: number;
  suggested_questions?: string[];
  backendMessageId?: string;
  isStreaming?: boolean;
}

function loadSession(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const p = JSON.parse(raw) as ChatMessage[];
      return Array.isArray(p) ? p.map(m => ({ ...m, isStreaming: false })) : [];
    }
  } catch {
    // ignore
  }
  return [];
}

function saveSession(messages: ChatMessage[]) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages.map(m => ({ ...m, isStreaming: false }))));
  } catch {
    // ignore
  }
}

export function useChat(conversationId?: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>(loadSession);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<ChatMode>('platform');
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(
    conversationId ?? null
  );
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text) return;

      // Abort any in-flight stream
      abortRef.current?.abort();

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };

      setMessages((prev) => {
        const next = [...prev, userMsg];
        saveSession(next);
        return next;
      });
      setLoading(true);

      if (mode === 'platform') {
        // Streaming mode
        const assistantId = `b-${Date.now()}`;
        let assistantSoFar = '';
        const startTime = Date.now();

        const controller = new AbortController();
        abortRef.current = controller;

        // Add empty assistant message
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: 'assistant',
            content: '',
            source: 'website',
            timestamp: Date.now(),
            isStreaming: true,
          },
        ]);

        try {
          await streamPlatformChat({
            message: text,
            signal: controller.signal,
            onDelta: (chunk) => {
              assistantSoFar += chunk;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: assistantSoFar }
                    : m
                )
              );
            },
            onDone: () => {
              const responseTime = Date.now() - startTime;
              setMessages((prev) => {
                const updated = prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, isStreaming: false, response_time_ms: responseTime, suggested_questions: generateSuggestions(text) }
                    : m
                );
                saveSession(updated);
                return updated;
              });
              setLoading(false);
            },
            onError: (errorMsg) => {
              setMessages((prev) => {
                const updated = prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: errorMsg, isStreaming: false }
                    : m
                );
                saveSession(updated);
                return updated;
              });
              setLoading(false);
            },
          });
        } catch {
          setMessages((prev) => {
            const updated = prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: "Namaste 🙏 I'm having a brief moment of silence. Please try again.", isStreaming: false }
                : m
            );
            saveSession(updated);
            return updated;
          });
          setLoading(false);
        }
      } else {
        // Global mode — non-streaming
        try {
          const { answer, source } = await getAnswer(text, mode);
          const assistantMsg: ChatMessage = {
            id: `b-${Date.now()}`,
            role: 'assistant',
            content: answer,
            source,
            timestamp: Date.now(),
          };
          setMessages((prev) => {
            const next = [...prev, assistantMsg];
            saveSession(next);
            return next;
          });
        } catch {
          const assistantMsg: ChatMessage = {
            id: `b-${Date.now()}`,
            role: 'assistant',
            content: "Namaste 🙏 I'm having a brief moment of silence. Please try again.",
            source: 'platform',
            timestamp: Date.now(),
          };
          setMessages((prev) => {
            const next = [...prev, assistantMsg];
            saveSession(next);
            return next;
          });
        } finally {
          setLoading(false);
        }
      }
    },
    [mode, currentConversationId]
  );

  const clearMessages = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setCurrentConversationId(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  }, []);

  return {
    messages,
    loading,
    mode,
    setMode,
    sendMessage,
    clearMessages,
    conversationId: currentConversationId,
    sessionId: getSessionId(),
  };
}

function generateSuggestions(query: string): string[] {
  const q = query.toLowerCase();
  if (/program|course|happiness|workshop/.test(q)) {
    return [
      "What is the Happiness Program and how much does it cost?",
      "How do I register for Sri Sri Yoga?",
      "Tell me about the Silence Retreat",
    ];
  }
  if (/event|festival|shivratri|navratri/.test(q)) {
    return [
      "When is the next Maha Shivaratri celebration?",
      "Tell me about Navratri at the ashram",
      "What weekly events are available?",
    ];
  }
  if (/ashram|visit|stay|accommod/.test(q)) {
    return [
      "What accommodation options are available?",
      "What are the meal timings?",
      "How do I reach the ashram from Bangalore airport?",
    ];
  }
  if (/meditat|kriya|breath/.test(q)) {
    return [
      "What is Sahaj Samadhi Meditation?",
      "What is Sudarshan Kriya?",
      "How does the Silence Retreat work?",
    ];
  }
  if (/seva|volunteer|job|career|intern/.test(q)) {
    return [
      "How can I volunteer at the ashram?",
      "What job openings are available?",
      "How do I apply for an internship?",
    ];
  }
  return [
    "What programs does Art of Living offer?",
    "Tell me about visiting the ashram",
    "How can I volunteer or apply for Seva?",
  ];
}
