/**
 * useAolicChat — Chat state + streaming for AOLIC in drawer.
 * Persists messages in sessionStorage; search mode in localStorage.
 */

import { useState, useCallback, useRef } from 'react';
import { sendAolicChatMessage, type SearchMode } from '@/lib/chat/chatApi';

const STORAGE_KEY = 'aol_chat_session';
const SEARCH_MODE_KEY = 'aolic-search-mode';

export interface AolicMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

function loadSession(): AolicMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AolicMessage[];
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    // ignore
  }
  return [];
}

function saveSession(messages: AolicMessage[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // ignore
  }
}

function loadSearchMode(): SearchMode {
  try {
    const v = localStorage.getItem(SEARCH_MODE_KEY) as SearchMode | null;
    if (v === 'platform' || v === 'global' || v === 'mix') return v;
  } catch {
    // ignore
  }
  return 'mix';
}

export function useAolicChat() {
  const [messages, setMessages] = useState<AolicMessage[]>(loadSession);
  const [isStreaming, setIsStreaming] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>(loadSearchMode);
  const abortRef = useRef<AbortController | null>(null);

  const setSearchModePersist = useCallback((mode: SearchMode) => {
    setSearchMode(mode);
    try {
      localStorage.setItem(SEARCH_MODE_KEY, mode);
    } catch {
      // ignore
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const text = content.trim();
    if (!text) return;

    const userMsg: AolicMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    const assistantId = `b-${Date.now()}`;
    const assistantMsg: AolicMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    const next = [...messages, userMsg, assistantMsg];
    setMessages(next);
    saveSession(next);
    setIsStreaming(true);

    const abort = new AbortController();
    abortRef.current = abort;

    const apiMessages = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      await sendAolicChatMessage({
        messages: apiMessages,
        onChunk: (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + chunk } : m
            )
          );
        },
        signal: abort.signal,
        model: 'openai',
        processingMode: 'fallback',
        searchMode,
        persona: 'default',
      });
      setMessages((prev) => {
        const updated = [...prev];
        saveSession(updated);
        return updated;
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      const errorContent = err instanceof Error ? err.message : 'Something went wrong.';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: `⚠️ ${errorContent}` } : m
        )
      );
      saveSession([...messages, userMsg, { ...assistantMsg, content: `⚠️ ${errorContent}` }]);
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [messages, searchMode]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return {
    messages,
    isStreaming,
    searchMode,
    setSearchMode: setSearchModePersist,
    sendMessage,
    stopStreaming,
    clearMessages,
  };
}
