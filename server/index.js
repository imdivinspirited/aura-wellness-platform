import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { supabase } from './supabaseClient.js';
import { crawlAndIndex } from './crawler.js';
import { answerWithContext } from './rag.js';
import { askGlobalLLM } from './llm.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: true,
    credentials: false,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Platform mode — answers based on website content stored in Supabase vectors
app.post('/api/v1/chat', async (req, res) => {
  try {
    const { message } = req.body || {};
    const text = typeof message === 'string' ? message.trim() : '';
    if (!text) {
      return res.status(400).json({ error: 'Message is required' });
    }
    if (!supabase) {
      return res.status(503).json({
        error: 'Platform mode is not configured (Supabase URL / service role key missing).',
      });
    }
    const result = await answerWithContext(text);
    return res.json({
      answer: result.answer,
      source: result.source,
      chunks: result.context?.map((c) => ({ url: c.url, similarity: c.similarity })) ?? [],
    });
  } catch (err) {
    console.error('[platform-chat] error', err);
    return res.status(500).json({
      error: 'Platform chat failed. Please try again or use Global Search.',
    });
  }
});

// Global mode — multi-provider AI with fallbacks (OpenAI → Gemini → Anthropic)
app.post('/api/v1/global-chat', async (req, res) => {
  try {
    const { message } = req.body || {};
    const text = typeof message === 'string' ? message.trim() : '';
    if (!text) {
      return res.status(400).json({ error: 'Message is required' });
    }
    const { answer, provider } = await askGlobalLLM(text);
    return res.json({ answer, source: 'global', provider });
  } catch (err) {
    console.error('[global-chat] error', err);
    return res.status(500).json({
      error: 'Global chat failed. Please try again later.',
    });
  }
});

// Kick off initial crawl + index on startup
async function startCrawler() {
  if (!supabase) {
    console.warn('[crawler] Supabase is not configured, skipping crawl.');
    return;
  }
  try {
    await crawlAndIndex();
  } catch (err) {
    console.error('[crawler] initial crawl failed', err);
  }
}

// Re-index every 24 hours
cron.schedule('0 3 * * *', () => {
  console.log('[cron] Starting scheduled crawl and index.');
  startCrawler().catch((err) => console.error('[cron] crawl failed', err));
});

app.listen(PORT, () => {
  console.log(`AOL Chat server running at http://localhost:${PORT}`);
  startCrawler().catch((err) => console.error('[startup] crawl failed', err));
});

