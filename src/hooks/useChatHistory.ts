/**
 * useHistory — Chat history list and actions.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  getHistory,
  getConversation,
  deleteConversation as apiDeleteConversation,
  clearAllHistory as apiClearAllHistory,
  type HistoryConversation,
} from '@/lib/chat/backendChatApi';

export interface HistoryMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
  data_source?: string;
}

export function useHistory(sessionId: string | null) {
  const [conversations, setConversations] = useState<HistoryConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);

  const fetchHistory = useCallback(async () => {
    if (!sessionId) {
      setConversations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { conversations: list } = await getHistory(search || undefined, 20, offset);
      setConversations(list);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [sessionId, search, offset]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const loadConversation = useCallback(async (conversationId: string) => {
    const { messages } = await getConversation(conversationId);
    return messages;
  }, []);

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      await apiDeleteConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    },
    []
  );

  const clearAllHistory = useCallback(async () => {
    await apiClearAllHistory();
    setConversations([]);
  }, []);

  return {
    conversations,
    loading,
    search,
    setSearch,
    setOffset,
    fetchHistory,
    loadConversation,
    deleteConversation,
    clearAllHistory,
  };
}
