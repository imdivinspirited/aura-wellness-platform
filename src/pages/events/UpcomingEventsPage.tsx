import { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { allEvents } from './data/events';
import { EventFiltersComponent } from './components/EventFilters';
import { EventList } from './components/EventList';
import { filterEventsByCategory, sortEventsByDate } from './utils/eventCategorization';
import type { Event, EventFilters } from './types';

/**
 * Upcoming Events Page
 *
 * Displays all upcoming events with filtering, search, and sorting.
 * Events are automatically categorized based on their start dates.
 *
 * Features:
 * - Automatic event categorization
 * - Advanced filtering
 * - Search functionality
 * - Admin controls (move to past)
 * - Responsive design
 * - SEO optimized
 */
const UpcomingEventsPage = () => {
  const [filters, setFilters] = useState<EventFilters>({});
  const [isLoading, setIsLoading] = useState(false);

  // Get upcoming events (with automatic categorization)
  const upcomingEvents = useMemo(() => {
    const filtered = filterEventsByCategory(allEvents, 'upcoming');
    return sortEventsByDate(filtered, 'asc');
  }, []);

  // Apply filters
  const filteredEvents = useMemo(() => {
    let filtered = [...upcomingEvents];

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
  }, [upcomingEvents, filters]);

  // Extract available filter options
  const availableLocations = useMemo(() => {
    const locations = new Set<string>();
    upcomingEvents.forEach((event) => {
      if (event.location.city) locations.add(event.location.city);
      if (event.location.country) locations.add(event.location.country);
    });
    return Array.from(locations).sort();
  }, [upcomingEvents]);

  const availableLanguages = useMemo(() => {
    const languages = new Set<string>();
    upcomingEvents.forEach((event) => {
      event.languages.forEach((lang) => languages.add(lang));
    });
    return Array.from(languages).sort();
  }, [upcomingEvents]);

  // Handle move to past (admin action)
  const handleMoveToPast = async (eventId: string, reason?: string) => {
    try {
      // In production, this would call an API endpoint
      const { moveEventToPast } = await import('./services/eventService');
      await moveEventToPast(eventId, reason);

      // In production, refresh the events list from API
      // For now, we'll show a success message
      // The page would need to be refreshed to see the change
      alert(`Event moved to past successfully. Page will refresh to show updated list.`);
      window.location.reload();
    } catch (error) {
      console.error('Failed to move event:', error);
      throw error; // Let the modal handle the error display
    }
  };

  useEffect(() => {
    // Update document title
    const originalTitle = document.title;
    document.title = 'Upcoming Events | Art of Living Foundation';

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
            Upcoming Events
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Discover upcoming festivals, programs, and celebrations. Join us for transformative experiences.
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
          onMoveToPast={handleMoveToPast}
          showAdminControls={true} // Enable admin controls
        />
      </div>
    </MainLayout>
  );
};

export default UpcomingEventsPage;
