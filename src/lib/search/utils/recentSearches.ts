/**
 * Recent Searches Management
 *
 * Stores and retrieves recent search queries.
 * Uses localStorage for persistence.
 */

import type { RecentSearch } from '../types';

const STORAGE_KEY = 'search-recent';
const MAX_RECENT = 10;

/**
 * Get recent searches
 *
 * @param limit - Maximum number of recent searches to return
 * @returns Array of recent searches
 */
export function getRecentSearches(limit: number = MAX_RECENT): RecentSearch[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const recent: RecentSearch[] = JSON.parse(stored);

    // Sort by timestamp (newest first)
    recent.sort((a, b) => b.timestamp - a.timestamp);

    // Return limited results
    return recent.slice(0, limit);
  } catch (error) {
    console.warn('Failed to load recent searches:', error);
    return [];
  }
}

/**
 * Add search to recent searches
 *
 * @param query - Search query
 * @param resultCount - Number of results (optional)
 */
export function addRecentSearch(query: string, resultCount?: number): void {
  if (typeof window === 'undefined') return;
  if (!query || query.trim().length === 0) return;

  try {
    const recent = getRecentSearches(MAX_RECENT * 2); // Get more to check for duplicates

    // Remove duplicate (if exists)
    const filtered = recent.filter((r) => r.query.toLowerCase() !== query.toLowerCase());

    // Add new search at the beginning
    const newSearch: RecentSearch = {
      query: query.trim(),
      timestamp: Date.now(),
      resultCount,
    };

    const updated = [newSearch, ...filtered].slice(0, MAX_RECENT);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to save recent search:', error);
  }
}

/**
 * Clear recent searches
 */
export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Remove a specific recent search
 *
 * @param query - Query to remove
 */
export function removeRecentSearch(query: string): void {
  if (typeof window === 'undefined') return;

  try {
    const recent = getRecentSearches(MAX_RECENT * 2);
    const filtered = recent.filter((r) => r.query.toLowerCase() !== query.toLowerCase());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.warn('Failed to remove recent search:', error);
  }
}
