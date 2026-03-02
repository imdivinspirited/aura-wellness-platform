/**
 * Chat service — Platform Only and Global Search.
 * Platform: uses Lovable Cloud edge function with AI-powered answers.
 * Global: calls backend /global-chat or returns friendly message.
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

/**
 * Platform chat — calls edge function powered by Lovable AI.
 * Never throws to the user; always returns a friendly message.
 */
async function platformChat(message: string): Promise<ChatAnswer> {
  try {
    const { data, error } = await supabase.functions.invoke('platform-chat', {
      body: { message },
    });

    if (error) {
      console.error('[platform-chat] invoke error:', error);
      return {
        answer: "Namaste 🙏 I'm experiencing a brief pause. Please try your question again in a moment.",
        source: 'platform',
      };
    }

    return {
      answer: data?.answer || "Namaste 🙏 I couldn't find specific information for your query. Please try rephrasing or visit [artofliving.org](https://www.artofliving.org) directly.",
      source: (data?.source as AnswerSource) || 'platform',
      suggested_questions: data?.suggested_questions,
    };
  } catch (_e) {
    console.error('[platform-chat] unexpected error:', _e);
    return {
      answer: "Namaste 🙏 I'm updating my knowledge. Please try again in a moment.",
      source: 'platform',
    };
  }
}

/**
 * Global search — calls backend if configured, otherwise returns guidance.
 */
async function globalSearch(message: string): Promise<ChatAnswer> {
  if (!CHAT_API_BASE) {
    return {
      answer: "Namaste 🙏 Global Search is not currently available. Please use **Platform Only** mode to ask about Art of Living programs, events, and services.",
      source: 'web',
    };
  }

  try {
    const res = await fetch(`${CHAT_API_BASE}/api/v1/global-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const data = (await res.json().catch(() => ({}))) as { answer?: string; error?: string };
    if (res.ok && typeof data.answer === 'string') {
      return { answer: data.answer, source: 'web' };
    }
    return {
      answer: "Namaste 🙏 Global Search is temporarily unavailable. Please use **Platform Only** mode for Art of Living related queries.",
      source: 'web',
    };
  } catch (_e) {
    return {
      answer: "Namaste 🙏 Global Search is temporarily unavailable. Please try **Platform Only** mode.",
      source: 'web',
    };
  }
}

/**
 * Get answer for a message in the given mode.
 * NEVER throws or shows raw errors to the user.
 */
export async function getAnswer(message: string, mode: ChatMode): Promise<ChatAnswer> {
  const trimmed = message.trim();
  if (!trimmed) {
    return { answer: 'Please ask a question.', source: 'platform' };
  }

  if (mode === 'platform') {
    return platformChat(trimmed);
  }

  return globalSearch(trimmed);
}
