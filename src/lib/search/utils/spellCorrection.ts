/**
 * Spell Correction Utilities
 *
 * Provides spell correction suggestions for search queries.
 * Uses fuzzy matching and a dictionary of common terms.
 */

import { findFuzzyMatches, similarityRatio } from './fuzzy';

/**
 * Dictionary of valid search terms
 * In production, this would be built from indexed terms or a larger dictionary
 */
const SEARCH_DICTIONARY: string[] = [
  // Programs
  'happiness', 'program', 'yoga', 'meditation', 'pranayama', 'samadhi',
  'retreat', 'corporate', 'wellness', 'amp', 'dsn', 'blessings',

  // Events
  'event', 'shivratri', 'navratri', 'festival', 'celebration', 'gathering',

  // Locations
  'bangalore', 'bengaluru', 'ashram', 'center', 'centre', 'india',

  // Wellness
  'wellness', 'health', 'healing', 'stress', 'peace', 'calm', 'serenity',

  // General
  'learn', 'join', 'participate', 'attend', 'enroll', 'register',
];

/**
 * Suggest spell corrections for a query
 *
 * @param query - Search query (potentially misspelled)
 * @param maxSuggestions - Maximum number of suggestions
 * @returns Corrected query or null if no good match found
 */
export function suggestSpellCorrection(
  query: string,
  maxSuggestions: number = 1
): string | null {
  if (!query || query.length < 3) return null;

  const queryWords = query.toLowerCase().split(/\s+/);
  const correctedWords: string[] = [];

  for (const word of queryWords) {
    // Skip very short words
    if (word.length < 3) {
      correctedWords.push(word);
      continue;
    }

    // Find fuzzy matches in dictionary
    const matches = findFuzzyMatches(word, SEARCH_DICTIONARY, 0.7);

    if (matches.length > 0 && matches[0].similarity > 0.8) {
      // High confidence correction
      correctedWords.push(matches[0].text);
    } else {
      // Keep original if no good match
      correctedWords.push(word);
    }
  }

  const corrected = correctedWords.join(' ');

  // Only return if different from original
  if (corrected.toLowerCase() !== query.toLowerCase()) {
    return corrected;
  }

  return null;
}

/**
 * Check if query likely contains spelling errors
 *
 * @param query - Search query
 * @returns True if likely misspelled
 */
export function isLikelyMisspelled(query: string): boolean {
  if (!query || query.length < 3) return false;

  const words = query.toLowerCase().split(/\s+/);
  let misspelledCount = 0;

  for (const word of words) {
    if (word.length < 3) continue;

    // Check if word is in dictionary
    const inDictionary = SEARCH_DICTIONARY.some(
      (dictWord) => dictWord.toLowerCase() === word.toLowerCase()
    );

    // Check fuzzy match confidence
    if (!inDictionary) {
      const matches = findFuzzyMatches(word, SEARCH_DICTIONARY, 0.7);
      if (matches.length === 0 || matches[0].similarity < 0.8) {
        misspelledCount++;
      }
    }
  }

  // Consider misspelled if > 50% of words are likely misspelled
  return misspelledCount > 0 && misspelledCount / words.length > 0.5;
}

/**
 * Get spell correction suggestions
 *
 * @param query - Search query
 * @param maxSuggestions - Maximum suggestions
 * @returns Array of correction suggestions
 */
export function getSpellCorrections(
  query: string,
  maxSuggestions: number = 3
): Array<{ original: string; corrected: string; confidence: number }> {
  if (!query || query.length < 3) return [];

  const suggestions: Array<{ original: string; corrected: string; confidence: number }> = [];
  const words = query.toLowerCase().split(/\s+/);

  for (const word of words) {
    if (word.length < 3) continue;

    const matches = findFuzzyMatches(word, SEARCH_DICTIONARY, 0.6);

    for (const match of matches.slice(0, maxSuggestions)) {
      suggestions.push({
        original: word,
        corrected: match.text,
        confidence: match.similarity,
      });
    }
  }

  return suggestions;
}
