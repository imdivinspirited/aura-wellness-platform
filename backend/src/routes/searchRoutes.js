/**
 * Public site search API — Elasticsearch + click-boosted ranking + optional hybrid (OpenAI) rerank.
 * POST /api/v1/search/query
 * POST /api/v1/search/click
 * GET  /api/v1/search/health
 */
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { rateLimitClientKey } from '../lib/rateLimitClientKey.js';
import { isMongoReady } from '../db.js';
import { pingElasticsearch } from '../services/elasticsearchClient.js';
import { getElasticsearchUrl } from '../config.js';
import { searchSite } from '../services/siteSearchService.js';
import { incrementSiteSearchClick } from '../lib/siteSearchClicksRepo.js';

const router = Router();

const WINDOW_MS = parseInt(process.env.SEARCH_RATE_LIMIT_WINDOW_MS || '60000', 10);
const MAX = parseInt(process.env.SEARCH_RATE_LIMIT_MAX || '40', 10);
const CLICK_MAX = parseInt(process.env.SEARCH_CLICK_RATE_LIMIT_MAX || '120', 10);

const searchIpLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX,
  keyGenerator: rateLimitClientKey,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Too many search requests from this IP. Try again shortly.' },
  },
});

const searchClickIpLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: CLICK_MAX,
  keyGenerator: rateLimitClientKey,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Too many requests from this IP.' },
  },
});

router.get('/health', async (_req, res) => {
  const url = getElasticsearchUrl();
  const ping = await pingElasticsearch();
  return res.json({
    success: true,
    data: {
      elasticsearchConfigured: Boolean(url),
      elasticsearchOk: ping.ok,
      elasticsearchDetail: ping.reason || null,
      mongoReady: isMongoReady(),
    },
  });
});

router.post('/query', searchIpLimiter, async (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const q = typeof body.q === 'string' ? body.q : typeof body.query === 'string' ? body.query : '';
    const limit = body.limit != null ? Number(body.limit) : 24;
    const mode = body.mode === 'hybrid' ? 'hybrid' : 'bm25';
    const out = await searchSite(q, { limit, mode });
    return res.json({ success: true, data: out });
  } catch (e) {
    const code = e?.code || 'SEARCH_ERROR';
    if (code === 'SEARCH_UNAVAILABLE') {
      return res.status(503).json({
        success: false,
        error: {
          code,
          message: e.message || 'Search is not configured. Set ELASTICSEARCH_URL and run the reindex script.',
        },
      });
    }
    console.error('[search/query]', e);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL', message: e?.message || 'Search failed.' },
    });
  }
});

router.post('/click', searchClickIpLimiter, async (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const docId = typeof body.docId === 'string' ? body.docId.trim() : '';
    if (!docId) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing docId.' } });
    }
    if (!isMongoReady()) {
      return res.status(503).json({
        success: false,
        error: { code: 'MONGO_UNAVAILABLE', message: 'Click tracking requires MongoDB.' },
      });
    }
    await incrementSiteSearchClick(docId);
    return res.json({ success: true, data: { ok: true } });
  } catch (e) {
    console.error('[search/click]', e);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL', message: e?.message || 'Failed to record click.' },
    });
  }
});

export default router;
