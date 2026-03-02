/**
 * Fuse.js search over centralized search index.
 * 300ms debounce, fuzzy search with threshold 0.3.
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import Fuse from 'fuse.js';
import { searchIndex, type SearchIndexItem } from '@/data/searchIndex';
import { addRecentSearch } from '../utils/recentSearches';

const DEBOUNCE_MS = 300;
const FUSE_KEYS = ['title', 'description', 'tagsStr', 'category'] as const;

export interface FuseSearchResult extends SearchIndexItem {
  score?: number;
}

export function useFuseSearch(debounceMs = DEBOUNCE_MS) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<FuseSearchResult[]>([]);
  const [isDebouncing, setIsDebouncing] = useState(false);

  const indexWithTagsStr = useMemo(
    () =>
      searchIndex.map((item) => ({
        ...item,
        tagsStr: item.tags.join(' '),
      })),
    []
  );

  const fuse = useMemo(
    () =>
      new Fuse(indexWithTagsStr, {
        keys: [...FUSE_KEYS],
        threshold: 0.3,
        includeScore: true,
      }),
    [indexWithTagsStr]
  );

  // Debounce query
  useEffect(() => {
    if (!query.trim()) {
      setDebouncedQuery('');
      setResults([]);
      setIsDebouncing(false);
      return;
    }
    setIsDebouncing(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setIsDebouncing(false);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Run Fuse search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }
    const fuseResults = fuse.search(debouncedQuery);
    const items: FuseSearchResult[] = fuseResults.map((r) => ({
      ...r.item,
      score: r.score,
    }));
    setResults(items);
  }, [debouncedQuery, fuse]);

  const clear = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setResults([]);
    setIsDebouncing(false);
  }, []);

  const recordResultClick = useCallback((url: string) => {
    addRecentSearch(query, results.length);
  }, [query, results.length]);

  return {
    query,
    setQuery,
    results,
    isLoading: isDebouncing,
    clear,
    recordResultClick,
    total: results.length,
  };
}
