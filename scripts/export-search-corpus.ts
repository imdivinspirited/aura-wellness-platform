/**
 * Writes merged site search index (static + events) to backend/data/search-corpus.json for ES reindex.
 * Run from repo root: npm run export:search-corpus
 */
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { searchIndex } from '../src/data/searchIndex';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'backend', 'data', 'search-corpus.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(
  out,
  JSON.stringify({ generatedAt: new Date().toISOString(), items: searchIndex }, null, 2),
  'utf8'
);
console.log('[export-search-corpus] wrote', out, `(${searchIndex.length} items)`);
