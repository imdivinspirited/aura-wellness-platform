/**
 * Rate Limiting for Search
 *
 * Prevents abuse and ensures fair usage.
 * Uses in-memory storage (in production, use Redis).
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
  queries: string[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

const RATE_LIMIT_CONFIG = {
  maxQueriesPerMinute: 60,
  windowMs: 60 * 1000, // 1 minute
  blockDurationMs: 5 * 60 * 1000, // 5 minutes block
};

/**
 * Check if query is rate limited
 *
 * @param identifier - User identifier (IP, user ID, etc.)
 * @returns True if rate limited
 */
export function isRateLimited(identifier: string): boolean {
  const record = rateLimitStore.get(identifier);
  if (!record) return false;

  const now = Date.now();

  // Check if window has expired
  if (now > record.resetTime) {
    rateLimitStore.delete(identifier);
    return false;
  }

  // Check if limit exceeded
  return record.count >= RATE_LIMIT_CONFIG.maxQueriesPerMinute;
}

/**
 * Record a search query
 *
 * @param identifier - User identifier
 * @param query - Search query
 */
export function recordSearchQuery(identifier: string, query: string): void {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    // New record or expired window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs,
      queries: [query],
    });
  } else {
    // Increment count
    record.count += 1;
    record.queries.push(query);

    // If limit exceeded, extend reset time (block)
    if (record.count >= RATE_LIMIT_CONFIG.maxQueriesPerMinute) {
      record.resetTime = now + RATE_LIMIT_CONFIG.blockDurationMs;
    }
  }
}

/**
 * Get client identifier
 * In production, extract from request headers/IP
 */
export function getClientIdentifier(): string {
  // In production: return request.ip or user ID
  // For now, use a simple identifier
  if (typeof window !== 'undefined') {
    // Use session storage to maintain identifier across page reloads
    let id = sessionStorage.getItem('search-client-id');
    if (!id) {
      id = 'client-' + Date.now() + '-' + Math.random().toString(36).substring(7);
      sessionStorage.setItem('search-client-id', id);
    }
    return id;
  }
  return 'server-' + Date.now();
}

/**
 * Clear rate limit for identifier
 * Useful for testing or admin override
 */
export function clearRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}
