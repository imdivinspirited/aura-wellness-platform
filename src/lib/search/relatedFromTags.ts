import type { SearchIndexItem } from '@/data/searchIndex';

/** Related items: shared tags with top result, excluding already shown URLs. */
export function getRelatedResults(
  top: SearchIndexItem | undefined,
  pool: SearchIndexItem[],
  excludeUrls: Set<string>,
  limit = 4,
): SearchIndexItem[] {
  if (!top?.tags?.length) return [];
  const tagSet = new Set(top.tags.map((t) => t.toLowerCase()));
  const scored: { item: SearchIndexItem; score: number }[] = [];
  for (const item of pool) {
    if (excludeUrls.has(item.url) || item.id === top.id) continue;
    let overlap = 0;
    for (const t of item.tags) {
      if (tagSet.has(t.toLowerCase())) overlap += 1;
    }
    if (overlap > 0) scored.push({ item, score: overlap });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
}
