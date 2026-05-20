/**
 * Fuzzy Matching Utilities
 *
 * Implements fuzzy string matching using Levenshtein distance
 * for handling typos and approximate matches.
 */

/**
 * Calculate Levenshtein distance between two strings
 *
 * Time Complexity: O(n * m) where n, m are string lengths
 * Space Complexity: O(n * m)
 *
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Edit distance
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  // Create matrix
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  // Initialize first row and column
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // Deletion
        matrix[i][j - 1] + 1, // Insertion
        matrix[i - 1][j - 1] + cost // Substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity ratio (0-1)
 *
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity ratio (1 = identical, 0 = completely different)
 */
export function similarityRatio(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;

  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLen;
}

/**
 * Check if two strings are fuzzy matches
 *
 * @param str1 - First string
 * @param str2 - Second string
 * @param threshold - Similarity threshold (0-1), default 0.7
 * @returns True if similar enough
 */
export function isFuzzyMatch(
  str1: string,
  str2: string,
  threshold: number = 0.7
): boolean {
  return similarityRatio(str1.toLowerCase(), str2.toLowerCase()) >= threshold;
}

/**
 * Find fuzzy matches in an array
 *
 * @param query - Search query
 * @param candidates - Array of candidate strings
 * @param threshold - Similarity threshold
 * @returns Array of matches with similarity scores
 */
export function findFuzzyMatches(
  query: string,
  candidates: string[],
  threshold: number = 0.7
): Array<{ text: string; similarity: number }> {
  const matches: Array<{ text: string; similarity: number }> = [];

  for (const candidate of candidates) {
    const similarity = similarityRatio(query.toLowerCase(), candidate.toLowerCase());
    if (similarity >= threshold) {
      matches.push({ text: candidate, similarity });
    }
  }

  // Sort by similarity (highest first)
  matches.sort((a, b) => b.similarity - a.similarity);

  return matches;
}

/**
 * Suggest corrections for a potentially misspelled query
 *
 * @param query - Search query
 * @param dictionary - Dictionary of valid terms
 * @param maxSuggestions - Maximum number of suggestions
 * @returns Array of suggested corrections
 */
export function suggestCorrections(
  query: string,
  dictionary: string[],
  maxSuggestions: number = 5
): string[] {
  const suggestions = findFuzzyMatches(query, dictionary, 0.6);
  return suggestions
    .slice(0, maxSuggestions)
    .map((s) => s.text);
}
