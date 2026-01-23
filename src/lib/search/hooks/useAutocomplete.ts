/**
 * React Hook for Autocomplete
 *
 * Provides autocomplete suggestions for search queries.
 */

import { useState, useCallback, useEffect } from 'react';
import { getSearchEngine } from '../core/SearchEngine';
import { getRecentSearches } from '../utils/recentSearches';
import { getSearchConfig } from '../config';
import { useDebouncedCallback } from '@/lib/utils';
import type { AutocompleteSuggestion } from '../types';

interface UseAutocompleteOptions {
  debounceMs?: number;
  maxSuggestions?: number;
  enableRecent?: boolean;
}

interface UseAutocompleteReturn {
  suggestions: AutocompleteSuggestion[];
  isLoading: boolean;
  setQuery: (query: string) => void;
  clear: () => void;
}

/**
 * Hook for autocomplete suggestions
 *
 * @param options - Autocomplete options
 * @returns Autocomplete hook interface
 */
export function useAutocomplete(options: UseAutocompleteOptions = {}): UseAutocompleteReturn {
  const {
    debounceMs = 200,
    maxSuggestions = 5,
    enableRecent = true,
  } = options;

  const config = getSearchConfig();
  const [query, setQueryState] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const engine = getSearchEngine();

  // Generate suggestions
  const generateSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      // Show recent searches if query is empty
      if (enableRecent && searchQuery.length === 0) {
        const recent = getRecentSearches(maxSuggestions);
        setSuggestions(
          recent.map((r) => ({
            text: r.query,
            type: 'recent' as const,
            count: r.resultCount,
          }))
        );
      } else {
        setSuggestions([]);
      }
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const autocompleteResults: AutocompleteSuggestion[] = [];

      // Get autocomplete from search engine
      if (config.enableAutocomplete) {
        const engineSuggestions = engine.getAutocompleteSuggestions(searchQuery, maxSuggestions);
        engineSuggestions.forEach((text) => {
          autocompleteResults.push({
            text,
            type: 'suggestion',
          });
        });
      }

      // Add recent searches that match
      if (enableRecent) {
        const recent = getRecentSearches(maxSuggestions * 2);
        const matchingRecent = recent
          .filter((r) => r.query.toLowerCase().includes(searchQuery.toLowerCase()))
          .slice(0, 2)
          .map((r) => ({
            text: r.query,
            type: 'recent' as const,
            count: r.resultCount,
          }));
        autocompleteResults.push(...matchingRecent);
      }

      // Limit total suggestions
      setSuggestions(autocompleteResults.slice(0, maxSuggestions));
    } catch (error) {
      console.warn('Autocomplete error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [engine, config, maxSuggestions, enableRecent]);

  // Debounced suggestion generation
  const debouncedGenerate = useDebouncedCallback(
    (searchQuery: string) => {
      generateSuggestions(searchQuery);
    },
    debounceMs
  );

  // Set query and trigger autocomplete
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    debouncedGenerate(newQuery);
  }, [debouncedGenerate]);

  // Clear suggestions
  const clear = useCallback(() => {
    setQueryState('');
    setSuggestions([]);
  }, []);

  // Generate initial recent searches on mount
  useEffect(() => {
    if (enableRecent && query.length === 0) {
      const recent = getRecentSearches(maxSuggestions);
      setSuggestions(
        recent.map((r) => ({
          text: r.query,
          type: 'recent' as const,
          count: r.resultCount,
        }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount for initial recent searches

  return {
    suggestions,
    isLoading,
    setQuery,
    clear,
  };
}
