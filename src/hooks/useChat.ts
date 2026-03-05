/**
 * useChat — AOL Assistant with streaming support for platform mode.
 * Includes greeting-once logic and conversation history.
 */

import { useState, useCallback, useRef } from 'react';
import {
  getSessionId,
  type ChatMode,
  type DataSource,
} from '@/lib/chat/backendChatApi';
import { getAnswer, streamPlatformChat, type AnswerSource } from '@/lib/chat/chatService';

const SESSION_KEY = 'aol_chat_session';
const GREETING_KEY = 'aol_chat_session_started';

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

function isFirstMessage(): boolean {
  try {
    return sessionStorage.getItem(GREETING_KEY) !== 'true';
  } catch {
    return true;
  }
}

function markSessionStarted() {
  try {
    sessionStorage.setItem(GREETING_KEY, 'true');
  } catch {
    // ignore
  }
}

/** Build conversation history for the edge function (last 6 turns) */
function buildConversationHistory(messages: ChatMessage[]): Array<{ role: string; content: string }> {
  return messages
    .filter(m => !m.isStreaming)
    .slice(-6)
    .map(m => ({ role: m.role, content: m.content }));
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

      // Determine if this is the first message of the session
      const firstMsg = isFirstMessage();

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
          // Build conversation history from current messages
          const history = buildConversationHistory(messages);

          await streamPlatformChat({
            message: text,
            conversationHistory: history,
            isFirstMessage: firstMsg,
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
              // Mark session as started after first successful response
              if (firstMsg) markSessionStarted();

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
                ? { ...m, content: "I'm sorry, something went wrong while retrieving that information. Please try again.", isStreaming: false }
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
            content: "I'm sorry, something went wrong while retrieving that information. Please try again.",
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
    [mode, currentConversationId, messages]
  );

  const clearMessages = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setCurrentConversationId(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(GREETING_KEY);
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
      "What is the Happiness Program?",
      "How do I register for Sri Sri Yoga?",
      "Tell me about the Silence Retreat",
    ];
  }
  if (/event|festival|shivratri|navratri/.test(q)) {
    return [
      "When is the next celebration?",
      "Tell me about Navratri at the ashram",
      "What weekly events are available?",
    ];
  }
  if (/ashram|visit|stay|accommod|room|book/.test(q)) {
    return [
      "What accommodation options are available?",
      "What are the meal timings?",
      "How do I reach the ashram?",
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
