/**
 * Relevance Scoring Algorithms
 *
 * Calculates relevance scores for search results.
 * Uses TF-IDF-like scoring with field boosting.
 */

import type { SearchDocument, SearchResult } from '../types';

/**
 * Calculate relevance score for a document
 *
 * Scoring factors:
 * - Term frequency in title (boost: 3x)
 * - Term frequency in content (boost: 1x)
 * - Term frequency in fields (boost: 2x)
 * - Exact match bonus
 * - Prefix match bonus
 *
 * @param doc - Search document
 * @param query - Search query
 * @returns Relevance score (0-1)
 */
export function calculateRelevanceScore(
  doc: SearchDocument,
  query: string
): number {
  const queryTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 0);
  if (queryTerms.length === 0) return 0;

  let score = 0;
  const maxScore = queryTerms.length * 10; // Max possible score

  // Title matches (highest weight)
  const titleLower = doc.title.toLowerCase();
  for (const term of queryTerms) {
    if (titleLower.includes(term)) {
      // Exact match in title
      if (titleLower === term || titleLower.startsWith(term + ' ') || titleLower.endsWith(' ' + term)) {
        score += 5; // Exact match bonus
      } else {
        score += 3; // Partial match
      }
    }
  }

  // Field matches (medium weight)
  for (const [field, value] of Object.entries(doc.fields)) {
    const valueLower = value.toLowerCase();
    for (const term of queryTerms) {
      if (valueLower.includes(term)) {
        score += 2;
      }
    }
  }

  // Content matches (lower weight)
  const contentLower = doc.content.toLowerCase();
  for (const term of queryTerms) {
    const matches = (contentLower.match(new RegExp(term, 'g')) || []).length;
    score += Math.min(matches, 3); // Cap at 3 matches per term
  }

  // Exact phrase match bonus
  if (contentLower.includes(query.toLowerCase()) || titleLower.includes(query.toLowerCase())) {
    score += 5;
  }

  // Normalize to 0-1 range
  return Math.min(score / maxScore, 1);
}

/**
 * Calculate weighted relevance with field boosting
 *
 * @param doc - Search document
 * @param query - Search query
 * @param fieldWeights - Weight multipliers for fields
 * @returns Relevance score
 */
export function calculateWeightedRelevance(
  doc: SearchDocument,
  query: string,
  fieldWeights: Record<string, number> = {
    title: 3,
    description: 2,
    content: 1,
  }
): number {
  const queryTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 0);
  if (queryTerms.length === 0) return 0;

  let score = 0;
  let maxPossibleScore = 0;

  // Title
  const titleWeight = fieldWeights.title || 1;
  maxPossibleScore += queryTerms.length * titleWeight * 5;
  const titleLower = doc.title.toLowerCase();
  for (const term of queryTerms) {
    if (titleLower.includes(term)) {
      score += titleWeight * (titleLower === term ? 5 : 3);
    }
  }

  // Fields
  for (const [field, value] of Object.entries(doc.fields)) {
    const weight = fieldWeights[field] || fieldWeights.description || 1;
    maxPossibleScore += queryTerms.length * weight * 2;
    const valueLower = value.toLowerCase();
    for (const term of queryTerms) {
      if (valueLower.includes(term)) {
        score += weight * 2;
      }
    }
  }

  // Content
  const contentWeight = fieldWeights.content || 1;
  maxPossibleScore += queryTerms.length * contentWeight;
  const contentLower = doc.content.toLowerCase();
  for (const term of queryTerms) {
    const matches = (contentLower.match(new RegExp(term, 'g')) || []).length;
    score += contentWeight * Math.min(matches, 3);
  }

  return maxPossibleScore > 0 ? Math.min(score / maxPossibleScore, 1) : 0;
}

/**
 * Sort results by relevance
 *
 * @param results - Search results
 * @returns Sorted results (highest relevance first)
 */
export function sortByRelevance(results: SearchResult[]): SearchResult[] {
  return [...results].sort((a, b) => {
    const scoreA = a.relevanceScore || 0;
    const scoreB = b.relevanceScore || 0;
    return scoreB - scoreA; // Descending order
  });
}
