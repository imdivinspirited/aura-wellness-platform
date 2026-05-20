/**
 * Site search: Elasticsearch BM25 + Mongo click boosts + optional OpenAI semantic rerank (hybrid).
 */
import { getElasticsearchIndex, isSearchSemanticEnabled } from '../config.js';
import { getElasticsearchClient } from './elasticsearchClient.js';
import { getClickCountsByDocIds } from '../lib/siteSearchClicksRepo.js';

/** @param {number[]} a @param {number[]} b */
function cosineSimilarity(a, b) {
  if (!a?.length || a.length !== b?.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d === 0 ? 0 : dot / d;
}

/**
 * @param {string[]} texts
 * @param {string} apiKey
 * @returns {Promise<number[][]>}
 */
async function openaiEmbeddings(texts, apiKey) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: texts,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText || 'OpenAI embeddings failed';
    throw new Error(msg);
  }
  const list = Array.isArray(data?.data) ? data.data : [];
  list.sort((x, y) => (x.index ?? 0) - (y.index ?? 0));
  return list.map((x) => x.embedding).filter((e) => Array.isArray(e));
}

/**
 * @param {string} q
 * @param {Array<{ id: string; title: string; description: string; _bm25?: number; clicks?: number }>} hits
 */
async function semanticRerankHybrid(q, hits) {
  const apiKey = (process.env.OPENAI_API_KEY || '').trim();
  if (!apiKey || hits.length === 0) return hits;

  const texts = hits.map((h) => {
    const t = `${h.title}\n${(h.description || '').slice(0, 800)}`;
    return t.slice(0, 8000);
  });
  const inputs = [q, ...texts];
  const vectors = await openaiEmbeddings(inputs, apiKey);
  if (vectors.length !== inputs.length) {
    return hits;
  }
  const qv = vectors[0];
  const docVecs = vectors.slice(1);

  const maxBm25 = Math.max(1e-6, ...hits.map((h) => h._bm25 ?? 0));
  const maxClicks = Math.max(0, ...hits.map((h) => h.clicks ?? 0));

  const scored = hits.map((h, i) => {
    const cos = cosineSimilarity(qv, docVecs[i] || []);
    const bm25n = (h._bm25 ?? 0) / maxBm25;
    const clickN = maxClicks > 0 ? Math.log1p(h.clicks ?? 0) / Math.log1p(maxClicks + 1) : 0;
    const combined = 0.42 * bm25n + 0.43 * cos + 0.15 * clickN;
    return { ...h, _score: combined, _cosine: cos };
  });
  scored.sort((a, b) => (b._score ?? 0) - (a._score ?? 0));
  return scored;
}

function mapEsHit(hit) {
  const s = hit._source || {};
  return {
    id: String(s.id ?? hit._id ?? ''),
    title: String(s.title ?? ''),
    description: String(s.description ?? ''),
    category: String(s.category ?? ''),
    tags: Array.isArray(s.tags) ? s.tags.map(String) : [],
    url: String(s.url ?? ''),
    image: s.image != null ? String(s.image) : undefined,
    _bm25: typeof hit._score === 'number' ? hit._score : 0,
  };
}

/**
 * @param {string} q
 * @param {{ limit?: number; mode?: 'bm25' | 'hybrid' }} opts
 */
