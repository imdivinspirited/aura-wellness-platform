/**
 * Client-side advanced query layer (Fuse pre/post processing).
 * Covers: phrase quotes, exclude (-term), category:/tag:/title:/url: filters,
 * OR branches, trailing wildcards (*), synonym expansion, typo correction,
 * domain intent boosting (keyword buckets).
 * Server-only features (embeddings, LLM, BM25 cluster, Redis, etc.) are out of scope.
 */

import type { SearchIndexItem } from '@/data/searchIndex';

export type ParsedAdvancedQuery = {
  /** Joined segments for highlighting / display */
  fuseText: string;
  /** Typo-expanded fuse text per OR branch; empty entries mean “filter-only” for that branch */
  orFuseSegments: string[];
  requiredPhrases: string[];
  excludeTerms: string[];
  categoryHint?: string;
  tagHints: string[];
  titleHint?: string;
  urlHint?: string;
  correctionsApplied: string[];
};

const STOPWORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'for',
  'to',
  'of',
  'in',
  'on',
  'at',
]);

/** Word → canonical replacement (typo / normalization). */
export const COMMON_TYPOS: Record<string, string> = {
  meditaton: 'meditation',
  meditaion: 'meditation',
  yog: 'yoga',
  progam: 'program',
  progrm: 'program',
  happines: 'happiness',
  banglore: 'Bangalore',
  bengaluru: 'Bangalore',
  accomodation: 'accommodation',
  accomodations: 'accommodation',
  satsangh: 'satsang',
  artofliving: 'Art of Living',
  aolf: 'Art of Living',
};

/** Short query → richer search text (synonym / expansion). */
export const LEXICAL_EXPANSIONS: Record<string, string> = {
  sky: 'Sudarshan Kriya SKY breathing',
  gurudev: 'Sri Sri Ravi Shankar Gurudev',
  aol: 'Art of Living',
  aolic: 'AOLIC Bangalore ashram',
  ashram: 'Bangalore International Center ashram',
  dhyan: 'meditation Sahaj Samadhi',
  kriya: 'Sudarshan Kriya',
  panchkarma: 'Panchakarma Ayurveda',
  ayurveda: 'Ayurveda Panchakarma wellness',
};

function stripWildcardToken(t: string): string {
  if (t.endsWith('*') && t.length > 1) return t.slice(0, -1);
  return t;
}

/**
 * Parse "phrase" quotes, field filters, -exclude, OR branches; return fuse segments + filters.
 */
export function parseAdvancedQuery(raw: string): ParsedAdvancedQuery {
  const correctionsApplied: string[] = [];
  let s = raw.trim();

  const requiredPhrases: string[] = [];
  const phraseRe = /"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = phraseRe.exec(s)) !== null) {
    requiredPhrases.push(m[1].trim());
  }
  s = s.replace(phraseRe, ' ').replace(/\s+/g, ' ').trim();

  const tagHints: string[] = [];
  s = s.replace(/\b(?:tag|tags):(\S+)/gi, (_, w: string) => {
    tagHints.push(w);
    return ' ';
  });

  let categoryHint: string | undefined;
  s = s.replace(/\b(?:category|cat):(\S+)/gi, (_, g1: string) => {
    categoryHint = g1.trim();
    return ' ';
  });

  let titleHint: string | undefined;
  s = s.replace(/\btitle:"([^"]+)"/gi, (_, g: string) => {
    titleHint = g.trim();
    return ' ';
  });
  s = s.replace(/\btitle:(\S+)/gi, (_, g: string) => {
    if (!titleHint) titleHint = g.trim();
    return ' ';
  });

  let urlHint: string | undefined;
  s = s.replace(/\burl:(\S+)/gi, (_, g: string) => {
    if (!urlHint) urlHint = g;
    return ' ';
  });

  s = s.replace(/\s+/g, ' ').trim();

  const tokens = s.split(/\s+/).filter(Boolean);
  const excludeTerms: string[] = [];
  const contentTokens: string[] = [];
  for (const t of tokens) {
    if (t.startsWith('-') && t.length > 1) {
      excludeTerms.push(t.slice(1).toLowerCase());
    } else if (t.length > 0) {
      contentTokens.push(t);
    }
  }

  const branches: string[][] = [[]];
  for (const t of contentTokens) {
    if (/^OR$/i.test(t)) {
      branches.push([]);
    } else {
      branches[branches.length - 1].push(t);
    }
  }

  const orFuseSegments: string[] = [];
  for (const segToks of branches) {
    const stripped = segToks.map(stripWildcardToken);
    let fuseLine = stripped.join(' ');
    fuseLine = applyTypoAndExpansion(fuseLine, correctionsApplied);
    fuseLine = fuseLine.replace(/\s+/g, ' ').trim();
    orFuseSegments.push(fuseLine);
  }

  const nonEmptySegs = orFuseSegments.filter((x) => x.length > 0);
  const fuseText = nonEmptySegs.join(' ');

  return {
    fuseText,
    orFuseSegments: nonEmptySegs.length > 0 ? nonEmptySegs : orFuseSegments,
    requiredPhrases,
    excludeTerms,
    categoryHint,
    tagHints,
    titleHint,
    urlHint,
    correctionsApplied,
  };
}

