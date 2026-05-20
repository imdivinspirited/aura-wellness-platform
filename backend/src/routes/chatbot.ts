import { Router, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import crypto from 'crypto';
import { AuthRequest, authenticate } from '../middleware/auth';
import { ChatConversation } from '../models/ChatConversation';
import { ChatMessage } from '../models/ChatMessage';
import { ChatSettings } from '../models/ChatSettings';
import { SearchChunk } from '../models/SearchChunk';
import { MoodEntry } from '../models/MoodEntry';
import { createChatCompletion, createChatCompletionStream, createEmbedding, isOpenAiConfigured } from '../services/openai';
import { chunkText, cosineSimilarity } from '../utils/textChunking';

export const chatbotRouter = Router();

function validate(req: AuthRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, error: { message: 'Validation failed', errors: errors.array() } });
    return false;
  }
  return true;
}

function requireSessionId(req: AuthRequest, res: Response): string | null {
  const sid = String(req.query.session_id || req.body?.session_id || '').trim();
  if (!sid) {
    res.status(400).json({ success: false, error: { message: 'session_id is required' } });
    return null;
  }
  return sid;
}

async function getOrCreateConversation(input: {
  sessionId: string;
  conversationId?: string | null;
  mode: 'platform' | 'global';
  userId?: string;
  firstUserMessage?: string;
}) {
  if (input.conversationId) {
    const existing = await ChatConversation.findById(input.conversationId);
    if (existing && existing.sessionId === input.sessionId) return existing;
  }

  const title = (input.firstUserMessage || 'New conversation').slice(0, 80);
  const created = await ChatConversation.create({
    sessionId: input.sessionId,
    userId: input.userId,
    mode: input.mode,
    title,
    startedAt: new Date(),
    lastMessageAt: new Date(),
  });
  return created;
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function retrieveContext(queryText: string, language = 'en') {
  const qEmbedding = await createEmbedding(queryText);
  const words = queryText
    .toLowerCase()
    .split(/\W+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2)
    .slice(0, 14);

  const prefilter =
    words.length > 0
      ? {
          language,
          $or: words.map((w) => ({ text: { $regex: escapeRegex(w), $options: 'i' } })),
        }
      : { language };

  let chunks = await SearchChunk.find(prefilter)
    .select('docType docId chunkIndex title url text embedding updatedAt')
    .limit(4500)
    .lean();

  if (chunks.length < 12) {
    chunks = await SearchChunk.find({ language })
      .select('docType docId chunkIndex title url text embedding updatedAt')
      .limit(3500)
      .lean();
  }

  const scored = chunks
    .map((c) => ({
      ...c,
      score: cosineSimilarity(qEmbedding, (c.embedding || []) as number[]),
    }))
    .filter((x) => Number.isFinite(x.score) && x.score > 0.18)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const contextText = scored
    .map((s, idx) => `Source ${idx + 1}: ${s.title}\nURL: ${s.url}\nContent: ${s.text}`)
    .join('\n\n');

  const sources = scored.map((s) => ({
    title: s.title,
    url: s.url,
    docType: s.docType,
    docId: s.docId,
    chunkIndex: s.chunkIndex,
    score: s.score,
    updatedAt: s.updatedAt,
  }));

  return { contextText, sources };
}

/**
 * Mirrors AOL Assistant rules (see supabase/functions/platform-chat `buildSystemPrompt`).
 * Answers must use only the provided context chunks + URLs.
 */
function systemPrompt() {
  return [
    'You are AOL Assistant for The AOLIC Bangalore (Art of Living).',
    'Answer ONLY using the SOURCES block. Never invent prices, dates, programs, or URLs.',
    'Use Markdown links [title](url) from sources. Match user language (EN/HI/Hinglish) when possible.',
    'If context is insufficient, say what is missing; suggest visiting Contact or Programs on the site.',
    'Warm tone; no medical/legal advice; no competitor sites.',
  ].join('\n');
}

function buildUserPrompt(message: string, ctx: string, mood?: string) {
  return [
    mood ? `User mood context (optional): ${mood}` : '',
    '---',
    'SOURCES (authoritative):',
    ctx || '(none)',
    '---',
    `USER QUESTION: ${message}`,
  ].filter(Boolean).join('\n');
}

/**
 * POST /api/v1/chatbot/chat
 */
chatbotRouter.post(
  '/chatbot/chat',
  authenticate,
  [
    body('message').isString().trim().notEmpty(),
    body('mode').optional().isIn(['platform', 'global']),
    body('conversation_id').optional().isString(),
    body('session_id').optional().isString(),
  ],
  async (req: AuthRequest, res: Response) => {
    if (!validate(req, res)) return;
    const sessionId = requireSessionId(req, res);
    if (!sessionId) return;

    if (!isOpenAiConfigured()) {
      res.status(503).json({ success: false, error: { message: 'AI not configured. Set OPENAI_API_KEY on backend.' } });
      return;
    }

    const message = String(req.body.message).trim();
    const mode = (req.body.mode as 'platform' | 'global' | undefined) || 'platform';
    const conversationId = (req.body.conversation_id as string | null | undefined) || null;

    const conv = await getOrCreateConversation({
      sessionId,
      conversationId,
      mode,
      userId: req.userId,
      firstUserMessage: message,
    });

    const userMessageId = crypto.randomUUID();
    await ChatMessage.create({
      conversationId: conv._id,
      messageId: userMessageId,
      role: 'user',
      content: message,
    });

    const mood = req.userId
      ? await MoodEntry.findOne({ userId: req.userId }).sort({ createdAt: -1 }).lean()
      : null;

    const start = Date.now();
    const { contextText, sources } = mode === 'platform' ? await retrieveContext(message) : { contextText: '', sources: [] };
    const assistantText = await createChatCompletion({
      system: systemPrompt(),
      messages: [{ role: 'user', content: buildUserPrompt(message, contextText, mood?.mood) }],
    });

    const responseTimeMs = Date.now() - start;
    const assistantMessageId = crypto.randomUUID();
    await ChatMessage.create({
      conversationId: conv._id,
      messageId: assistantMessageId,
      role: 'assistant',
      content: assistantText,
      dataSource: mode === 'platform' ? 'website' : 'global',
      responseTimeMs,
      suggestedQuestions: [],
    });

    await ChatConversation.updateOne({ _id: conv._id }, { $set: { lastMessageAt: new Date() } });

    res.json({
      reply: assistantText,
      source: mode === 'platform' ? 'website' : 'global',
      suggested_questions: [],
      conversation_id: conv._id.toString(),
      response_time_ms: responseTimeMs,
      sources,
      message_id: assistantMessageId,
    });
    return;
  }
);

/**
 * POST /api/v1/chatbot/chat/stream
 *
 * Streams OpenAI deltas in "data: {choices:[{delta:{content}}]}" format.
 */
chatbotRouter.post(
  '/chatbot/chat/stream',
  authenticate,
  [
    body('message').isString().trim().notEmpty(),
    body('conversation_history').optional().isArray(),
    body('is_first_message').optional().isBoolean(),
    body('conversation_id').optional().isString(),
    body('mode').optional().isIn(['platform', 'global']),
    body('session_id').optional().isString(),
  ],
  async (req: AuthRequest, res: Response) => {
    if (!validate(req, res)) return;
    const sessionId = requireSessionId(req, res);
    if (!sessionId) return;

    if (!isOpenAiConfigured()) {
      res.status(503).json({ answer: 'AI not configured. Set OPENAI_API_KEY on backend.' });
      return;
    }

    const message = String(req.body.message).trim();
    const mode = (req.body.mode as 'platform' | 'global' | undefined) || 'platform';
    const conversationId = (req.body.conversation_id as string | null | undefined) || null;

    const conv = await getOrCreateConversation({
      sessionId,
      conversationId,
      mode,
      userId: req.userId,
      firstUserMessage: message,
    });

    const userMessageId = crypto.randomUUID();
    await ChatMessage.create({
      conversationId: conv._id,
      messageId: userMessageId,
      role: 'user',
      content: message,
    });

    const mood = req.userId
      ? await MoodEntry.findOne({ userId: req.userId }).sort({ createdAt: -1 }).lean()
      : null;

    const { contextText } = mode === 'platform' ? await retrieveContext(message) : { contextText: '' };

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    const start = Date.now();
    let assistantSoFar = '';
    const assistantMessageId = crypto.randomUUID();

    try {
      const upstream = await createChatCompletionStream({
        system: systemPrompt(),
        messages: [{ role: 'user', content: buildUserPrompt(message, contextText, mood?.mood) }],
      });

      if (!upstream.body) {
        res.write(`data: ${JSON.stringify({ error: 'Streaming not available' })}\n\n`);
        res.write(`data: [DONE]\n\n`);
        res.end();
        return;
      }

      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, idx).trimEnd();
          buffer = buffer.slice(idx + 1);
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (payload === '[DONE]') continue;
          try {
            const parsed = JSON.parse(payload);
            const delta = parsed?.choices?.[0]?.delta?.content;
            if (typeof delta === 'string' && delta) {
              assistantSoFar += delta;
              res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: delta } }] })}\n\n`);
            }
          } catch {
            // ignore partial
          }
        }
      }

      const responseTimeMs = Date.now() - start;
      await ChatMessage.create({
        conversationId: conv._id,
        messageId: assistantMessageId,
        role: 'assistant',
        content: assistantSoFar,
        dataSource: mode === 'platform' ? 'website' : 'global',
        responseTimeMs,
        suggestedQuestions: [],
      });
      await ChatConversation.updateOne({ _id: conv._id }, { $set: { lastMessageAt: new Date() } });

      res.write(`data: [DONE]\n\n`);
      res.end();
      return;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Chat failed';
      res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();
      return;
    }
  }
);

/**
 * GET /api/v1/chatbot/settings?session_id=
 */
chatbotRouter.get('/chatbot/settings', [query('session_id').isString().trim().notEmpty()], async (req: AuthRequest, res: Response) => {
  if (!validate(req, res)) return;
  const sessionId = String(req.query.session_id).trim();
  const doc = await ChatSettings.findOne({ sessionId }).lean();
  res.json({ preferences: doc?.preferences || {} });
  return;
});

/**
 * POST /api/v1/chatbot/settings
 */
chatbotRouter.post(
  '/chatbot/settings',
  [body('session_id').isString().trim().notEmpty(), body('preferences').isObject()],
  async (req: AuthRequest, res: Response) => {
    if (!validate(req, res)) return;
    const { session_id, preferences } = req.body as { session_id: string; preferences: Record<string, unknown> };
    await ChatSettings.findOneAndUpdate({ sessionId: session_id }, { $set: { preferences } }, { upsert: true });
    res.json({ success: true });
    return;
  }
);

/**
 * GET /api/v1/chatbot/history?session_id=&limit=&offset=&search=
 */
chatbotRouter.get(
  '/chatbot/history',
  [
    query('session_id').isString().trim().notEmpty(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0, max: 10000 }),
    query('search').optional().isString().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    if (!validate(req, res)) return;
    const sessionId = String(req.query.session_id).trim();
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    const search = String(req.query.search || '').trim();

    const filter: any = { sessionId };
    if (search) filter.title = { $regex: search, $options: 'i' };

    const conversations = await ChatConversation.find(filter)
      .sort({ lastMessageAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    const out = await Promise.all(
      conversations.map(async (c) => {
        const count = await ChatMessage.countDocuments({ conversationId: c._id });
        return {
          id: c._id.toString(),
          started_at: c.startedAt.toISOString(),
          title: c.title,
          message_count: count,
          mode: c.mode,
        };
      })
    );

    res.json({ conversations: out });
    return;
  }
);

/**
 * GET /api/v1/chatbot/history/:id?session_id=
 */
chatbotRouter.get(
  '/chatbot/history/:id',
  [param('id').isString().trim().notEmpty(), query('session_id').isString().trim().notEmpty()],
  async (req: AuthRequest, res: Response) => {
    if (!validate(req, res)) return;
    const sessionId = String(req.query.session_id).trim();
    const conv = await ChatConversation.findById(req.params.id).lean();
    if (!conv || conv.sessionId !== sessionId) {
      res.status(404).json({ messages: [] });
      return;
    }
    const messages = await ChatMessage.find({ conversationId: conv._id }).sort({ createdAt: 1 }).lean();
    res.json({
      messages: messages.map((m) => ({
        id: m.messageId,
        role: m.role,
        content: m.content,
        created_at: m.createdAt.toISOString(),
        data_source: m.dataSource,
      })),
    });
    return;
  }
);

/**
 * DELETE /api/v1/chatbot/history/:id?session_id=
 */
chatbotRouter.delete(
  '/chatbot/history/:id',
  [param('id').isString().trim().notEmpty(), query('session_id').isString().trim().notEmpty()],
  async (req: AuthRequest, res: Response) => {
    if (!validate(req, res)) return;
    const sessionId = String(req.query.session_id).trim();
    const conv = await ChatConversation.findById(req.params.id);
    if (!conv || conv.sessionId !== sessionId) {
      res.json({ success: true });
      return;
    }
    await ChatMessage.deleteMany({ conversationId: conv._id });
    await ChatConversation.deleteOne({ _id: conv._id });
    res.json({ success: true });
    return;
  }
);

/**
 * DELETE /api/v1/chatbot/history/all?session_id=
 */
chatbotRouter.delete('/chatbot/history/all', [query('session_id').isString().trim().notEmpty()], async (req: AuthRequest, res: Response) => {
  if (!validate(req, res)) return;
  const sessionId = String(req.query.session_id).trim();
  const convs = await ChatConversation.find({ sessionId }).select('_id').lean();
  const ids = convs.map((c) => c._id);
  await ChatMessage.deleteMany({ conversationId: { $in: ids } });
  await ChatConversation.deleteMany({ sessionId });
  res.json({ success: true });
  return;
});

/**
 * POST /api/v1/chatbot/feedback
 */
chatbotRouter.post(
  '/chatbot/feedback',
  [body('message_id').isString().trim().notEmpty(), body('rating').isIn([1, -1])],
  async (req: AuthRequest, res: Response) => {
    if (!validate(req, res)) return;
    const { message_id, rating } = req.body as { message_id: string; rating: 1 | -1 };
    await ChatMessage.updateOne({ messageId: message_id }, { $set: { rating } });
    res.json({ success: true });
    return;
  }
);

/**
 * GET /api/v1/chatbot/analytics?session_id=
 */
chatbotRouter.get('/chatbot/analytics', [query('session_id').isString().trim().notEmpty()], async (req: AuthRequest, res: Response) => {
  if (!validate(req, res)) return;
  const sessionId = String(req.query.session_id).trim();
  const conversations = await ChatConversation.find({ sessionId }).lean();
  const convIds = conversations.map((c) => c._id);
  const messages = await ChatMessage.find({ conversationId: { $in: convIds } }).lean();

  const sent = messages.filter((m) => m.role === 'user').length;
  const received = messages.filter((m) => m.role === 'assistant').length;
  const rt = messages.filter((m) => typeof m.responseTimeMs === 'number').map((m) => m.responseTimeMs as number);
  const avg = rt.length ? Math.round(rt.reduce((a, b) => a + b, 0) / rt.length) : 0;
  const last = conversations.sort((a, b) => +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt))[0]?.lastMessageAt || null;

  res.json({
    overview: {
      total_conversations: conversations.length,
      messages_sent: sent,
      messages_received: received,
      avg_response_time_ms: avg,
      active_days_streak: 0,
      last_active: last ? new Date(last).toISOString() : null,
      top_topics: [],
    },
    daily_conversations: [],
    messages_per_day: [],
    mode_usage: {
      platform: conversations.filter((c) => c.mode === 'platform').length,
      global: conversations.filter((c) => c.mode === 'global').length,
    },
    top_categories: [],
    recent_conversations: conversations
      .sort((a, b) => +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt))
      .slice(0, 10)
      .map((c) => ({
        id: c._id.toString(),
        date: new Date(c.startedAt).toISOString(),
        first_message: c.title,
        messages: messages.filter((m) => String(m.conversationId) === String(c._id)).length,
        mode: c.mode,
        duration: '',
      })),
  });
  return;
});

/**
 * Internal helper for reindex (used by admin route).
 */
export async function rebuildSearchIndexFromDocs(docs: Array<{ docType: string; docId: string; title: string; url: string; language: string; text: string }>) {
  await SearchChunk.deleteMany({});
  const rows: any[] = [];
  for (const d of docs) {
    const chunks = chunkText(d.text);
    for (let i = 0; i < chunks.length; i++) {
      const emb = await createEmbedding(chunks[i]);
      rows.push({
        docType: d.docType,
        docId: d.docId,
        chunkIndex: i,
        title: d.title,
        url: d.url,
        language: d.language || 'en',
        text: chunks[i],
        embedding: emb,
      });
    }
  }
  if (rows.length) {
    await SearchChunk.insertMany(rows, { ordered: false });
  }
  return { chunks: rows.length };
}

