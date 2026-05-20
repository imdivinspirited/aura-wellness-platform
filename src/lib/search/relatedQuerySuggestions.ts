import type { SearchIndexItem } from '@/data/searchIndex';

/** Suggested follow-up queries from tags (e.g. tag:yoga, category:Course). */
export function buildRelatedQuerySuggestions(top: SearchIndexItem | undefined, limit = 5): string[] {
  if (!top?.tags?.length) return [];
  const out: string[] = [];
  for (const t of top.tags) {
    if (t.length < 3) continue;
    out.push(`tag:${t}`);
    if (out.length >= limit) break;
  }
  if (top.category && out.length < limit) {
    out.push(`category:${top.category}`);
  }
  return [...new Set(out)].slice(0, limit);
}
