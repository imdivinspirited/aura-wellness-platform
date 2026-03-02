import { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { allEvents } from './data/events';
import { EventFiltersComponent } from './components/EventFilters';
import { EventList } from './components/EventList';
import { filterEventsByCategory, sortEventsByDate } from './utils/eventCategorization';
import type { Event, EventFilters } from './types';

/**
 * Past Events Page
 *
 * Displays archived past events in a timeline format.
 * Events are automatically categorized based on their end dates.
 *
 * Features:
 * - Chronological display (newest first)
 * - Archive layout
 * - Filtering and search
 * - Historical event highlights
 */
const PastEventsPage = () => {
  const [filters, setFilters] = useState<EventFilters>({});
  const [isLoading, setIsLoading] = useState(false);

  // Get past events (with automatic categorization)
  const pastEvents = useMemo(() => {
    const filtered = filterEventsByCategory(allEvents, 'past');
    return sortEventsByDate(filtered, 'desc'); // Most recent first
  }, []);

  // Apply filters
  const filteredEvents = useMemo(() => {
    let filtered = [...pastEvents];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.shortDescription?.toLowerCase().includes(query) ||
          event.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Location filter
    if (filters.location) {
      if (filters.location === 'online') {
        filtered = filtered.filter((event) => event.location.online);
      } else {
        filtered = filtered.filter(
          (event) =>
            event.location.name?.toLowerCase().includes(filters.location!.toLowerCase()) ||
            event.location.city?.toLowerCase().includes(filters.location!.toLowerCase()) ||
            event.location.country?.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
    }

    // Language filter
    if (filters.language) {
      filtered = filtered.filter((event) =>
        event.languages.includes(filters.language!)
      );
    }

    return filtered;
  }, [pastEvents, filters]);

  // Extract available filter options
  const availableLocations = useMemo(() => {
    const locations = new Set<string>();
    pastEvents.forEach((event) => {
      if (event.location.city) locations.add(event.location.city);
      if (event.location.country) locations.add(event.location.country);
    });
    return Array.from(locations).sort();
  }, [pastEvents]);

  const availableLanguages = useMemo(() => {
    const languages = new Set<string>();
    pastEvents.forEach((event) => {
      event.languages.forEach((lang) => languages.add(lang));
    });
    return Array.from(languages).sort();
  }, [pastEvents]);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'Past Events | Art of Living Foundation';

    return () => {
      document.title = originalTitle;
    };
  }, []);

  return (
    <MainLayout>
      <div className="container py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-light mb-4 text-stone-900">
            Past Events
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore our history of transformative events, festivals, and celebrations from around the world.
          </p>
        </div>

        {/* Filters */}
        <EventFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          availableLocations={availableLocations}
          availableLanguages={availableLanguages}
          totalResults={filteredEvents.length}
        />

        {/* Event List */}
        <EventList
          events={filteredEvents}
          filters={filters}
          isLoading={isLoading}
          showAdminControls={false} // No admin controls on past events
        />
      </div>
    </MainLayout>
  );
};

export default PastEventsPage;
