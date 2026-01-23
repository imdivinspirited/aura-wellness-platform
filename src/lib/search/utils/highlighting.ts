/**
 * Search Result Highlighting
 *
 * Highlights matching terms in search results.
 */

import React from 'react';
import type { SearchHighlight } from '../types';

/**
 * Highlight matching terms in text
 *
 * @param text - Text to highlight
 * @param query - Search query
 * @param maxLength - Maximum length of snippet
 * @returns Array of highlight segments
 */
export function highlightMatches(
  text: string,
  query: string,
  maxLength: number = 200
): SearchHighlight[] {
  if (!query || !text) {
    return [{ text, isMatch: false }];
  }

  const queryTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 0);
  if (queryTerms.length === 0) {
    return [{ text, isMatch: false }];
  }

  const lowerText = text.toLowerCase();
  const highlights: SearchHighlight[] = [];
  let lastIndex = 0;

  // Find all match positions
  const matches: Array<{ start: number; end: number }> = [];

  for (const term of queryTerms) {
    let index = lowerText.indexOf(term, lastIndex);
    while (index !== -1) {
      matches.push({ start: index, end: index + term.length });
      index = lowerText.indexOf(term, index + 1);
    }
  }

  // Sort matches by position
  matches.sort((a, b) => a.start - b.start);

  // Merge overlapping matches
  const mergedMatches: Array<{ start: number; end: number }> = [];
  for (const match of matches) {
    if (mergedMatches.length === 0) {
      mergedMatches.push(match);
    } else {
      const last = mergedMatches[mergedMatches.length - 1];
      if (match.start <= last.end) {
        // Overlapping, merge
        last.end = Math.max(last.end, match.end);
      } else {
        mergedMatches.push(match);
      }
    }
  }

  // Build highlight segments
  for (const match of mergedMatches) {
    // Add text before match
    if (match.start > lastIndex) {
      highlights.push({
        text: text.substring(lastIndex, match.start),
        isMatch: false,
      });
    }

    // Add matched text
    highlights.push({
      text: text.substring(match.start, match.end),
      isMatch: true,
    });

    lastIndex = match.end;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    highlights.push({
      text: text.substring(lastIndex),
      isMatch: false,
    });
  }

  return highlights;
}

/**
 * Create snippet with highlighted matches
 *
 * @param text - Full text
 * @param query - Search query
 * @param maxLength - Maximum snippet length
 * @param contextLength - Context around matches
 * @returns Snippet with highlights
 */
export function createSnippet(
  text: string,
  query: string,
  maxLength: number = 200,
  contextLength: number = 50
): string {
  if (!query || !text) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  const queryTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 0);
  const lowerText = text.toLowerCase();

  // Find first match
  let matchStart = -1;
  for (const term of queryTerms) {
    const index = lowerText.indexOf(term);
    if (index !== -1) {
      matchStart = index;
      break;
    }
  }

  if (matchStart === -1) {
    // No match, return beginning
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  // Extract snippet around match
  const start = Math.max(0, matchStart - contextLength);
  const end = Math.min(text.length, matchStart + query.length + contextLength);

  let snippet = text.substring(start, end);

  // Add ellipsis if needed
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';

  // Truncate if too long
  if (snippet.length > maxLength) {
    snippet = snippet.substring(0, maxLength) + '...';
  }

  return snippet;
}

/**
 * Highlight query terms in HTML (for React)
 *
 * @param text - Text to highlight
 * @param query - Search query
 * @returns JSX elements with highlights
 */
export function highlightInReact(
  text: string,
  query: string
): Array<React.ReactElement> {
  const highlights = highlightMatches(text, query);

  return highlights.map((highlight, index) => {
    if (highlight.isMatch) {
      return React.createElement(
        'mark',
        { key: index, className: 'bg-yellow-200 text-yellow-900 px-1 rounded' },
        highlight.text
      );
    }
    return React.createElement('span', { key: index }, highlight.text);
  });
}