export async function searchSite(q, opts = {}) {
  const limit = Math.min(100, Math.max(1, Number(opts.limit) || 24));
  const mode = opts.mode === 'hybrid' ? 'hybrid' : 'bm25';
  const client = getElasticsearchClient();
  if (!client) {
    const err = new Error('Elasticsearch is not configured (set ELASTICSEARCH_URL).');
    err.code = 'SEARCH_UNAVAILABLE';
    throw err;
  }

  const trimmed = String(q || '').trim();
  if (!trimmed) {
    return { hits: [], tookMs: 0, mode };
  }

  const index = getElasticsearchIndex();
  const esSize = mode === 'hybrid' ? Math.min(80, Math.max(limit * 2, 40)) : limit;

  const t0 = Date.now();
  const esRes = await client.search({
    index,
    size: esSize,
    query: {
      bool: {
        should: [
          {
            multi_match: {
              query: trimmed,
              fields: ['title^3', 'description', 'tags^1.5', 'category'],
              type: 'best_fields',
              fuzziness: 'AUTO',
              operator: 'or',
            },
          },
        ],
        minimum_should_match: 1,
      },
    },
  });

  const rawHits = (esRes.hits?.hits || []).map(mapEsHit);
  const ids = rawHits.map((h) => h.id).filter(Boolean);
  let clickMap = new Map();
  try {
    clickMap = await getClickCountsByDocIds(ids);
  } catch {
    /* Mongo optional for read path */
  }

  let hits = rawHits.map((h) => ({
    ...h,
    clicks: clickMap.get(h.id) ?? 0,
  }));

  const maxBm25 = Math.max(1e-6, ...hits.map((h) => h._bm25 ?? 0));

  hits.sort((a, b) => {
    const boostA = (a._bm25 / maxBm25) * (1 + 0.15 * Math.log1p(a.clicks));
    const boostB = (b._bm25 / maxBm25) * (1 + 0.15 * Math.log1p(b.clicks));
    return boostB - boostA;
  });

  const semanticOk = mode === 'hybrid' && isSearchSemanticEnabled();
  if (semanticOk && hits.length > 0) {
    try {
      hits = await semanticRerankHybrid(trimmed, hits.slice(0, 48));
    } catch (e) {
      console.warn('[siteSearch] semantic rerank skipped:', e?.message || e);
    }
  }

  const strip = hits.slice(0, limit).map(({ _bm25, _score, _cosine, clicks: _c, ...rest }) => ({
    ...rest,
    score: typeof _score === 'number' ? _score : undefined,
  }));

  return {
    hits: strip,
    tookMs: Date.now() - t0,
    mode: semanticOk ? 'hybrid' : mode,
  };
}

/**
 * @param {Array<{ id: string; title: string; description: string; category: string; tags: string[]; url: string; image?: string }>} docs
 */
export async function bulkIndexSiteDocuments(docs) {
  const client = getElasticsearchClient();
  if (!client) {
    const err = new Error('Elasticsearch is not configured.');
    err.code = 'SEARCH_UNAVAILABLE';
    throw err;
  }
  const index = getElasticsearchIndex();

  const existsResp = await client.indices.exists({ index });
  const exists = Boolean(existsResp);
  if (!exists) {
    await client.indices.create({
      index,
      mappings: {
        properties: {
          id: { type: 'keyword' },
          title: { type: 'text', analyzer: 'english' },
          description: { type: 'text', analyzer: 'english' },
          category: { type: 'text', analyzer: 'english', fields: { raw: { type: 'keyword' } } },
          tags: { type: 'text', analyzer: 'english' },
          url: { type: 'keyword' },
          image: { type: 'keyword' },
        },
      },
    });
  }

  const operations = [];
  for (const d of docs) {
    const id = String(d.id || '').trim();
    if (!id) continue;
    operations.push({ index: { _index: index, _id: id } });
    operations.push({
      id,
      title: d.title || '',
      description: d.description || '',
      category: d.category || '',
      tags: Array.isArray(d.tags) ? d.tags : [],
      url: d.url || '',
      image: d.image || '',
    });
  }

  if (!operations.length) {
    return { indexed: 0 };
  }

  const bulkRes = await client.bulk({ refresh: true, operations });
  if (bulkRes.errors) {
    const first = bulkRes.items?.find((i) => i.index?.error);
    const msg = first?.index?.error?.reason || 'bulk index had errors';
    throw new Error(msg);
  }
  return { indexed: operations.length / 2 };
}
