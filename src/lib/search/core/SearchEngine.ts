/**
 * Core Search Engine
 *
 * Main search engine implementation with layered architecture.
 * This is the enhancement layer that wraps and extends existing search.
 *
 * Architecture:
 * - CoreSearchLayer: Existing implementations (preserved)
 * - EnhancementLayer: This module (new features)
 * - IntelligenceLayer: AI features (feature-flagged)
 * - SecurityLayer: Input sanitization, rate limiting
 * - PerformanceLayer: Caching, indexing
 */

import type {
  SearchQuery,
  SearchResponse,
  SearchResult,
  SearchDocument,
  SearchConfig,
} from '../types';
import { getSearchConfig } from '../config';
import { sanitizeQuery, isValidQuery, normalizeQuery } from '../utils/sanitization';
import { isRateLimited, recordSearchQuery, getClientIdentifier } from '../utils/rateLimiting';
import { getCachedResults, cacheResults } from '../utils/caching';
import { calculateWeightedRelevance, sortByRelevance } from '../utils/relevance';
import { expandWithSynonyms } from '../utils/synonyms';
import { findFuzzyMatches } from '../utils/fuzzy';
import { buildSearchIndex, searchTrie, tokenizeDocument } from '../utils/indexing';
import { addRecentSearch } from '../utils/recentSearches';

/**
 * Search Engine Class
 *
 * Main search engine with all enhancement layers.
 */
export class SearchEngine {
  private config: SearchConfig;
  private index: ReturnType<typeof buildSearchIndex> | null = null;
  private documents: SearchDocument[] = [];

  constructor(config?: Partial<SearchConfig>) {
    this.config = { ...getSearchConfig(), ...config };
  }

  /**
   * Index documents for search
   *
   * @param documents - Documents to index
   */
  indexDocuments(documents: SearchDocument[]): void {
    if (!this.config.enableIndexing) return;

    this.documents = documents;
    this.index = buildSearchIndex(documents);
  }

  /**
   * Perform search
   *
   * This is the main search method that orchestrates all layers.
   *
   * @param query - Search query
   * @param filters - Search filters
   * @param options - Search options
   * @returns Search response
   */
  async search(
    query: string,
    filters?: SearchQuery['filters'],
    options?: SearchQuery['options']
  ): Promise<SearchResponse> {
    const startTime = Date.now();

    // Security Layer: Sanitize and validate
    const sanitized = sanitizeQuery(query);
    if (!isValidQuery(sanitized)) {
      return {
        results: [],
        total: 0,
        query: sanitized,
        took: Date.now() - startTime,
      };
    }

    // Security Layer: Rate limiting
    const clientId = getClientIdentifier();
    if (isRateLimited(clientId)) {
      return {
        results: [],
        total: 0,
        query: sanitized,
        took: Date.now() - startTime,
      };
    }

    recordSearchQuery(clientId, sanitized);

    // Performance Layer: Check cache
    const cacheKey: SearchQuery = {
      query: sanitized,
      filters,
      options,
    };

    const cached = getCachedResults(cacheKey);
    if (cached) {
      return {
        results: cached.results,
        total: cached.results.length,
        query: sanitized,
        took: Date.now() - startTime,
      };
    }

    // Enhancement Layer: Normalize query
    const normalized = normalizeQuery(sanitized);

    // Intelligence Layer: Expand with synonyms (if enabled)
    let searchQueries = [normalized];
    if (this.config.enableSynonyms) {
      searchQueries = expandWithSynonyms(normalized);
    }

    // Core Search: Perform actual search
    let results = this.performSearch(searchQueries, filters, options);

    // Enhancement Layer: Calculate relevance scores
    results = results.map((result) => {
      const doc = this.documents.find((d) => d.id === result.id);
      if (doc) {
        result.relevanceScore = calculateWeightedRelevance(doc, normalized);
      }
      return result;
    });

    // Enhancement Layer: Sort by relevance
    results = sortByRelevance(results);

    // Apply limit
    const limit = options?.limit || this.config.maxResults;
    results = results.slice(0, limit);

    // Performance Layer: Cache results
    cacheResults(cacheKey, results, this.config.cacheTtl);

    // Store in recent searches
    addRecentSearch(sanitized, results.length);

    return {
      results,
      total: results.length,
      query: sanitized,
      took: Date.now() - startTime,
    };
  }

