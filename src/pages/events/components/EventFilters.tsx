import { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useDebouncedCallback } from '@/lib/utils';
import type { EventFilters, EventSortOption } from '../types';

interface EventFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  availableLocations: string[];
  availableLanguages: string[];
  totalResults: number;
}

/**
 * Event Filters Component
 *
 * Provides filtering and search functionality for events.
 * Features:
 * - Debounced search
 * - Location filter
 * - Language filter
 * - Sort options
 * - Active filter indicators
 * - Responsive design
 */
export const EventFiltersComponent = ({
  filters,
  onFiltersChange,
  availableLocations,
  availableLanguages,
  totalResults,
}: EventFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');

  // Debounced search to avoid excessive filtering
  const debouncedSearch = useDebouncedCallback(
    (query: string) => {
      onFiltersChange({ ...filters, searchQuery: query });
    },
    300
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleLocationChange = (location: string) => {
    onFiltersChange({
      ...filters,
      location: location === 'all' ? undefined : location,
    });
  };

  const handleLanguageChange = (language: string) => {
    onFiltersChange({
      ...filters,
      language: language === 'all' ? undefined : language,
    });
  };

  const handleSortChange = (sort: string) => {
    onFiltersChange({
      ...filters,
      sort: sort as EventSortOption,
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    onFiltersChange({});
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.searchQuery ||
      filters.location ||
      filters.language ||
      filters.sort
    );
  }, [filters]);

  return (
    <div className="space-y-4 mb-8">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
          aria-label="Search events"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Location Filter */}
        <div className="flex-1 min-w-[150px]">
          <label className="text-xs text-muted-foreground mb-1 block">Location</label>
          <Select
            value={filters.location || 'all'}
            onValueChange={handleLocationChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              {availableLocations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Language Filter */}
        <div className="flex-1 min-w-[150px]">
          <label className="text-xs text-muted-foreground mb-1 block">Language</label>
          <Select
            value={filters.language || 'all'}
            onValueChange={handleLanguageChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Languages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {availableLanguages.map((language) => (
                <SelectItem key={language} value={language}>
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="flex-1 min-w-[150px]">
          <label className="text-xs text-muted-foreground mb-1 block">Sort</label>
          <Select
            value={filters.sort || 'date-asc'}
            onValueChange={handleSortChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-asc">Date (Earliest)</SelectItem>
              <SelectItem value="date-desc">Date (Latest)</SelectItem>
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters & Results Count */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {hasActiveFilters && (
            <>
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {filters.searchQuery && (
                <Badge variant="secondary">
                  Search: {filters.searchQuery}
                  <button
                    onClick={() => handleSearchChange('')}
                    className="ml-2 hover:text-destructive"
                    aria-label="Remove search filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.location && (
                <Badge variant="secondary">
                  Location: {filters.location}
                  <button
                    onClick={() => handleLocationChange('all')}
                    className="ml-2 hover:text-destructive"
                    aria-label="Remove location filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.language && (
                <Badge variant="secondary">
                  Language: {filters.language}
                  <button
                    onClick={() => handleLanguageChange('all')}
                    className="ml-2 hover:text-destructive"
                    aria-label="Remove language filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {totalResults} {totalResults === 1 ? 'event' : 'events'}
        </p>
      </div>
    </div>
  );
};
