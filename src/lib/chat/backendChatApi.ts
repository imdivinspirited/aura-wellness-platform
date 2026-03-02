/**
 * Chat API client for AOL backend (FastAPI).
 * Uses VITE_CHAT_API_BASE_URL (e.g. http://localhost:8000).
 */

const BASE =
  (import.meta.env.VITE_CHAT_API_BASE_URL as string)?.replace(/\/$/, '') || '';

const SESSION_KEY = 'aol_chat_session_id';

export function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export type ChatMode = 'platform' | 'global';

export type DataSource =
  | 'website'
  | 'text_file'
  | 'external_link'
  | 'global'
  | 'fallback'
  | 'greeting';

export interface ChatResponse {
  reply: string;
  source: DataSource;
  suggested_questions: string[];
  conversation_id: string;
  response_time_ms: number;
}

export async function postChat(
  message: string,
  mode: ChatMode,
  conversationId?: string | null
): Promise<ChatResponse> {
  if (!BASE) {
    throw new Error('Chat backend not configured. Set VITE_CHAT_API_BASE_URL.');
  }
  const sessionId = getSessionId();
  const res = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: message.trim(),
      mode,
      conversation_id: conversationId || null,
      session_id: sessionId,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error((err as { detail?: string }).detail || 'Chat request failed');
  }
  return res.json() as Promise<ChatResponse>;
}

export async function getAnalytics(): Promise<{
  overview: {
    total_conversations: number;
    messages_sent: number;
    messages_received: number;
    avg_response_time_ms: number;
    active_days_streak: number;
    last_active: string | null;
    top_topics: string[];
  };
  daily_conversations: Array<{ date: string; count: number }>;
  messages_per_day: Array<{ day: string; date: string; sent: number; received: number }>;
  mode_usage: { platform: number; global: number };
  top_categories: Array<{ name: string; count: number }>;
  recent_conversations: Array<{
    id: string;
    date: string;
    first_message: string;
    messages: number;
    mode: string;
    duration: string;
  }>;
}> {
  if (!BASE) return getEmptyAnalytics();
  const sessionId = getSessionId();
  const res = await fetch(`${BASE}/api/analytics?session_id=${encodeURIComponent(sessionId)}`);
  if (!res.ok) return getEmptyAnalytics();
  return res.json();
}

function getEmptyAnalytics() {
  return {
    overview: {
      total_conversations: 0,
      messages_sent: 0,
      messages_received: 0,
      avg_response_time_ms: 0,
      active_days_streak: 0,
      last_active: null as string | null,
      top_topics: [] as string[],
    },
    daily_conversations: [],
    messages_per_day: [],
    mode_usage: { platform: 50, global: 50 },
    top_categories: [],
    recent_conversations: [],
  };
}

export async function getSettings(): Promise<{ preferences: Record<string, unknown> }> {
  if (!BASE) return { preferences: {} };
  const sessionId = getSessionId();
  const res = await fetch(`${BASE}/api/settings?session_id=${encodeURIComponent(sessionId)}`);
  if (!res.ok) return { preferences: {} };
  return res.json();
}

export async function saveSettings(preferences: Record<string, unknown>): Promise<void> {
  if (!BASE) return;
  const sessionId = getSessionId();
  await fetch(`${BASE}/api/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, preferences }),
  });
}

export interface HistoryConversation {
  id: string;
  started_at: string;
  title: string;
  message_count: number;
  mode: string;
}

export async function getHistory(
  search?: string,
  limit?: number,
  offset?: number
): Promise<{ conversations: HistoryConversation[] }> {
  if (!BASE) return { conversations: [] };
  const sessionId = getSessionId();
  let url = `${BASE}/api/history?session_id=${encodeURIComponent(sessionId)}&limit=${limit ?? 20}&offset=${offset ?? 0}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  const res = await fetch(url);
  if (!res.ok) return { conversations: [] };
  return res.json();
}

export async function getConversation(conversationId: string): Promise<{
  messages: Array<{ id: string; role: string; content: string; created_at: string; data_source?: string }>;
}> {
  if (!BASE) return { messages: [] };
  const sessionId = getSessionId();
  const res = await fetch(
    `${BASE}/api/history/${conversationId}?session_id=${encodeURIComponent(sessionId)}`
  );
  if (!res.ok) return { messages: [] };
  return res.json();
}

export async function deleteConversation(conversationId: string): Promise<void> {
  if (!BASE) return;
  const sessionId = getSessionId();
  await fetch(`${BASE}/api/history/${conversationId}?session_id=${encodeURIComponent(sessionId)}`, {
    method: 'DELETE',
  });
}

export async function clearAllHistory(): Promise<void> {
  if (!BASE) return;
  const sessionId = getSessionId();
  await fetch(`${BASE}/api/history/all?session_id=${encodeURIComponent(sessionId)}`, {
    method: 'DELETE',
  });
}

export async function postFeedback(messageId: string, rating: 1 | -1): Promise<void> {
  if (!BASE) return;
  await fetch(`${BASE}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message_id: messageId, rating }),
  });
}

export function isBackendConfigured(): boolean {
  return Boolean(BASE);
}
