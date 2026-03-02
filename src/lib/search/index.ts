/**
 * Search System - Main Export
 *
 * Centralized exports for the enhanced search system.
 */

// Core
export { SearchEngine, getSearchEngine, initializeSearchEngine } from './core/SearchEngine';

// Hooks
export { useSearch } from './hooks/useSearch';
export { useAutocomplete } from './hooks/useAutocomplete';
export { useFuseSearch } from './hooks/useFuseSearch';
export type { FuseSearchResult } from './hooks/useFuseSearch';

// Types
export type {
  SearchResult,
  SearchResultType,
  SearchQuery,
  SearchResponse,
  SearchFilters,
  SearchOptions,
  SearchDocument,
  SearchIndex,
  SearchConfig,
  AutocompleteSuggestion,
  RecentSearch,
  SearchHighlight,
} from './types';

// Utils
export { sanitizeQuery, isValidQuery, normalizeQuery } from './utils/sanitization';
export { isRateLimited, recordSearchQuery, getClientIdentifier } from './utils/rateLimiting';
export { getCachedResults, cacheResults, clearSearchCache } from './utils/caching';
export { calculateRelevanceScore, calculateWeightedRelevance, sortByRelevance } from './utils/relevance';
export { expandWithSynonyms, findSynonyms } from './utils/synonyms';
export { levenshteinDistance, similarityRatio, isFuzzyMatch, findFuzzyMatches } from './utils/fuzzy';
export { highlightMatches, createSnippet, highlightInReact } from './utils/highlighting';
export { getRecentSearches, addRecentSearch, clearRecentSearches } from './utils/recentSearches';

// Config
export { getSearchConfig, updateSearchConfig, defaultSearchConfig } from './config';
