/**
 * Server-side site search (Elasticsearch + ranking). Used when VITE_SITE_SEARCH_SERVER is enabled.
 */
import { getApiBaseUrl } from '@/lib/api/client';

export type SiteSearchHit = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  url: string;
  image?: string;
  score?: number;
};

export async function fetchSiteSearch(
  q: string,
  opts?: { mode?: 'bm25' | 'hybrid'; limit?: number; signal?: AbortSignal }
): Promise<{ hits: SiteSearchHit[]; mode: string; tookMs: number }> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/search/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    signal: opts?.signal,
    body: JSON.stringify({
      q: q.trim(),
      limit: opts?.limit ?? 48,
      mode: opts?.mode ?? 'hybrid',
    }),
  });
  const json: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      json && typeof json === 'object' && 'error' in json && json.error && typeof json.error === 'object'
        ? String((json.error as { message?: string }).message || 'Search failed')
        : 'Search request failed';
    throw new Error(msg);
  }
  const o = json as { data?: { hits?: SiteSearchHit[]; mode?: string; tookMs?: number } };
  const data = o.data;
  if (!data?.hits || !Array.isArray(data.hits)) {
    throw new Error('Invalid search response');
  }
  return {
    hits: data.hits,
    mode: data.mode ?? 'bm25',
    tookMs: data.tookMs ?? 0,
  };
}

/** Fire-and-forget: record result click for learning-to-rank-style boosts (Mongo). */
export function reportServerSearchClick(docId: string | undefined): void {
  const on =
    import.meta.env.VITE_SITE_SEARCH_SERVER === 'true' || import.meta.env.VITE_SITE_SEARCH_SERVER === '1';
  if (!on || !docId) return;
  const base = getApiBaseUrl();
  void fetch(`${base}/search/click`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ docId }),
  }).catch(() => {});
}