function applyTypoAndExpansion(text: string, correctionsApplied: string[]): string {
  const words = text.split(/(\s+)/);
  const out: string[] = [];
  for (const w of words) {
    if (/^\s+$/.test(w)) {
      out.push(w);
      continue;
    }
    const lower = w.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, '');
    let next = w;
    if (COMMON_TYPOS[lower]) {
      correctionsApplied.push(`${w}→${COMMON_TYPOS[lower]}`);
      next = COMMON_TYPOS[lower];
    } else if (LEXICAL_EXPANSIONS[lower]) {
      correctionsApplied.push(`${w}→${LEXICAL_EXPANSIONS[lower]}`);
      next = LEXICAL_EXPANSIONS[lower];
    }
    out.push(next);
  }
  return out.join('');
}

function searchableBlob(item: SearchIndexItem): string {
  return [item.title, item.description, item.category, ...item.tags].join(' ').toLowerCase();
}

export function passesFilters(item: SearchIndexItem, parsed: ParsedAdvancedQuery): boolean {
  const blob = searchableBlob(item);

  if (parsed.categoryHint) {
    const hint = parsed.categoryHint.toLowerCase();
    if (!item.category.toLowerCase().includes(hint) && !hint.includes(item.category.toLowerCase())) {
      return false;
    }
  }

  for (const h of parsed.tagHints) {
    const hl = h.toLowerCase();
    if (!item.tags.some((t) => t.toLowerCase().includes(hl))) return false;
  }

  if (parsed.titleHint && !item.title.toLowerCase().includes(parsed.titleHint.toLowerCase())) {
    return false;
  }

  if (parsed.urlHint && !item.url.toLowerCase().includes(parsed.urlHint.toLowerCase())) {
    return false;
  }

  for (const ex of parsed.excludeTerms) {
    if (ex.length >= 2 && blob.includes(ex)) return false;
  }

  for (const ph of parsed.requiredPhrases) {
    if (ph.length > 0 && !blob.includes(ph.toLowerCase())) return false;
  }

  return true;
}

/** Keyword buckets → score adjustment (subtract from Fuse score = better). */
export function intentScoreAdjustment(item: SearchIndexItem, originalQueryLower: string): number {
  let adj = 0;
  const url = item.url.toLowerCase();
  const cat = item.category.toLowerCase();

  if (/\b(stay|room|lodging|accommodation|hotel|meal)\b/i.test(originalQueryLower)) {
    if (url.includes('/stay') || url.includes('stay')) adj += 0.08;
    if (cat.includes('service')) adj += 0.04;
  }
  if (/\b(event|satsang|calendar|workshop)\b/i.test(originalQueryLower)) {
    if (cat.includes('event')) adj += 0.1;
    if (url.includes('/events')) adj += 0.06;
  }
  if (/\b(program|course|meditation|yoga)\b/i.test(originalQueryLower)) {
    if (cat.includes('course')) adj += 0.06;
    if (url.includes('/programs')) adj += 0.04;
  }
  if (/\b(shop|store|book|gift)\b/i.test(originalQueryLower)) {
    if (url.includes('shopping')) adj += 0.08;
  }
  if (/\b(contact|phone|email|visit)\b/i.test(originalQueryLower)) {
    if (url.includes('/connect')) adj += 0.06;
  }
  if (/\b(career|seva|job|volunteer)\b/i.test(originalQueryLower)) {
    if (url.includes('seva-careers')) adj += 0.1;
  }
  if (/\b(article|blog|read)\b/i.test(originalQueryLower)) {
    if (url.includes('/articles')) adj += 0.08;
  }
  return Math.min(adj, 0.22);
}

/** Tokens for highlighting (from fuse text + original, minus stopwords). */
export function highlightTermsFromQuery(fuseText: string, originalRaw: string): string[] {
  const combined = `${fuseText} ${originalRaw}`.toLowerCase();
  const words = combined.split(/[^\p{L}\p{N}]+/gu).filter((w) => w.length > 1 && !STOPWORDS.has(w));
  return [...new Set(words)].slice(0, 14);
}
