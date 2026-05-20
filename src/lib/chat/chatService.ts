/**
 * Chat service — Platform (streaming RAG) via Supabase Edge Function.
 * Routes directly through the edge function for real-time, vector-powered responses.
 */

export type ChatMode = 'platform';
export type AnswerSource = 'platform' | 'website';

export interface ChatAnswer {
  answer: string;
  source: AnswerSource;
  suggested_questions?: string[];
}

/** First SSE frame from platform-chat: retrieved sources for citations. */
export interface ChatStreamMeta {
  sources: Array<{ title: string; url?: string | null }>;
}

// Build edge function URL from env
function getEdgeFunctionUrl(functionName: string): string {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  if (projectId) {
    return `https://${projectId}.supabase.co/functions/v1/${functionName}`;
  }
  // Fallback to VITE_SUPABASE_URL
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl) {
    return `${supabaseUrl}/functions/v1/${functionName}`;
  }
  throw new Error('Supabase URL not configured');
}

/**
 * Platform chat with SSE streaming — calls edge function powered by hybrid RAG + Vector search.
 */
export async function streamPlatformChat({
  message,
  conversationHistory,
  isFirstMessage,
  onDelta,
  onMeta,
  onDone,
  onError,
  signal,
}: {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  isFirstMessage?: boolean;
  onDelta: (text: string) => void;
  onMeta?: (meta: ChatStreamMeta) => void;
  onDone: () => void;
  onError: (error: string) => void;
  signal?: AbortSignal;
}): Promise<void> {
  try {
    const url = getEdgeFunctionUrl('platform-chat');
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey || '',
        'Authorization': `Bearer ${anonKey || ''}`,
      },
      body: JSON.stringify({
        message,
        conversation_history: conversationHistory || [],
        is_first_message: isFirstMessage ?? false,
      }),
      signal,
    });

    if (!resp.ok) {
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

    // JSON fallback
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
          const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
          if (parsed.meta && typeof parsed.meta === 'object' && parsed.meta !== null && 'sources' in parsed.meta) {
            onMeta?.(parsed.meta as ChatStreamMeta);
            continue;
          }
          const content = (parsed as { choices?: Array<{ delta?: { content?: string } }> }).choices?.[0]?.delta
            ?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
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
          const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
          if (parsed.meta && typeof parsed.meta === 'object' && parsed.meta !== null && 'sources' in parsed.meta) {
            onMeta?.(parsed.meta as ChatStreamMeta);
            continue;
          }
          const content = (parsed as { choices?: Array<{ delta?: { content?: string } }> }).choices?.[0]?.delta
            ?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }

    onDone();
  } catch (e) {
    if (signal?.aborted) {
      onDone();
      return;
    }
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
    const url = getEdgeFunctionUrl('platform-chat');
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey || '',
        'Authorization': `Bearer ${anonKey || ''}`,
      },
      body: JSON.stringify({ message }),
    });
    const data = (await res.json().catch(() => ({}))) as any;
    if (res.ok && typeof data.answer === 'string') {
      return { answer: data.answer, source: 'website', suggested_questions: data.suggested_questions };
    }
    return { answer: data?.error?.message || 'Chat unavailable.', source: 'platform' };
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
 * Get answer — non-streaming.
 */
export async function getAnswer(message: string, _mode: ChatMode): Promise<ChatAnswer> {
  const trimmed = message.trim();
  if (!trimmed) return { answer: 'Please ask a question.', source: 'platform' };
  return platformChat(trimmed);
}
