import type { SearchIndexItem } from '@/data/searchIndex';

/**
 * As-you-type suggestions from index titles + tags (prefix / contains).
 */

export function buildSuggestionPool(items: SearchIndexItem[]): string[] {
  const set = new Set<string>();
  for (const it of items) {
    set.add(it.title);
    for (const tag of it.tags) {
      if (tag.length > 2) set.add(tag);
    }
  }
  return [...set];
}

export function filterSuggestions(pool: string[], partial: string, limit = 8): string[] {
  const p = partial.trim().toLowerCase();
  if (p.length < 1) return [];

  const starts: string[] = [];
  const contains: string[] = [];
  for (const s of pool) {
    const sl = s.toLowerCase();
    if (sl.startsWith(p)) starts.push(s);
    else if (sl.includes(p)) contains.push(s);
  }
  starts.sort((a, b) => a.length - b.length);
  contains.sort((a, b) => a.length - b.length);
  return [...starts, ...contains].slice(0, limit);
}
