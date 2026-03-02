/**
 * Search Indexing Utilities
 *
 * Creates and maintains search indexes for fast lookup.
 *
 * Data Structures:
 * - Inverted Index: O(1) term lookup
 * - Trie: O(k) prefix search where k is query length
 */

import type { SearchIndex, SearchDocument, TrieNode } from '../types';

/**
 * Create inverted index from documents
 *
 * Time Complexity: O(n * m) where n = documents, m = terms per document
 * Space Complexity: O(n * m)
 *
 * @param documents - Array of search documents
 * @returns Inverted index map
 */
export function createInvertedIndex(
  documents: SearchDocument[]
): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();

  for (const doc of documents) {
    // Tokenize document
    const terms = tokenizeDocument(doc);

    for (const term of terms) {
      if (!index.has(term)) {
        index.set(term, new Set());
      }
      index.get(term)!.add(doc.id);
    }
  }

  return index;
}

/**
 * Tokenize document into searchable terms
 *
 * @param doc - Search document
 * @returns Array of normalized terms
 */
export function tokenizeDocument(doc: SearchDocument): string[] {
  const text = `${doc.title} ${doc.content} ${Object.values(doc.fields).join(' ')}`;
  const terms = new Set<string>();

  // Simple tokenization (in production, use a proper tokenizer)
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2); // Filter out very short words

  // Add full words
  words.forEach((word) => terms.add(word));

  // Add n-grams for better matching (bigrams)
  for (let i = 0; i < words.length - 1; i++) {
    terms.add(`${words[i]} ${words[i + 1]}`);
  }

  return Array.from(terms);
}

/**
 * Create Trie for prefix search
 *
 * Time Complexity: O(n * m) for construction
 * Space Complexity: O(n * m)
 *
 * @param documents - Array of search documents
 * @returns Trie root node
 */
export function createTrie(documents: SearchDocument[]): TrieNode {
  const root: TrieNode = {
    children: new Map(),
    isEnd: false,
    documentIds: new Set(),
  };

  for (const doc of documents) {
    const terms = tokenizeDocument(doc);
    for (const term of terms) {
      insertIntoTrie(root, term, doc.id);
    }
  }

  return root;
}

/**
 * Insert term into trie
 *
 * @param root - Trie root node
 * @param term - Term to insert
 * @param docId - Document ID
 */
function insertIntoTrie(root: TrieNode, term: string, docId: string): void {
  let node = root;

  for (const char of term) {
    if (!node.children.has(char)) {
      node.children.set(char, {
        children: new Map(),
        isEnd: false,
        documentIds: new Set(),
      });
    }
    node = node.children.get(char)!;
  }

  node.isEnd = true;
  node.documentIds.add(docId);
}

/**
 * Search trie for prefix matches
 *
 * Time Complexity: O(k + m) where k = prefix length, m = results
 *
 * @param root - Trie root node
 * @param prefix - Search prefix
 * @returns Set of document IDs matching prefix
 */
export function searchTrie(root: TrieNode, prefix: string): Set<string> {
  let node = root;

  // Navigate to prefix node
  for (const char of prefix.toLowerCase()) {
    if (!node.children.has(char)) {
      return new Set(); // No matches
    }
    node = node.children.get(char)!;
  }

  // Collect all document IDs from this node and children
  const results = new Set<string>(node.documentIds);

  // DFS to collect all descendant document IDs
  function collectIds(currentNode: TrieNode): void {
    for (const childNode of currentNode.children.values()) {
      childNode.documentIds.forEach((id) => results.add(id));
      collectIds(childNode);
    }
  }

  collectIds(node);

  return results;
}

/**
 * Build complete search index
 *
 * @param documents - Array of search documents
 * @returns Complete search index
 */
export function buildSearchIndex(documents: SearchDocument[]): SearchIndex {
  const index: SearchIndex = {
    terms: createInvertedIndex(documents),
    documents: new Map(documents.map((doc) => [doc.id, doc])),
    trie: createTrie(documents),
  };

  return index;
}
