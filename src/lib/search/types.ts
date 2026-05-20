/**
 * Search System - Type Definitions
 *
 * Centralized types for the enhanced search system.
 * All types are designed to be backward-compatible with existing implementations.
 */

export type SearchResultType = 'program' | 'event' | 'faq' | 'service' | 'article' | 'page';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description?: string;
  url: string;
  relevanceScore?: number;
  highlights?: {
    field: string;
    snippets: string[];
  }[];
  metadata?: Record<string, unknown>;
}

export interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  options?: SearchOptions;
}

export interface SearchFilters {
  type?: SearchResultType[];
  category?: string[];
  location?: string;
  language?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  tags?: string[];
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'date' | 'title';
  highlight?: boolean;
  fuzzy?: boolean;
  synonyms?: boolean;
  spellCheck?: boolean;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  suggestions?: string[];
  spellCorrected?: string;
  took?: number; // Time in milliseconds
  facets?: Record<string, FacetResult>;
}

export interface FacetResult {
  value: string;
  count: number;
}

export interface SearchIndex {
  // Inverted index for O(1) lookup
  terms: Map<string, Set<string>>; // term -> set of document IDs
  documents: Map<string, SearchDocument>; // document ID -> document
  // Trie for prefix search O(k)
  trie?: TrieNode;
}

export interface SearchDocument {
  id: string;
  type: SearchResultType;
  title: string;
  content: string;
  fields: Record<string, string>;
  metadata: Record<string, unknown>;
  indexedAt: number;
}

export interface TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean;
  documentIds: Set<string>;
}

export interface SearchCacheEntry {
  query: string;
  filters?: SearchFilters;
  results: SearchResult[];
  timestamp: number;
  expiresAt: number;
}

export interface RecentSearch {
  query: string;
  timestamp: number;
  resultCount?: number;
}

export interface SearchAnalytics {
  query: string;
  timestamp: number;
  resultCount: number;
  clickedResult?: string;
  filters?: SearchFilters;
}

export interface SearchConfig {
  // Feature flags
  enableAutocomplete: boolean;
  enableHighlighting: boolean;
  enableSpellCheck: boolean;
  enableSynonyms: boolean;
  enableFuzzy: boolean;
  enableSemantic: boolean;
  enableVoice: boolean;
  enablePersonalization: boolean;

  // Performance
  debounceMs: number;
  cacheTtl: number;
  maxResults: number;
  maxRecentSearches: number;

  // Security
  rateLimitPerMinute: number;
  maxQueryLength: number;
  enableSanitization: boolean;

  // Indexing
  enableIndexing: boolean;
  indexUpdateInterval: number;
}

export interface SearchHighlight {
  text: string;
  isMatch: boolean;
}

export interface AutocompleteSuggestion {
  text: string;
  type: 'query' | 'recent' | 'popular' | 'suggestion';
  count?: number;
}

export interface SpellCorrection {
  original: string;
  corrected: string;
  confidence: number;
}

export interface SynonymGroup {
  terms: string[];
  primary: string;
}
