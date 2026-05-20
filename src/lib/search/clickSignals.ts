/**
 * Local personalization: click counts per URL (client-only, not server analytics).
 */

const KEY = 'aolic-search-click-signals';
const MAX_BOOST = 0.12;

function readMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}

export function getClickCountForUrl(url: string): number {
  return readMap()[url] ?? 0;
}

export function getClickBoostForUrl(url: string): number {
  try {
    const n = getClickCountForUrl(url);
    return Math.min(MAX_BOOST, n * 0.015);
  } catch {
    return 0;
  }
}

export function recordResultClickSignal(url: string): void {
  try {
    const map = readMap();
    map[url] = (map[url] ?? 0) + 1;
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/** Top clicked paths for "trending" hints (titles resolved by caller). */
export function getTopClickedPaths(limit = 6): { url: string; count: number }[] {
  try {
    const map = readMap();
    if (Object.keys(map).length === 0) return [];
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([url, count]) => ({ url, count }));
  } catch {
    return [];
  }
}
