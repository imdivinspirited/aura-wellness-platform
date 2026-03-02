/**
 * useChat — AOL Assistant. Uses backend when VITE_CHAT_API_BASE_URL is set.
 */

import { useState, useCallback } from 'react';
import {
  getSessionId,
  type ChatMode,
  type DataSource,
} from '@/lib/chat/backendChatApi';
import { getAnswer, type AnswerSource } from '@/lib/chat/chatService';

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
}

function loadSession(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const p = JSON.parse(raw) as ChatMessage[];
      return Array.isArray(p) ? p : [];
    }
  } catch {
    // ignore
  }
  return [];
}

function saveSession(messages: ChatMessage[]) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages));
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

  const sendMessage = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text) return;

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

      try {
        const { answer, source, suggested_questions } = await getAnswer(text, mode);
        const assistantMsg: ChatMessage = {
          id: `b-${Date.now()}`,
          role: 'assistant',
          content: answer,
          source,
          timestamp: Date.now(),
          suggested_questions: suggested_questions || [],
        };
        setMessages((prev) => {
          const next = [...prev, assistantMsg];
          saveSession(next);
          return next;
        });
      } catch (_e) {
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
    },
    [mode, currentConversationId]
  );

  const clearMessages = useCallback(() => {
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
