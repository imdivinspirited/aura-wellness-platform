/**
 * Search System Configuration
 *
 * Centralized configuration for the search system.
 * All features are toggleable via feature flags.
 */

import type { SearchConfig } from './types';

/**
 * Default Search Configuration
 *
 * Feature flags allow gradual rollout and A/B testing.
 */
export const defaultSearchConfig: SearchConfig = {
  // Feature Flags - Basic → Intermediate
  enableAutocomplete: true,
  enableHighlighting: true,
  enableSpellCheck: false, // Advanced feature
  enableSynonyms: false, // Advanced feature
  enableFuzzy: false, // Advanced feature
  enableSemantic: false, // AI feature - disabled by default
  enableVoice: false, // Future feature
  enablePersonalization: false, // Future feature

  // Performance Settings
  debounceMs: 300, // Match existing implementations
  cacheTtl: 5 * 60 * 1000, // 5 minutes
  maxResults: 50,
  maxRecentSearches: 10,

  // Security Settings
  rateLimitPerMinute: 60,
  maxQueryLength: 200,
  enableSanitization: true,

  // Indexing Settings
  enableIndexing: true,
  indexUpdateInterval: 60 * 1000, // 1 minute
};

/**
 * Get search configuration
 * In production, this could be loaded from environment variables or API
 */
export function getSearchConfig(): SearchConfig {
  // Check for environment overrides
  const envConfig: Partial<SearchConfig> = {};

  if (typeof window !== 'undefined') {
    // Check localStorage for user preferences
    const stored = localStorage.getItem('search-config');
    if (stored) {
      try {
        Object.assign(envConfig, JSON.parse(stored));
      } catch (e) {
        console.warn('Failed to parse stored search config:', e);
      }
    }
  }

  return {
    ...defaultSearchConfig,
    ...envConfig,
  };
}

/**
 * Update search configuration
 * Useful for A/B testing or feature rollouts
 */
export function updateSearchConfig(updates: Partial<SearchConfig>): void {
  const current = getSearchConfig();
  const updated = { ...current, ...updates };

  if (typeof window !== 'undefined') {
    localStorage.setItem('search-config', JSON.stringify(updated));
  }
}
