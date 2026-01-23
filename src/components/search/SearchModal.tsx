/**
 * Enhanced Search Modal
 *
 * A comprehensive search modal with:
 * - Autocomplete
 * - Recent searches
 * - Search results
 * - Keyboard navigation
 * - Accessibility
 *
 * This component enhances the existing Header search without breaking it.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Loader2,
  ArrowRight,
  Command,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSearch } from '@/lib/search/hooks/useSearch';
import { useAutocomplete } from '@/lib/search/hooks/useAutocomplete';
import { highlightInReact } from '@/lib/search/utils/highlighting';
import { getRecentSearches } from '@/lib/search/utils/recentSearches';
import type { SearchResult } from '@/lib/search/types';

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showResults, setShowResults] = useState(false);

  const handleResultsChange = useCallback((results: any[]) => {
    setShowResults(results.length > 0);
  }, []);

  const { query, setQuery, results, isLoading, clear, response } = useSearch({
    debounceMs: 300,
    onResultsChange: handleResultsChange,
  });

  const {
    suggestions,
    setQuery: setAutocompleteQuery,
    clear: clearAutocomplete,
  } = useAutocomplete({
    debounceMs: 200,
    maxSuggestions: 5,
    enableRecent: true,
  });

  // Sync autocomplete with search query
  useEffect(() => {
    setAutocompleteQuery(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]); // setAutocompleteQuery is stable from useAutocomplete

  // Focus input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      clear();
      clearAutocomplete();
      setSelectedIndex(-1);
      setShowResults(false);
    }
  }, [open, clear, clearAutocomplete]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const totalItems = showResults
        ? results.length
        : suggestions.length;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        if (showResults && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        } else if (suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex].text);
        }
      } else if (e.key === 'Escape') {
        onOpenChange(false);
      }
    },
    [selectedIndex, showResults, results, suggestions, onOpenChange]
  );

  const handleResultClick = useCallback(
    (result: SearchResult) => {
      navigate(result.url);
      onOpenChange(false);
      clear();
    },
    [navigate, onOpenChange, clear]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setQuery(suggestion);
      inputRef.current?.focus();
    },
    [setQuery]
  );

  const recentSearches = getRecentSearches(5);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Search Input */}
        <div className="relative border-b">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search programs, events, services..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 pl-10 pr-10 h-14 text-base focus-visible:ring-0"
            aria-label="Search"
            aria-autocomplete="list"
            aria-expanded={showResults || suggestions.length > 0}
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={clear}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Content Area */}
        <div className="max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-12"
              >
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </motion.div>
            )}

            {!isLoading && showResults && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 space-y-2"
              >
                <div className="text-xs text-muted-foreground mb-2">
                  {response?.total} {response?.total === 1 ? 'result' : 'results'}
                  {response?.took && ` in ${response.took}ms`}
                </div>
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg hover:bg-accent transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-primary',
                      selectedIndex === index && 'bg-accent'
                    )}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {highlightInReact(result.title, query)}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {result.type}
                          </Badge>
                        </div>
                        {result.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {highlightInReact(result.description, query)}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {!isLoading && !showResults && query.length === 0 && recentSearches.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4"
              >
                <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Recent Searches
                </div>
                <div className="space-y-1">
                  {recentSearches.map((recent, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(recent.query)}
                      className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors text-sm"
                    >
                      {recent.query}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {!isLoading && !showResults && query.length > 0 && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 space-y-1"
              >
                <div className="text-xs text-muted-foreground mb-2">Suggestions</div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className={cn(
                      'w-full text-left p-2 rounded-md hover:bg-accent transition-colors text-sm flex items-center gap-2',
                      selectedIndex === index && 'bg-accent'
                    )}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    {suggestion.type === 'recent' ? (
                      <Clock className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span>{suggestion.text}</span>
                  </button>
                ))}
              </motion.div>
            )}

            {!isLoading && !showResults && query.length > 0 && suggestions.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-12 text-center text-muted-foreground"
              >
                <p className="text-sm">No suggestions found</p>
                <p className="text-xs mt-2">Try searching for programs, events, or FAQs</p>
              </motion.div>
            )}

            {!isLoading && showResults && results.length === 0 && query.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-12 text-center"
              >
                <p className="text-sm text-muted-foreground mb-2">No results found</p>
                <p className="text-xs text-muted-foreground">
                  Try adjusting your search query or{' '}
                  <button
                    onClick={clear}
                    className="text-primary hover:underline"
                  >
                    clear your search
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd>
              Close
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Command className="h-3 w-3" />
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">K</kbd>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
