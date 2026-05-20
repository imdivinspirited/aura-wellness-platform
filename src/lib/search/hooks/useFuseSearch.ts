/**
 * Advanced client-side search: Fuse.js + query parsing, OR union, filters, intent/click/feedback,
 * bookmarks, safe search, sort modes, pagination, suggestions, related results & query chips.
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import Fuse from 'fuse.js';
import { searchIndex, type SearchIndexItem } from '@/data/searchIndex';
import { addRecentSearch } from '../utils/recentSearches';
import {
  parseAdvancedQuery,
  passesFilters,
  intentScoreAdjustment,
  highlightTermsFromQuery,
} from '../advancedQueryEngine';
import { getClickBoostForUrl, getClickCountForUrl, recordResultClickSignal } from '../clickSignals';
import { getFeedbackScoreAdjust } from '../searchFeedback';
import { getBookmarkScoreAdjust } from '../searchBookmarks';
import { passesSafeSearchFilter } from '../safeSearchSettings';
import { buildSuggestionPool, filterSuggestions } from '../autocomplete';
import { getRelatedResults } from '../relatedFromTags';
import { buildRelatedQuerySuggestions } from '../relatedQuerySuggestions';
import { recordSearchOutcome } from '../searchAnalytics';
import { sanitizeQuery } from '../utils/sanitization';
import {
  getClientIdentifier,
  getRateLimitRetryAfterMs,
  isRateLimited,
  recordSearchQuery,
} from '../utils/rateLimiting';
import { fetchSiteSearch, reportServerSearchClick } from '../api/fetchSiteSearch';
import { getRemoteSearchCache, setRemoteSearchCache } from '../searchRemoteCache';

const DEBOUNCE_MS = 120;
/** Cap Fuse candidate docs — ranking + filters run on this set (index ~100–200 rows). */
const FUSE_SEARCH_LIMIT = 120;
const FUSE_KEYS = ['title', 'description', 'tagsStr', 'category'] as const;

/** Precomputed for O(1) freshness sort (was O(n) per compare via searchIndex.findIndex). */
const FRESHNESS_BY_URL = new Map<string, number>(
  searchIndex.map((item, i) => [item.url, i] as const),
);
const SORT_STORAGE_KEY = 'aolic-search-sort-mode';
const PAGE_SIZE_STORAGE_KEY = 'aolic-search-page-size';

export interface FuseSearchResult extends SearchIndexItem {
  /** Effective relevance (lower = better); Fuse score minus boosts */
  score?: number;
}

export type SearchSortMode = 'relevance' | 'title' | 'category' | 'popularity' | 'freshness';

const ALLOWED_PAGE_SIZES = [4, 8, 16, 24] as const;

function loadSort(): SearchSortMode {
  try {
    const v = localStorage.getItem(SORT_STORAGE_KEY);
    if (v === 'title' || v === 'category' || v === 'popularity' || v === 'relevance' || v === 'freshness') return v;
  } catch {
    /* ignore */
  }
  return 'relevance';
}

function loadPageSize(): number {
  try {
    const n = Number(localStorage.getItem(PAGE_SIZE_STORAGE_KEY));
    if (ALLOWED_PAGE_SIZES.includes(n as (typeof ALLOWED_PAGE_SIZES)[number])) return n;
  } catch {
    /* ignore */
  }
  return 8;
}

function freshnessIndex(item: SearchIndexItem): number {
  return FRESHNESS_BY_URL.get(item.url) ?? 0;
}

const FUSE_CACHE_MAX = 80;
const FUSE_CACHE_TTL_MS = 5 * 60 * 1000;
const fuseResultCache = new Map<string, { results: FuseSearchResult[]; expiresAt: number }>();

function fuseResultCacheKey(
  q: string,
  sort: SearchSortMode,
  safe: boolean,
  rk: number,
): string {
  return `${q}\0${sort}\0${String(safe)}\0${rk}`;
}

function fuseResultCacheGet(key: string): FuseSearchResult[] | null {
  const row = fuseResultCache.get(key);
  if (!row) return null;
  if (Date.now() > row.expiresAt) {
    fuseResultCache.delete(key);
    return null;
  }
  return row.results;
}

