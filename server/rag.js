import { OpenAI } from 'openai';
import { supabase } from './supabaseClient.js';

const WEBSITE_URL = process.env.WEBSITE_URL || 'https://www.artofliving.org';

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function embedText(text) {
  const client = getOpenAI();
  const input = text.length > 8000 ? text.slice(0, 8000) : text;
  const res = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input,
  });
  return res.data[0].embedding;
}

export async function upsertPage({ url, content }) {
  if (!supabase) return;
  const embedding = await embedText(content);
  await supabase.from('aol_documents').upsert(
    {
      url,
      content,
      embedding,
    },
    { onConflict: 'url' }
  );
}

export async function queryContext(query, { matchCount = 8, similarityThreshold = 0.75 } = {}) {
  if (!supabase) {
    return [];
  }
  const queryEmbedding = await embedText(query);
  const { data, error } = await supabase.rpc('match_aol_documents', {
    query_embedding: queryEmbedding,
    match_count: matchCount,
    similarity_threshold: similarityThreshold,
  });
  if (error) {
    console.error('[rag] match_aol_documents error', error);
    return [];
  }
  return data || [];
}

export async function answerWithContext(query) {
  const client = getOpenAI();
  const chunks = await queryContext(query);
  if (!chunks.length) {
    return {
      answer:
        'Namaste 🙏 I could not find relevant information for this query in the website content. Please try Global Search or contact the Art of Living team directly.',
      source: 'fallback',
      context: [],
    };
  }

  const contextText = chunks
    .map((c) => `URL: ${c.url}\nCONTENT:\n${c.content}`)
    .join('\n\n---\n\n')
    .slice(0, 12000);

  const systemPrompt = [
    'You are the official AOL Assistant for the Art of Living website.',
    'Answer ONLY using the website context provided.',
    'If the context is insufficient, clearly say so and invite the user to contact the Art of Living team.',
    'Never invent programs, prices or schedules that are not in the context.',
    'Use Markdown formatting (bold, lists, tables, arrows).',
  ].join(' ');

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Website base URL: ${WEBSITE_URL}\n\nContext:\n${contextText}\n\nUser question: ${query}`,
      },
    ],
    max_tokens: 800,
  });

  const answer = completion.choices?.[0]?.message?.content?.trim() || '';
  return {
    answer:
      answer ||
      'Namaste 🙏 I could not generate an answer from the website context. Please rephrase your question or try Global Search.',
    source: 'website',
    context: chunks,
  };
}

