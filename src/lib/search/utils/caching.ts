/**
 * Search Result Caching
 *
 * LRU cache for search results to improve performance.
 * Uses in-memory storage (in production, use Redis).
 */

import type { SearchCacheEntry, SearchQuery } from '../types';

interface LRUNode {
  key: string;
  value: SearchCacheEntry;
  prev: LRUNode | null;
  next: LRUNode | null;
}

class LRUCache {
  private capacity: number;
  private cache: Map<string, LRUNode>;
  private head: LRUNode;
  private tail: LRUNode;

  constructor(capacity: number = 100) {
    this.capacity = capacity;
    this.cache = new Map();

    // Dummy head and tail nodes
    this.head = { key: '', value: {} as SearchCacheEntry, prev: null, next: null };
    this.tail = { key: '', value: {} as SearchCacheEntry, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  private addToHead(node: LRUNode): void {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  private removeNode(node: LRUNode): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  private moveToHead(node: LRUNode): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  private removeTail(): LRUNode | null {
    const lastNode = this.tail.prev;
    if (lastNode === this.head) return null;
    this.removeNode(lastNode!);
    return lastNode;
  }

  get(key: string): SearchCacheEntry | null {
    const node = this.cache.get(key);
    if (!node) return null;

    // Check if expired
    if (node.value.expiresAt < Date.now()) {
      this.cache.delete(key);
      this.removeNode(node);
      return null;
    }

    // Move to head (most recently used)
    this.moveToHead(node);
    return node.value;
  }

  set(key: string, value: SearchCacheEntry): void {
    const node = this.cache.get(key);

    if (node) {
      // Update existing
      node.value = value;
      this.moveToHead(node);
    } else {
      // Add new
      const newNode: LRUNode = {
        key,
        value,
        prev: null,
        next: null,
      };

      if (this.cache.size >= this.capacity) {
        // Remove least recently used
        const tail = this.removeTail();
        if (tail) {
          this.cache.delete(tail.key);
        }
      }

      this.cache.set(key, newNode);
      this.addToHead(newNode);
    }
  }

  clear(): void {
    this.cache.clear();
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  size(): number {
    return this.cache.size;
  }
}

// Global cache instance
const searchCache = new LRUCache(100);

/**
 * Generate cache key from search query
 *
 * @param query - Search query
 * @returns Cache key
 */
export function generateCacheKey(query: SearchQuery): string {
  const parts = [query.query];

  if (query.filters) {
    if (query.filters.type) parts.push(`type:${query.filters.type.join(',')}`);
    if (query.filters.category) parts.push(`cat:${query.filters.category.join(',')}`);
    if (query.filters.location) parts.push(`loc:${query.filters.location}`);
    if (query.filters.language) parts.push(`lang:${query.filters.language}`);
  }

  if (query.options) {
    if (query.options.sortBy) parts.push(`sort:${query.options.sortBy}`);
    if (query.options.limit) parts.push(`limit:${query.options.limit}`);
  }

  return parts.join('|');
}

/**
 * Get cached search results
 *
 * @param query - Search query
 * @returns Cached results or null
 */
export function getCachedResults(query: SearchQuery): SearchCacheEntry | null {
  const key = generateCacheKey(query);
  return searchCache.get(key);
}

/**
 * Cache search results
 *
 * @param query - Search query
 * @param results - Search results
 * @param ttl - Time to live in milliseconds
 */
export function cacheResults(
  query: SearchQuery,
  results: SearchCacheEntry['results'],
  ttl: number = 5 * 60 * 1000 // 5 minutes default
): void {
  const key = generateCacheKey(query);
  const now = Date.now();

  const entry: SearchCacheEntry = {
    query: query.query,
    filters: query.filters,
    results,
    timestamp: now,
    expiresAt: now + ttl,
  };

  searchCache.set(key, entry);
}

/**
 * Clear search cache
 */
export function clearSearchCache(): void {
  searchCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; capacity: number } {
  return {
    size: searchCache.size(),
    capacity: 100, // From LRUCache constructor
  };
}