function fuseResultCacheSet(key: string, results: FuseSearchResult[]): void {
  if (fuseResultCache.size >= FUSE_CACHE_MAX) {
    const oldest = fuseResultCache.keys().next().value as string | undefined;
    if (oldest !== undefined) fuseResultCache.delete(oldest);
  }
  fuseResultCache.set(key, { results, expiresAt: Date.now() + FUSE_CACHE_TTL_MS });
}

export function useFuseSearch(debounceMs = DEBOUNCE_MS, safeSearchEnabled = true, rerankKey = 0) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<FuseSearchResult[]>([]);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [isRemoteFetching, setIsRemoteFetching] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [rateLimitRetryAfterMs, setRateLimitRetryAfterMs] = useState(0);
  const [sortBy, setSortByState] = useState<SearchSortMode>(loadSort);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(loadPageSize);

  const setSortBy = useCallback((mode: SearchSortMode) => {
    setSortByState(mode);
    try {
      localStorage.setItem(SORT_STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, []);

  const setPageSize = useCallback((n: number) => {
    const v = ALLOWED_PAGE_SIZES.includes(n as (typeof ALLOWED_PAGE_SIZES)[number]) ? n : 8;
    setPageSizeState(v);
    try {
      localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(v));
    } catch {
      /* ignore */
    }
  }, []);

  const indexWithTagsStr = useMemo(
    () =>
      searchIndex.map((item) => ({
        ...item,
        tagsStr: item.tags.join(' '),
      })),
    [],
  );

  const suggestionPool = useMemo(() => buildSuggestionPool(searchIndex), []);

  const fuse = useMemo(
    () =>
      new Fuse(indexWithTagsStr, {
        keys: [...FUSE_KEYS],
        threshold: 0.32,
        includeScore: true,
        ignoreLocation: true,
        minMatchCharLength: 1,
        shouldSort: true,
      }),
    [indexWithTagsStr],
  );

  const parsed = useMemo(() => parseAdvancedQuery(debouncedQuery), [debouncedQuery]);

  const fuseSegments = useMemo(() => {
    return parsed.orFuseSegments.map((s) => s.trim()).filter((s) => s.length > 0);
  }, [parsed.orFuseSegments]);

  const effectiveFuseText = useMemo(() => {
    if (fuseSegments.length > 0) return fuseSegments.join(' ');
    if (parsed.requiredPhrases.length > 0) return parsed.requiredPhrases.join(' ');
    return '';
  }, [fuseSegments, parsed.requiredPhrases]);

  const highlightTerms = useMemo(
    () => highlightTermsFromQuery(effectiveFuseText || debouncedQuery, debouncedQuery),
    [effectiveFuseText, debouncedQuery],
  );

  const suggestions = useMemo(() => {
    const q = query.trim();
    if (q.length < 1) return [];
    return filterSuggestions(suggestionPool, q, 8);
  }, [query, suggestionPool]);

  useEffect(() => {
    if (!query.trim()) {
      setDebouncedQuery('');
      return;
    }
    setIsDebouncing(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(sanitizeQuery(query.trim()));
      setIsDebouncing(false);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  useEffect(() => {
    const cacheKey = fuseResultCacheKey(debouncedQuery, sortBy, safeSearchEnabled, rerankKey);

    if (!debouncedQuery.trim()) {
      setResults([]);
      setRateLimited(false);
      setRateLimitRetryAfterMs(0);
      return;
    }

    const cached = fuseResultCacheGet(cacheKey);
    if (cached) {
      setResults(cached);
      setRateLimited(false);
      setRateLimitRetryAfterMs(0);
      return;
    }

    const clientId = getClientIdentifier();
    if (isRateLimited(clientId)) {
      setResults([]);
      setRateLimited(true);
      setRateLimitRetryAfterMs(getRateLimitRetryAfterMs(clientId));
      return;
    }

    recordSearchQuery(clientId, debouncedQuery);

    const rawLower = debouncedQuery.toLowerCase();

    const applyRanking = (item: SearchIndexItem, baseScore: number): FuseSearchResult | null => {
      if (safeSearchEnabled && !passesSafeSearchFilter(item.title, item.description)) return null;
      let sc = baseScore;
      sc -= intentScoreAdjustment(item, rawLower);
      sc -= getClickBoostForUrl(item.url);
      sc -= getFeedbackScoreAdjust(item.url);
      sc -= getBookmarkScoreAdjust(item.url);
      if (sc < 0) sc = 0;
      return { ...item, score: sc };
    };

    const sortFn = (a: FuseSearchResult, b: FuseSearchResult) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'category') {
        const c = a.category.localeCompare(b.category);
        if (c !== 0) return c;
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'popularity') {
        const ca = getClickCountForUrl(a.url);
        const cb = getClickCountForUrl(b.url);
        if (cb !== ca) return cb - ca;
        return (a.score ?? 1) - (b.score ?? 1);
      }
      if (sortBy === 'freshness') {
        return freshnessIndex(b) - freshnessIndex(a);
      }
      return (a.score ?? 1) - (b.score ?? 1);
    };

    const hasStructuralFilters =
      Boolean(parsed.categoryHint) ||
      parsed.tagHints.length > 0 ||
      Boolean(parsed.titleHint) ||
      Boolean(parsed.urlHint) ||
      parsed.excludeTerms.length > 0 ||
      parsed.requiredPhrases.length > 0;

    const finalize = (merged: FuseSearchResult[]) => {
      fuseResultCacheSet(cacheKey, merged);
      setResults(merged);
      setRateLimited(false);
      setRateLimitRetryAfterMs(0);
    };

    const runFuseSingleSegment = () => {
      const fuseResults = fuse.search(fuseSegments[0], { limit: FUSE_SEARCH_LIMIT });
      const merged: FuseSearchResult[] = [];
      const seen = new Set<string>();
      for (const r of fuseResults) {
        const item = r.item as SearchIndexItem;
        if (!passesFilters(item, parsed)) continue;
        if (seen.has(item.url)) continue;
        seen.add(item.url);
        const sc = r.score ?? 1;
        const row = applyRanking(item, sc);
        if (row) merged.push(row);
      }
      merged.sort(sortFn);
      finalize(merged);
    };

    const siteSearchServerOn =
      import.meta.env.VITE_SITE_SEARCH_SERVER === 'true' || import.meta.env.VITE_SITE_SEARCH_SERVER === '1';

    if (
      siteSearchServerOn &&
      fuseSegments.length === 1 &&
      !hasStructuralFilters &&
      fuseSegments[0].trim().length > 0
    ) {
      const qSeg = fuseSegments[0];
      const remoteLimit = 80;
      const remoteMode = 'hybrid' as const;
      let cancelled = false;
      const ac = new AbortController();

      const cached = getRemoteSearchCache(qSeg, remoteLimit, remoteMode);
      if (cached) {
        const mergedFast: FuseSearchResult[] = [];
        cached.hits.forEach((hit, idx) => {
          const si: SearchIndexItem = {
            id: hit.id,
            title: hit.title,
            description: hit.description,
            category: hit.category,
            tags: hit.tags,
            url: hit.url,
            image: hit.image,
          };
          if (!passesFilters(si, parsed)) return;
          const baseScore = 0.12 + idx * 0.008;
          const row = applyRanking(si, baseScore);
          if (row) mergedFast.push(row);
        });
        mergedFast.sort(sortFn);
        finalize(mergedFast);
        return () => {
          cancelled = true;
          ac.abort();
        };
      }

      setIsRemoteFetching(true);
      void (async () => {
        try {
          const data = await fetchSiteSearch(qSeg, {
            mode: remoteMode,
            limit: remoteLimit,
            signal: ac.signal,
          });
          if (cancelled) return;
          setRemoteSearchCache(qSeg, remoteLimit, remoteMode, {
            hits: data.hits,
            mode: data.mode,
            tookMs: data.tookMs,
          });
          const merged: FuseSearchResult[] = [];
          data.hits.forEach((hit, idx) => {
            const si: SearchIndexItem = {
              id: hit.id,
              title: hit.title,
              description: hit.description,
              category: hit.category,
              tags: hit.tags,
              url: hit.url,
              image: hit.image,
            };
            if (!passesFilters(si, parsed)) return;
            const baseScore = 0.12 + idx * 0.008;
            const row = applyRanking(si, baseScore);
            if (row) merged.push(row);
          });
          merged.sort(sortFn);
          finalize(merged);
        } catch (e: unknown) {
          if (cancelled) return;
          const aborted =
            (e && typeof e === 'object' && 'name' in e && (e as { name?: string }).name === 'AbortError') ||
            (typeof DOMException !== 'undefined' && e instanceof DOMException && e.name === 'AbortError');
          if (aborted) return;
          runFuseSingleSegment();
        } finally {
          if (!cancelled) setIsRemoteFetching(false);
        }
      })();
      return () => {
        cancelled = true;
        ac.abort();
        setIsRemoteFetching(false);
      };
    }

    setIsRemoteFetching(false);

    if (fuseSegments.length === 0) {
      if (!hasStructuralFilters) {
        finalize([]);
        return;
      }
      const merged: FuseSearchResult[] = [];
      for (const item of searchIndex) {
        if (!passesFilters(item, parsed)) continue;
        const r = applyRanking(item, 0.5);
        if (r) merged.push(r);
      }
      merged.sort(sortFn);
      finalize(merged);
      return;
    }

    if (fuseSegments.length === 1) {
      runFuseSingleSegment();
      return;
    }

    const byUrl = new Map<string, FuseSearchResult>();
    for (const seg of fuseSegments) {
      for (const r of fuse.search(seg, { limit: FUSE_SEARCH_LIMIT })) {
        const item = r.item as SearchIndexItem;
        if (!passesFilters(item, parsed)) continue;
        const sc = r.score ?? 1;
        const ranked = applyRanking(item, sc);
        if (!ranked) continue;
        const prev = byUrl.get(item.url);
        if (!prev || (ranked.score ?? 1) < (prev.score ?? 1)) {
          byUrl.set(item.url, ranked);
        }
      }
    }
    const merged = [...byUrl.values()];
    merged.sort(sortFn);
    finalize(merged);
  }, [debouncedQuery, fuse, parsed, sortBy, fuseSegments, safeSearchEnabled, rerankKey]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, sortBy, pageSize]);

  useEffect(() => {
    if (!debouncedQuery || isDebouncing) return;
    recordSearchOutcome(debouncedQuery, results.length);
  }, [debouncedQuery, results.length, isDebouncing]);

  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const pagedResults = useMemo(() => {
    const p = Math.min(page, totalPages);
    const start = (p - 1) * pageSize;
    return results.slice(start, start + pageSize);
  }, [results, page, totalPages, pageSize]);

  const related = useMemo(() => {
    if (results.length === 0) return [];
    const exclude = new Set(results.map((r) => r.url));
    return getRelatedResults(results[0], searchIndex, exclude, 4);
  }, [results]);

  const relatedQueryChips = useMemo(() => {
    if (results.length === 0) return [];
    return buildRelatedQuerySuggestions(results[0], 5);
  }, [results]);

  const clear = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setResults([]);
    setIsDebouncing(false);
    setRateLimited(false);
    setRateLimitRetryAfterMs(0);
    setPage(1);
  }, []);

  const recordResultClick = useCallback(
    (url: string) => {
      addRecentSearch(query, results.length);
      recordResultClickSignal(url);
      reportServerSearchClick(searchIndex.find((i) => i.url === url)?.id);
    },
    [query, results.length],
  );

  return {
    query,
    setQuery,
    results,
    pagedResults,
    page,
    setPage,
    pageSize,
    setPageSize,
    allowedPageSizes: ALLOWED_PAGE_SIZES,
    totalPages,
    isLoading: isDebouncing || isRemoteFetching,
    rateLimited,
    rateLimitRetryAfterMs,
    clear,
    recordResultClick,
    total: results.length,
    sortBy,
    setSortBy,
    parsedQuery: parsed,
    highlightTerms,
    suggestions,
    relatedResults: related,
    relatedQueryChips,
    corrections: parsed.correctionsApplied,
    effectiveFuseText,
  };
}
