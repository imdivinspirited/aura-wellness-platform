/**
 * Synonym Expansion
 *
 * Expands search queries with synonyms for better recall.
 * Uses a predefined synonym dictionary.
 */

/**
 * Synonym groups for common terms
 * In production, this would be loaded from a database or API
 */
const SYNONYM_GROUPS: Record<string, string[]> = {
  // Yoga & Meditation
  yoga: ['yoga', 'asana', 'yogic', 'yogi'],
  meditation: ['meditation', 'dhyan', 'dhyana', 'contemplation', 'mindfulness'],
  pranayama: ['pranayama', 'breathing', 'breathwork', 'breath'],

  // Programs
  program: ['program', 'course', 'workshop', 'class', 'session'],
  retreat: ['retreat', 'residential', 'intensive'],

  // Events
  event: ['event', 'festival', 'celebration', 'gathering'],
  shivratri: ['shivratri', 'maha shivratri', 'shiva ratri'],
  navratri: ['navratri', 'navaratri', 'nine nights'],

  // Wellness
  wellness: ['wellness', 'well-being', 'health', 'healing'],
  stress: ['stress', 'tension', 'anxiety', 'pressure'],
  peace: ['peace', 'calm', 'serenity', 'tranquility'],

  // Locations
  bangalore: ['bangalore', 'bengaluru', 'blr'],
  ashram: ['ashram', 'center', 'centre', 'retreat center'],

  // General
  learn: ['learn', 'study', 'understand', 'know'],
  join: ['join', 'participate', 'attend', 'enroll'],
};

/**
 * Expand query with synonyms
 *
 * @param query - Original search query
 * @returns Expanded query with synonyms
 */
export function expandWithSynonyms(query: string): string[] {
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 0);
  const expanded: string[] = [query]; // Always include original

  // Find synonyms for each term
  const synonymTerms: string[][] = [];
  for (const term of terms) {
    const synonyms = findSynonyms(term);
    if (synonyms.length > 0) {
      synonymTerms.push(synonyms);
    }
  }

  // Generate combinations (limited to avoid explosion)
  if (synonymTerms.length > 0 && synonymTerms.length <= 3) {
    // Generate variations
    for (let i = 0; i < terms.length; i++) {
      const term = terms[i];
      const synonyms = findSynonyms(term);

      for (const synonym of synonyms.slice(0, 2)) { // Limit to 2 synonyms per term
        const variation = [...terms];
        variation[i] = synonym;
        expanded.push(variation.join(' '));
      }
    }
  }

  return [...new Set(expanded)]; // Remove duplicates
}

/**
 * Find synonyms for a term
 *
 * @param term - Search term
 * @returns Array of synonyms including the original term
 */
export function findSynonyms(term: string): string[] {
  const lowerTerm = term.toLowerCase();

  // Direct match
  if (SYNONYM_GROUPS[lowerTerm]) {
    return SYNONYM_GROUPS[lowerTerm];
  }

  // Check if term is in any synonym group
  for (const [key, synonyms] of Object.entries(SYNONYM_GROUPS)) {
    if (synonyms.includes(lowerTerm)) {
      return synonyms;
    }
  }

  // No synonyms found
  return [term];
}

/**
 * Get primary term from synonym group
 *
 * @param term - Any term in a synonym group
 * @returns Primary term (first in group)
 */
export function getPrimaryTerm(term: string): string {
  const synonyms = findSynonyms(term);
  return synonyms[0] || term;
}
