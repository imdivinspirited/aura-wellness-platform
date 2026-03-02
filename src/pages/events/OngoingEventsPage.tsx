import { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { allEvents } from './data/events';
import { EventFiltersComponent } from './components/EventFilters';
import { EventList } from './components/EventList';
import { filterEventsByCategory, sortEventsByDate, isEventLive } from './utils/eventCategorization';
import { Badge } from '@/components/ui/badge';
import { Radio as RadioIcon } from 'lucide-react';
import type { Event, EventFilters } from './types';

/**
 * Ongoing Events Page
 *
 * Displays all currently ongoing events with live indicators.
 * Events are automatically categorized based on current date.
 *
 * Features:
 * - Live event indicators
 * - Real-time status updates
 * - Filtering and search
 * - Admin controls
 */
const OngoingEventsPage = () => {
  const [filters, setFilters] = useState<EventFilters>({});
  const [isLoading, setIsLoading] = useState(false);

  // Get ongoing events (with automatic categorization)
  const ongoingEvents = useMemo(() => {
    const filtered = filterEventsByCategory(allEvents, 'ongoing');
    return sortEventsByDate(filtered, 'desc'); // Most recent first
  }, []);

  // Separate live events
  const liveEvents = useMemo(() => {
    return ongoingEvents.filter((event) => isEventLive(event));
  }, [ongoingEvents]);

  // Apply filters
  const filteredEvents = useMemo(() => {
    let filtered = [...ongoingEvents];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.shortDescription?.toLowerCase().includes(query)
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
            event.location.city?.toLowerCase().includes(filters.location!.toLowerCase())
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
  }, [ongoingEvents, filters]);

  // Extract available filter options
  const availableLocations = useMemo(() => {
    const locations = new Set<string>();
    ongoingEvents.forEach((event) => {
      if (event.location.city) locations.add(event.location.city);
      if (event.location.country) locations.add(event.location.country);
    });
    return Array.from(locations).sort();
  }, [ongoingEvents]);

  const availableLanguages = useMemo(() => {
    const languages = new Set<string>();
    ongoingEvents.forEach((event) => {
      event.languages.forEach((lang) => languages.add(lang));
    });
    return Array.from(languages).sort();
  }, [ongoingEvents]);

  // Handle move to past (admin action)
  const handleMoveToPast = async (eventId: string, reason?: string) => {
    try {
      const { moveEventToPast } = await import('./services/eventService');
      await moveEventToPast(eventId, reason);
      alert(`Event moved to past successfully. Page will refresh to show updated list.`);
      window.location.reload();
    } catch (error) {
      console.error('Failed to move event:', error);
      throw error;
    }
  };

  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'Ongoing Events | Art of Living Foundation';

    return () => {
      document.title = originalTitle;
    };
  }, []);

  return (
    <MainLayout>
      <div className="container py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="font-display text-4xl md:text-5xl font-light text-stone-900">
              Ongoing Events
            </h1>
            {liveEvents.length > 0 && (
              <Badge className="bg-red-500 text-white animate-pulse">
                <RadioIcon className="mr-2 h-3 w-3" />
                {liveEvents.length} Live
              </Badge>
            )}
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Events currently happening now. Join live sessions and participate in real-time.
          </p>
        </div>

        {/* Live Events Banner */}
        {liveEvents.length > 0 && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <RadioIcon className="h-5 w-5 text-red-600 animate-pulse" />
              <h2 className="font-semibold text-red-900">Live Now</h2>
            </div>
            <p className="text-sm text-red-800">
              {liveEvents.length} event{liveEvents.length > 1 ? 's' : ''} currently live
            </p>
          </div>
        )}

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
          showAdminControls={true}
        />
      </div>
    </MainLayout>
  );
};

export default OngoingEventsPage;