  /**
   * Perform core search operation
   *
   * @param queries - Search queries (may include synonyms)
   * @param filters - Search filters
   * @param options - Search options
   * @returns Search results
   */
  private performSearch(
    queries: string[],
    filters?: SearchQuery['filters'],
    options?: SearchQuery['options']
  ): SearchResult[] {
    if (!this.index || this.documents.length === 0) {
      return [];
    }

    const resultIds = new Set<string>();

    // Search using inverted index
    for (const query of queries) {
      const terms = normalizeQuery(query).split(/\s+/).filter((t) => t.length > 0);

      for (const term of terms) {
        // Use trie for prefix matching (if available)
        if (this.index.trie) {
          const prefixMatches = searchTrie(this.index.trie, term);
          prefixMatches.forEach((id) => resultIds.add(id));
        }

        // Use inverted index for exact matches
        const exactMatches = this.index.terms.get(term);
        if (exactMatches) {
          exactMatches.forEach((id) => resultIds.add(id));
        }

        // Fuzzy matching (if enabled)
        if (this.config.enableFuzzy && term.length > 3) {
          const allTerms = Array.from(this.index.terms.keys());
          const fuzzyMatches = findFuzzyMatches(term, allTerms, 0.7);
          for (const match of fuzzyMatches.slice(0, 5)) {
            const matchIds = this.index.terms.get(match.text);
            if (matchIds) {
              matchIds.forEach((id) => resultIds.add(id));
            }
          }
        }
      }
    }

    // Convert IDs to results
    const results: SearchResult[] = [];
    for (const id of resultIds) {
      const doc = this.index.documents.get(id);
      if (!doc) continue;

      // Apply filters
      if (filters) {
        if (filters.type && !filters.type.includes(doc.type)) continue;
        if (filters.category && doc.metadata.category && !filters.category.includes(doc.metadata.category as string)) continue;
        if (filters.location && doc.metadata.location && !String(doc.metadata.location).toLowerCase().includes(filters.location.toLowerCase())) continue;
        if (filters.language && doc.metadata.language && !filters.language.includes(doc.metadata.language as string)) continue;
      }

      results.push({
        id: doc.id,
        type: doc.type,
        title: doc.title,
        description: doc.fields.description || doc.content.substring(0, 200),
        url: doc.metadata.url as string || `/${doc.type}/${doc.id}`,
        metadata: doc.metadata,
      });
    }

    return results;
  }

  /**
   * Get autocomplete suggestions
   *
   * @param query - Partial query
   * @returns Autocomplete suggestions
   */
  getAutocompleteSuggestions(query: string, limit: number = 5): string[] {
    if (!this.config.enableAutocomplete || !this.index?.trie) {
      return [];
    }

    const normalized = normalizeQuery(query);
    if (normalized.length < 2) return [];

    // Use trie for prefix matching
    const matches = searchTrie(this.index.trie, normalized);
    const suggestions = new Set<string>();

    // Get titles from matching documents
    for (const docId of matches) {
      const doc = this.index.documents.get(docId);
      if (doc) {
        // Extract words that start with query
        const words = doc.title.toLowerCase().split(/\s+/);
        for (const word of words) {
          if (word.startsWith(normalized) && word.length > normalized.length) {
            suggestions.add(word);
            if (suggestions.size >= limit) break;
          }
        }
      }
      if (suggestions.size >= limit) break;
    }

    return Array.from(suggestions).slice(0, limit);
  }
}

// Global search engine instance
let globalSearchEngine: SearchEngine | null = null;

/**
 * Get or create global search engine instance
 */
export function getSearchEngine(): SearchEngine {
  if (!globalSearchEngine) {
    globalSearchEngine = new SearchEngine();
  }
  return globalSearchEngine;
}

/**
 * Initialize search engine with documents
 */
export function initializeSearchEngine(documents: SearchDocument[]): void {
  const engine = getSearchEngine();
  engine.indexDocuments(documents);
}
