/**
 * Explicit relevance feedback (thumbs) — localStorage only, per URL.
 */

const KEY = 'aolic-search-result-feedback';

export type FeedbackValue = 1 | -1 | 0;

function read(): Record<string, 1 | -1> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, 1 | -1>;
  } catch {
    return {};
  }
}

/** Negative = better rank (subtract from Fuse score). */
export function getFeedbackScoreAdjust(url: string): number {
  const v = read()[url];
  if (v === 1) return 0.06;
  if (v === -1) return -0.1;
  return 0;
}

export function getFeedbackForUrl(url: string): FeedbackValue {
  return read()[url] ?? 0;
}

export function setFeedbackForUrl(url: string, value: FeedbackValue): void {
  try {
    const map = read();
    if (value === 0) delete map[url];
    else map[url] = value;
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}
