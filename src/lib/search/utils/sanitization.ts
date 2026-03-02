/**
 * Search Input Sanitization
 *
 * Security layer for sanitizing search queries.
 * Prevents XSS, injection attacks, and malicious input.
 */

/**
 * Sanitize search query
 *
 * Removes:
 * - HTML tags
 * - Script tags
 * - Special characters that could cause issues
 * - Excessive whitespace
 *
 * @param query - Raw search query
 * @returns Sanitized query
 */
export function sanitizeQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = query.replace(/<[^>]*>/g, '');

  // Remove script content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove dangerous characters (but keep basic punctuation for search)
  sanitized = sanitized.replace(/[<>{}[\]\\]/g, '');

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  // Limit length
  const maxLength = 200;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Validate search query
 *
 * @param query - Search query to validate
 * @returns True if valid
 */
export function isValidQuery(query: string): boolean {
  if (!query || typeof query !== 'string') {
    return false;
  }

  // Check length
  if (query.length > 200) {
    return false;
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers
    /<script/i,
    /eval\(/i,
    /expression\(/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(query)) {
      return false;
    }
  }

  return true;
}

/**
 * Normalize query for search
 *
 * - Lowercase
 * - Trim whitespace
 * - Remove special characters (optional)
 *
 * @param query - Search query
 * @param removeSpecialChars - Whether to remove special characters
 * @returns Normalized query
 */
export function normalizeQuery(query: string, removeSpecialChars = false): string {
  let normalized = query.toLowerCase().trim();

  if (removeSpecialChars) {
    // Keep only alphanumeric and spaces
    normalized = normalized.replace(/[^a-z0-9\s]/g, ' ');
  }

  // Normalize whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}
