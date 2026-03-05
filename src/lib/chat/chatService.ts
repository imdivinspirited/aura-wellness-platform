/**
 * Chat service — Platform (streaming RAG) and Global Search.
 */

import { supabase } from '@/integrations/supabase/client';

export type ChatMode = 'platform' | 'global';
export type AnswerSource = 'platform' | 'web' | 'website';

export interface ChatAnswer {
  answer: string;
  source: AnswerSource;
  suggested_questions?: string[];
}

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;
const CHAT_API_BASE = (RAW_API_BASE && RAW_API_BASE.replace(/\/$/, '')) || '';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/platform-chat`;

/**
 * Platform chat with SSE streaming — calls edge function powered by RAG + Lovable AI.
 */
export async function streamPlatformChat({
  message,
  conversationHistory,
  isFirstMessage,
  onDelta,
  onDone,
  onError,
  signal,
}: {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  isFirstMessage?: boolean;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
  signal?: AbortSignal;
}): Promise<void> {
  try {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        message,
        conversation_history: conversationHistory || [],
        is_first_message: isFirstMessage ?? false,
      }),
      signal,
    });

    if (!resp.ok) {
      // Non-streaming error response (JSON)
      try {
        const errData = await resp.json();
        if (errData?.answer) {
          onDelta(errData.answer);
          onDone();
          return;
        }
        if (errData?.error) {
          onError(errData.error);
          return;
        }
      } catch {
        // fall through
      }
      onError("I'm sorry, something went wrong while retrieving that information. Please try again.");
      return;
    }

    const contentType = resp.headers.get('Content-Type') || '';

    // If response is JSON (non-streaming fallback)
    if (contentType.includes('application/json')) {
      const data = await resp.json();
      onDelta(data?.answer || data?.choices?.[0]?.message?.content || "Please try again.");
      onDone();
      return;
    }

    // SSE streaming
    if (!resp.body) {
      onError("Streaming not available. Please try again.");
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          // Partial JSON — put back and wait
          buffer = line + '\n' + buffer;
          break;
        }
      }
    }

    // Final flush
    if (buffer.trim()) {
      for (let raw of buffer.split('\n')) {
        if (!raw) continue;
        if (raw.endsWith('\r')) raw = raw.slice(0, -1);
        if (raw.startsWith(':') || raw.trim() === '') continue;
        if (!raw.startsWith('data: ')) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }

    onDone();
  } catch (e) {
    if (signal?.aborted) return;
    if (import.meta.env.DEV) {
      console.error('[platform-chat] stream error:', e);
    }
    onError("I'm sorry, something went wrong while retrieving that information. Please try again.");
  }
}

/**
 * Platform chat — non-streaming fallback.
 */
async function platformChat(message: string): Promise<ChatAnswer> {
  try {
    const { data, error } = await supabase.functions.invoke('platform-chat', {
      body: { message },
    });

    if (error) {
      if (import.meta.env.DEV) {
        console.error('[platform-chat] invoke error:', error);
      }
      return {
        answer: "I'm sorry, something went wrong while retrieving that information. Please try again.",
        source: 'platform',
      };
    }

    return {
      answer: data?.answer || data?.choices?.[0]?.message?.content || "I couldn't find specific information. Please visit [artofliving.org](https://www.artofliving.org).",
      source: (data?.source as AnswerSource) || 'platform',
      suggested_questions: data?.suggested_questions,
    };
  } catch (_e) {
    if (import.meta.env.DEV) {
      console.error('[platform-chat] unexpected error:', _e);
    }
    return {
      answer: "I'm sorry, something went wrong while retrieving that information. Please try again.",
      source: 'platform',
    };
  }
}

/**
 * Global search — calls backend if configured.
 */
async function globalSearch(message: string): Promise<ChatAnswer> {
  if (!CHAT_API_BASE) {
    return {
      answer: "Global Search is not currently available. Please use **Platform Only** mode for the best experience.",
      source: 'web',
    };
  }

  try {
    const res = await fetch(`${CHAT_API_BASE}/api/v1/global-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const data = (await res.json().catch(() => ({}))) as { answer?: string };
    if (res.ok && typeof data.answer === 'string') {
      return { answer: data.answer, source: 'web' };
    }
    return {
      answer: "Global Search is temporarily unavailable. Please use **Platform Only** mode.",
      source: 'web',
    };
  } catch {
    return {
      answer: "Global Search is temporarily unavailable. Please try **Platform Only** mode.",
      source: 'web',
    };
  }
}

/**
 * Get answer — non-streaming. Used for global mode.
 */
export async function getAnswer(message: string, mode: ChatMode): Promise<ChatAnswer> {
  const trimmed = message.trim();
  if (!trimmed) return { answer: 'Please ask a question.', source: 'platform' };

  if (mode === 'platform') return platformChat(trimmed);
  return globalSearch(trimmed);
}
