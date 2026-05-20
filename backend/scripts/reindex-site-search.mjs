/**
 * Bulk-index site search corpus into Elasticsearch.
 * Usage: from backend/, `npm run reindex:search`
 * Requires: ELASTICSEARCH_URL, corpus at backend/data/search-corpus.json
 * Generate corpus from repo root: `npm run export:search-corpus`
 */
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import '../src/bootstrap.js';
import { bulkIndexSiteDocuments } from '../src/services/siteSearchService.js';
import { getElasticsearchUrl } from '../src/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const corpusPath = path.join(__dirname, '..', 'data', 'search-corpus.json');

async function main() {
  if (!getElasticsearchUrl()) {
    console.error('[reindex] Set ELASTICSEARCH_URL in backend/.env (e.g. http://127.0.0.1:9200)');
    process.exit(1);
  }
  if (!existsSync(corpusPath)) {
    console.error('[reindex] Missing', corpusPath, '— run from repo root: npm run export:search-corpus');
    process.exit(1);
  }
  const raw = JSON.parse(readFileSync(corpusPath, 'utf8'));
  const items = Array.isArray(raw.items) ? raw.items : Array.isArray(raw) ? raw : [];
  if (!items.length) {
    console.error('[reindex] Corpus has no items.');
    process.exit(1);
  }
  const out = await bulkIndexSiteDocuments(items);
  console.log('[reindex] done:', out);
}

main().catch((e) => {
  console.error('[reindex] failed:', e?.message || e);
  process.exit(1);
});
