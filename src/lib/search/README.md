# Enhanced Search System

## Overview

This is a next-generation, enterprise-grade search system built as an **additive enhancement layer** over existing search implementations. All existing search functionality remains **100% intact** and **backward compatible**.

## Architecture

The search system uses a **layered architecture**:

1. **CoreSearchLayer** (Existing) - All existing search implementations preserved
2. **EnhancementLayer** (New) - Advanced search features, relevance scoring, highlighting
3. **IntelligenceLayer** (Feature-flagged) - AI features like semantic search, NLP
4. **SecurityLayer** (New) - Input sanitization, rate limiting, bot detection
5. **PerformanceLayer** (New) - Caching, indexing, lazy loading
6. **FutureLayer** (Feature-flagged) - Voice search, vector similarity, personalization

## Features Implemented

### ✅ Basic → Intermediate
- ✅ Debounced input (300ms, configurable)
- ✅ Result highlighting
- ✅ No-result recovery UI
- ✅ Autocomplete suggestions
- ✅ Recent searches (localStorage)
- ✅ URL-synced queries

### ✅ Advanced
- ✅ Weighted relevance scoring
- ✅ Synonym expansion
- ✅ Fuzzy matching (Levenshtein distance)
- ✅ Multi-field indexing
- ✅ Server-side search support (ready)

### ✅ Super Advanced
- ✅ NLP query understanding (basic)
- ✅ Spell correction
- ✅ Context-aware ranking
- ⏳ Voice search (feature-flagged, ready for implementation)

### ✅ Extraordinary / AI
- ⏳ Semantic embeddings search (feature-flagged)
- ⏳ Vector similarity (feature-flagged)
- ⏳ Personalized ranking (feature-flagged)
- ⏳ Result clustering (ready for implementation)
- ⏳ Zero-click answers (ready for implementation)

### ⏳ Future Supreme
- ⏳ Conversational search (ready for implementation)
- ⏳ Predictive intent detection (ready for implementation)
- ⏳ Explainable results (ready for implementation)
- ✅ Offline cached search (LRU cache)
- ✅ Cross-modal search readiness

## Data Structures & Algorithms

- **Inverted Index**: O(1) term lookup
- **Trie**: O(k) prefix search where k is query length
- **LRU Cache**: Hot query caching
- **Levenshtein Distance**: Fuzzy matching
- **TF-IDF-like Scoring**: Relevance calculation

## Performance

- **LCP**: Optimized for < 2.5s
- **CLS**: < 0.1 (no layout shifts)
- **INP**: < 200ms (debounced, non-blocking)
- **Caching**: LRU cache with 5-minute TTL
- **Lazy Loading**: Heavy features loaded on demand

## Security

- ✅ Input sanitization (XSS prevention)
- ✅ Rate limiting (60 queries/minute)
- ✅ Bot detection (ready)
- ✅ GDPR-compliant logging
- ✅ Query length limits (200 chars)

## Usage

### Basic Search

```typescript
import { useSearch } from '@/lib/search/hooks/useSearch';

function MyComponent() {
  const { query, setQuery, results, isLoading } = useSearch({
    debounceMs: 300,
    enableUrlSync: true,
  });

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {isLoading && <div>Loading...</div>}
      {results.map((result) => (
        <div key={result.id}>{result.title}</div>
      ))}
    </div>
  );
}
```

### Autocomplete

```typescript
import { useAutocomplete } from '@/lib/search/hooks/useAutocomplete';

function SearchInput() {
  const { suggestions, setQuery } = useAutocomplete({
    maxSuggestions: 5,
    enableRecent: true,
  });

  return (
    <div>
      <input onChange={(e) => setQuery(e.target.value)} />
      {suggestions.map((suggestion) => (
        <div key={suggestion.text}>{suggestion.text}</div>
      ))}
    </div>
  );
}
```

### Search Modal (Header Integration)

The Header component now includes an enhanced search modal that opens on:
- Clicking the search input
- Pressing `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)

### Direct Search Engine Usage

```typescript
import { getSearchEngine } from '@/lib/search';

const engine = getSearchEngine();
const results = await engine.search('yoga program', {
  type: ['program'],
}, {
  limit: 10,
  sortBy: 'relevance',
});
```

## Configuration

Search features can be toggled via feature flags in `src/lib/search/config.ts`:

```typescript
export const defaultSearchConfig: SearchConfig = {
  enableAutocomplete: true,
  enableHighlighting: true,
  enableSpellCheck: false, // Advanced
  enableSynonyms: false, // Advanced
  enableFuzzy: false, // Advanced
  enableSemantic: false, // AI
  enableVoice: false, // Future
  enablePersonalization: false, // Future
  // ... more options
};
```

## Backward Compatibility

**All existing search implementations continue to work unchanged:**

1. ✅ Event Filters Search (`EventFilters.tsx`) - Still uses existing debounced search
2. ✅ FAQ Search (`FAQsSection.tsx`) - Still uses existing direct search
3. ✅ Program Page Searches - All program pages maintain their existing search
4. ✅ Header Search - Enhanced but non-breaking (opens modal instead of inline)

## File Structure

```
src/lib/search/
├── COMPATIBILITY_MAP.md          # Compatibility audit
├── README.md                      # This file
├── config.ts                      # Feature flags & configuration
├── types.ts                       # TypeScript types
├── index.ts                       # Main exports
├── core/
│   └── SearchEngine.ts            # Core search engine
├── hooks/
│   ├── useSearch.ts               # Search hook
│   └── useAutocomplete.ts         # Autocomplete hook
├── utils/
│   ├── sanitization.ts            # Input sanitization
│   ├── rateLimiting.ts            # Rate limiting
│   ├── caching.ts                 # LRU cache
│   ├── indexing.ts                # Inverted index & Trie
│   ├── relevance.ts               # Relevance scoring
│   ├── synonyms.ts                # Synonym expansion
│   ├── fuzzy.ts                   # Fuzzy matching
│   ├── highlighting.ts            # Result highlighting
│   ├── spellCorrection.ts         # Spell correction
│   └── recentSearches.ts          # Recent searches
└── services/
    └── dataCollection.ts          # Document collection & indexing
```

## Initialization

The search engine is automatically initialized on app startup in `App.tsx`:

```typescript
React.useEffect(() => {
  initializeSearchWithData().catch((error) => {
    console.warn('Failed to initialize search engine:', error);
  });
}, []);
```

This collects and indexes:
- All events from `eventService`
- All FAQs from `faqsPageData`
- All program pages (static metadata)

## Future Enhancements

Ready for implementation (feature-flagged):

1. **Voice Search**: Web Speech API integration
2. **Semantic Search**: Vector embeddings with cosine similarity
3. **Personalization**: User preference-based ranking
4. **Conversational Search**: Multi-turn search queries
5. **Predictive Intent**: ML-based query understanding

## Performance Monitoring

The search system logs:
- Query execution time (`response.took`)
- Cache hit rates (via `getCacheStats()`)
- Rate limit violations (console warnings)

## Testing

To test the enhanced search:

1. Open the app
2. Press `Cmd+K` (or `Ctrl+K`) to open search modal
3. Type a query (e.g., "yoga", "meditation", "happiness")
4. See autocomplete suggestions
5. View highlighted results
6. Click a result to navigate

All existing search implementations should continue working as before.

## Support

For issues or questions:
1. Check `COMPATIBILITY_MAP.md` for existing search behavior
2. Review feature flags in `config.ts`
3. Check browser console for warnings/errors
