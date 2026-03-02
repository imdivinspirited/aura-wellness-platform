/**
 * AOLIC chat API — SSE streaming to Supabase Edge Function /functions/v1/chat
 * Requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
 */

const getChatUrl = () =>
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const getAnonKey = () => import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export type SearchMode = 'platform' | 'global' | 'mix';

export interface SendChatOptions {
  messages: Array<{ role: string; content: string }>;
  onChunk: (text: string) => void;
  signal?: AbortSignal;
  model?: string;
  processingMode?: string;
  searchMode?: SearchMode;
  persona?: string;
}

export async function sendAolicChatMessage({
  messages,
  onChunk,
  signal,
  model = 'openai',
  processingMode = 'fallback',
  searchMode = 'mix',
  persona = 'default',
}: SendChatOptions): Promise<void> {
  const url = getChatUrl();
  const key = getAnonKey();
  if (!url || !key) {
    throw new Error(
      'Chat is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
    );
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      messages,
      stream: true,
      model,
      processingMode,
      searchMode,
      persona,
    }),
    signal,
  });

  if (!res.ok) {
    try {
      const err = await res.json() as { error?: string };
      if (res.status === 429) throw new Error('Rate limit exceeded. Please wait a moment.');
      if (res.status === 402) throw new Error('Usage credits exhausted. Please add credits.');
      throw new Error(err.error || `Request failed (${res.status})`);
    } catch (e) {
      if (e instanceof Error) throw e;
      throw new Error(`Request failed (${res.status})`);
    }
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response stream');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
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
      if (jsonStr === '[DONE]') return;
      try {
        const parsed = JSON.parse(jsonStr) as { choices?: Array<{ delta?: { content?: string } }> };
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onChunk(content);
      } catch {
        buffer = line + '\n' + buffer;
        break;
      }
    }
  }

  if (buffer.trim()) {
    for (const raw of buffer.split('\n')) {
      const line = raw.endsWith('\r') ? raw.slice(0, -1) : raw;
      if (!line || !line.startsWith('data: ')) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(jsonStr) as { choices?: Array<{ delta?: { content?: string } }> };
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onChunk(content);
      } catch {
        // ignore
      }
    }
  }
}

export function isAolicConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return Boolean(url && key);
}
