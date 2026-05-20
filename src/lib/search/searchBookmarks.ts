const KEY = 'aolic-search-bookmarked-urls';

export function getBookmarkedUrls(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function isBookmarked(url: string): boolean {
  return getBookmarkedUrls().includes(url);
}

export function toggleBookmark(url: string): boolean {
  try {
    const prev = getBookmarkedUrls();
    const has = prev.includes(url);
    const next = has ? prev.filter((u) => u !== url) : [url, ...prev].slice(0, 200);
    localStorage.setItem(KEY, JSON.stringify(next));
    return !has;
  } catch {
    return false;
  }
}

/** Small ranking boost for bookmarked URLs (subtract from score). */
export function getBookmarkScoreAdjust(url: string): number {
  return isBookmarked(url) ? 0.03 : 0;
}
