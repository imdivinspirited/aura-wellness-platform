/**
 * React Hook for Search
 *
 * Provides a React hook interface to the search engine.
 * Maintains backward compatibility with existing search implementations.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getSearchEngine } from '../core/SearchEngine';
import { getSearchConfig } from '../config';
import { useDebouncedCallback } from '@/lib/utils';
import type { SearchQuery, SearchResponse, SearchResult } from '../types';

interface UseSearchOptions {
  debounceMs?: number;
  enableUrlSync?: boolean;
  urlParam?: string;
  onResultsChange?: (results: SearchResult[]) => void;
}

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  error: Error | null;
  search: (query: string) => Promise<void>;
  clear: () => void;
  response: SearchResponse | null;
}

/**
 * Hook for performing searches
 *
 * Features:
 * - Debounced input
 * - URL synchronization
 * - Loading states
 * - Error handling
 * - Backward compatible
 *
 * @param options - Search options
 * @returns Search hook interface
 */
export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const {
    debounceMs,
    enableUrlSync = false,
    urlParam = 'q',
    onResultsChange,
  } = options;

  const config = getSearchConfig();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize query from URL if enabled
  const initialQuery = enableUrlSync ? searchParams.get(urlParam) || '' : '';
  const [query, setQueryState] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<SearchResponse | null>(null);

  const engine = getSearchEngine();
  const debounce = debounceMs || config.debounceMs;

  // Sync URL with query
  useEffect(() => {
    if (enableUrlSync) {
      if (query) {
        setSearchParams({ [urlParam]: query }, { replace: true });
      } else {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete(urlParam);
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [query, enableUrlSync, urlParam, searchParams, setSearchParams]);

  // Initialize query from URL on mount
  useEffect(() => {
    if (enableUrlSync) {
      const urlQuery = searchParams.get(urlParam);
      if (urlQuery && urlQuery !== query) {
        setQueryState(urlQuery);
      }
    }
  }, []); // Only on mount

  // Perform search
  const performSearch = useCallback(async (searchQuery: string, filters?: SearchQuery['filters'], options?: SearchQuery['options']) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setResponse(null);
      onResultsChange?.([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchResponse = await engine.search(searchQuery, filters, options);
      setResults(searchResponse.results);
      setResponse(searchResponse);
      onResultsChange?.(searchResponse.results);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Search failed');
      setError(error);
      setResults([]);
      setResponse(null);
      onResultsChange?.([]);
    } finally {
      setIsLoading(false);
    }
  }, [engine, onResultsChange]);

  // Debounced search function
  const debouncedSearch = useDebouncedCallback(
    (searchQuery: string) => {
      performSearch(searchQuery);
    },
    debounce
  );

  // Set query and trigger search
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    debouncedSearch(newQuery);
  }, [debouncedSearch]);

  // Clear search
  const clear = useCallback(() => {
    setQueryState('');
    setResults([]);
    setResponse(null);
    setError(null);
    onResultsChange?.([]);

    if (enableUrlSync) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete(urlParam);
      setSearchParams(newParams, { replace: true });
    }
  }, [enableUrlSync, urlParam, searchParams, setSearchParams, onResultsChange]);

  // Manual search function
  const search = useCallback(async (searchQuery: string) => {
    setQueryState(searchQuery);
    await performSearch(searchQuery);
  }, [performSearch]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    search,
    clear,
    response,
  };
}
