const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL || 'https://api.openai.com').replace(/\/$/, '');
const OPENAI_EMBED_MODEL = process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small';
const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';

export function isOpenAiConfigured(): boolean {
  return Boolean(OPENAI_API_KEY);
}

export async function createEmbedding(text: string): Promise<number[]> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  const res = await fetch(`${OPENAI_BASE_URL}/v1/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_EMBED_MODEL,
      input: text,
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`OpenAI embeddings failed: ${res.status} ${err}`.slice(0, 500));
  }
  const json = (await res.json()) as any;
  const vec = json?.data?.[0]?.embedding;
  if (!Array.isArray(vec) || vec.length === 0) {
    throw new Error('OpenAI embeddings: invalid response');
  }
  return vec as number[];
}

export async function createChatCompletionStream(input: {
  system: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}): Promise<Response> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  const res = await fetch(`${OPENAI_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_CHAT_MODEL,
      stream: true,
      temperature: 0.2,
      messages: [
        { role: 'system', content: input.system },
        ...input.messages,
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`OpenAI chat failed: ${res.status} ${err}`.slice(0, 500));
  }
  return res;
}

export async function createChatCompletion(input: {
  system: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  const res = await fetch(`${OPENAI_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_CHAT_MODEL,
      stream: false,
      temperature: 0.2,
      messages: [
        { role: 'system', content: input.system },
        ...input.messages,
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`OpenAI chat failed: ${res.status} ${err}`.slice(0, 500));
  }
  const json = (await res.json()) as any;
  const content = json?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('OpenAI chat: invalid response');
  }
  return content;
}

