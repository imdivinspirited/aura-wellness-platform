/**
 * Short-lived LRU for Elasticsearch search responses (reduces duplicate network work while typing nearby queries).
 */
import type { SiteSearchHit } from '@/lib/search/api/fetchSiteSearch';

type Payload = { hits: SiteSearchHit[]; mode: string; tookMs: number };

const MAX = 48;
const TTL_MS = 45_000;

const store = new Map<string, { payload: Payload; expires: number }>();

function normKey(q: string, limit: number, mode: string): string {
  return `${q.trim().toLowerCase()}\u0000${limit}\u0000${mode}`;
}

export function getRemoteSearchCache(q: string, limit: number, mode: string): Payload | null {
  const k = normKey(q, limit, mode);
  const row = store.get(k);
  if (!row) return null;
  if (Date.now() > row.expires) {
    store.delete(k);
    return null;
  }
  return row.payload;
}

export function setRemoteSearchCache(q: string, limit: number, mode: string, payload: Payload): void {
  const k = normKey(q, limit, mode);
  if (store.size >= MAX) {
    const first = store.keys().next().value as string | undefined;
    if (first !== undefined) store.delete(first);
  }
  store.set(k, { payload, expires: Date.now() + TTL_MS });
}
