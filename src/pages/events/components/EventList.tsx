import { useMemo } from 'react';
import { EventCard } from './EventCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import type { Event, EventFilters } from '../types';
import { sortEventsByDate } from '../utils/eventCategorization';

interface EventListProps {
  events: Event[];
  filters?: EventFilters;
  isLoading?: boolean;
  onMoveToPast?: (eventId: string, reason?: string) => Promise<void>;
  showAdminControls?: boolean;
}

/**
 * Event List Component
 *
 * Displays a grid of event cards with filtering and sorting.
 *
 * Features:
 * - Responsive grid layout
 * - Sorting support
 * - Loading states
 * - Empty states
 * - Admin controls
 */
export const EventList = ({
  events,
  filters,
  isLoading = false,
  onMoveToPast,
  showAdminControls = false,
}: EventListProps) => {
  // Apply sorting
  const sortedEvents = useMemo(() => {
    if (!filters?.sort) return events;

    const sortOption = filters.sort;

    if (sortOption === 'date-asc' || sortOption === 'date-desc') {
      return sortEventsByDate(events, sortOption === 'date-asc' ? 'asc' : 'desc');
    }

    if (sortOption === 'title-asc' || sortOption === 'title-desc') {
      return [...events].sort((a, b) => {
        const comparison = a.title.localeCompare(b.title);
        return sortOption === 'title-asc' ? comparison : -comparison;
      });
    }

    return events;
  }, [events, filters?.sort]);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-stone-200">
            <Skeleton className="h-48 w-full rounded-t-lg" />
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sortedEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground mb-2">No events found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sortedEvents.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onMoveToPast={onMoveToPast}
          showAdminControls={showAdminControls}
        />
      ))}
    </div>
  );
};
