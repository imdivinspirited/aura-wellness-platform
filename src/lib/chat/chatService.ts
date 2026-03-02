/**
 * Chat service — Platform Only and Global Search only (no Mix).
 * Platform: search chatbot/data/ + site index; fallback to "Answer from web" if no match.
 * Global: call backend /chat or show message if unavailable.
 */

export type ChatMode = 'platform' | 'global';

export type AnswerSource = 'platform' | 'web';

export interface ChatAnswer {
  answer: string;
  source: AnswerSource;
}

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;

if (!RAW_API_BASE && import.meta.env.DEV) {
  // Developer warning only; UI continues to function with localhost fallback.
  console.warn(
    'VITE_API_BASE_URL is not set. Falling back to http://localhost:5000 for chat requests.'
  );
}

const CHAT_API_BASE = (RAW_API_BASE && RAW_API_BASE.replace(/\/$/, '')) || 'http://localhost:5000';
const PLATFORM_ENDPOINT = '/api/v1/chat';
const GLOBAL_ENDPOINT = '/api/v1/global-chat';

async function platformChat(message: string): Promise<string> {
  try {
    const res = await fetch(`${CHAT_API_BASE}${PLATFORM_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const data = (await res.json().catch(() => ({}))) as { answer?: string; error?: string };
    if (res.ok && typeof data.answer === 'string') {
      return data.answer;
    }
    return data.answer || data.error || 'Search temporarily unavailable. Please try again.';
  } catch (_e) {
    return "I'm updating my knowledge, please try again in a moment.";
  }
}

async function globalSearch(message: string): Promise<string> {
  try {
    const res = await fetch(`${CHAT_API_BASE}${GLOBAL_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const data = (await res.json().catch(() => ({}))) as { answer?: string; error?: string };
    if (res.ok && typeof data.answer === 'string') {
      return data.answer;
    }
    return data.answer || data.error || 'Search temporarily unavailable. Please try again.';
  } catch (_e) {
    return "I'm updating my knowledge, please try again in a moment.";
  }
}

/**
 * Get answer for a message in the given mode.
 * Platform: search local + site; if no result, return fallback with source 'web'.
 * Global: call backend or return instructions.
 */
export async function getAnswer(message: string, mode: ChatMode): Promise<ChatAnswer> {
  const trimmed = message.trim();
  if (!trimmed) {
    return { answer: 'Please ask a question.', source: 'platform' };
  }

  try {
    if (mode === 'platform') {
      const answer = await platformChat(trimmed);
      return { answer, source: 'platform' };
    }

    const answer = await globalSearch(trimmed);
    return { answer, source: 'web' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Something went wrong';
    return { answer: `Error: ${msg}`, source: 'web' };
  }
}
