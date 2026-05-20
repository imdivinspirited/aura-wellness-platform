/**
 * Lightweight client-side search analytics (popular queries, zero-result counts).
 */

const POP_KEY = 'aolic-search-popular-queries';
const ZERO_KEY = 'aolic-search-zero-queries';

function norm(q: string): string {
  return q.trim().toLowerCase();
}

/** Call after each completed search (debounced). */
export function recordSearchOutcome(query: string, resultCount: number): void {
  const q = norm(query);
  if (q.length < 2) return;
  try {
    if (resultCount === 0) {
      const raw = localStorage.getItem(ZERO_KEY);
      const map: Record<string, number> = raw ? JSON.parse(raw) : {};
      map[q] = (map[q] ?? 0) + 1;
      localStorage.setItem(ZERO_KEY, JSON.stringify(map));
    } else {
      const raw = localStorage.getItem(POP_KEY);
      const map: Record<string, number> = raw ? JSON.parse(raw) : {};
      map[q] = (map[q] ?? 0) + 1;
      localStorage.setItem(POP_KEY, JSON.stringify(map));
    }
  } catch {
    /* ignore */
  }
}

export function getPopularQueries(limit = 8): { query: string; count: number }[] {
  try {
    const raw = localStorage.getItem(POP_KEY);
    if (!raw) return [];
    const map = JSON.parse(raw) as Record<string, number>;
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));
  } catch {
    return [];
  }
}

export function getZeroResultQueries(limit = 12): { query: string; count: number }[] {
  try {
    const raw = localStorage.getItem(ZERO_KEY);
    if (!raw) return [];
    const map = JSON.parse(raw) as Record<string, number>;
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));
  } catch {
    return [];
  }
}

/** Rough CTR: result clicks / recorded searches with results (local heuristic). */
export function getApproximateCtr(): number {
  try {
    const popRaw = localStorage.getItem(POP_KEY);
    const clickRaw = localStorage.getItem('aolic-search-click-signals');
    if (!popRaw || !clickRaw) return 0;
    const pop = JSON.parse(popRaw) as Record<string, number>;
    const clicks = JSON.parse(clickRaw) as Record<string, number>;
    const searches = Object.values(pop).reduce((a, b) => a + b, 0);
    const totalClicks = Object.values(clicks).reduce((a, b) => a + b, 0);
    if (searches <= 0) return 0;
    return Math.min(1, totalClicks / (searches + 1));
  } catch {
    return 0;
  }
}

/** Sum of all recorded search events (with + without results). */
export function getTotalRecordedSearchEvents(): number {
  try {
    let n = 0;
    for (const raw of [localStorage.getItem(POP_KEY), localStorage.getItem(ZERO_KEY)]) {
      if (!raw) continue;
      const map = JSON.parse(raw) as Record<string, number>;
      n += Object.values(map).reduce((a, b) => a + b, 0);
    }
    return n;
  } catch {
    return 0;
  }
}
