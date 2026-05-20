/**
 * Event Categorization Utilities
 *
 * Automatically categorizes events based on current date and event dates.
 * Supports manual admin overrides.
 *
 * Time Complexity: O(1) per event
 * Space Complexity: O(1)
 */

import type { Event, EventCategory, EventStatus } from '../types';

const DEFAULT_PAST_GRACE_H = 24;

/**
 * Logical window for “is this programme still running?” — Navratri 9 days, May-long birthday arc, or plain start/end.
 */
export function getOngoingWindowBounds(event: Event): { startMs: number; endMs: number } {
  const startIso = event.ongoingFrom ?? event.startDate;
  const endIso = event.ongoingUntil ?? event.endDate;
  return {
    startMs: new Date(startIso).getTime(),
    endMs: new Date(endIso).getTime(),
  };
}

export function getPastGraceMs(event: Event): number {
  const h = event.pastGraceHours ?? DEFAULT_PAST_GRACE_H;
  return Math.max(0, h) * 60 * 60 * 1000;
}

/**
 * Automatically determine event category.
 *
 * - **upcoming:** now &lt; ongoing start
 * - **ongoing:** from start through (end + grace) — includes a default 24h buffer after the run ends
 *   so short programmes don’t flip to Archive instantly; override with `pastGraceHours`
 * - **past:** now &gt; end + grace
 *
 * Use `ongoingFrom` / `ongoingUntil` when the visible “run” is longer than the focal `startDate`–`endDate`
 * (e.g. birthday month with main day on 13 May).
 */
export function getAutomaticCategory(
  event: Event,
  currentDate: Date = new Date()
): EventCategory {
  const { startMs, endMs } = getOngoingWindowBounds(event);
  const grace = getPastGraceMs(event);
  const now = currentDate.getTime();

  if (now < startMs) return 'upcoming';
  if (now <= endMs + grace) return 'ongoing';
  return 'past';
}

/**
 * Category shown in UI: respects `manualOverride` + stored category, else automatic dates.
 */
export function getEffectiveCategory(
  event: Event,
  currentDate: Date = new Date()
): EventCategory {
  if (event.manualOverride) {
    return event.category;
  }
  return getAutomaticCategory(event, currentDate);
}

/**
 * Get event status (includes cancelled status)
 * @param event - Event object
 * @param currentDate - Current date
 * @returns Event status
 */
export function getEventStatus(
  event: Event,
  currentDate: Date = new Date()
): EventStatus {
  if (event.status === 'cancelled') {
    return 'cancelled';
  }

  return getEffectiveCategory(event, currentDate) as EventStatus;
}

/**
 * Check if event is currently live/ongoing
 * @param event - Event object
 * @param currentDate - Current date
 * @returns True if event is currently ongoing
 */
export function isEventLive(
  event: Event,
  currentDate: Date = new Date()
): boolean {
  if (event.isLive === true) {
    return true;
  }

  const status = getEventStatus(event, currentDate);
  return status === 'ongoing';
}

/**
 * Filter events by category
 * Uses automatic categorization unless manual override exists
 *
 * @param events - Array of events
 * @param category - Target category
 * @param currentDate - Current date for comparison
 * @returns Filtered events
 */
export function filterEventsByCategory(
  events: Event[],
  category: EventCategory,
  currentDate: Date = new Date()
): Event[] {
  return events.filter((event) => {
    // If manual override exists, use the stored category
    if (event.manualOverride) {
      return event.category === category;
    }

    // Otherwise, use automatic categorization
    const autoCategory = getAutomaticCategory(event, currentDate);
    return autoCategory === category;
  });
}

/**
 * Sort events by date (ascending or descending)
 *
 * Time Complexity: O(n log n) - standard sort
 *
 * @param events - Array of events
 * @param order - 'asc' or 'desc'
 * @returns Sorted events
 */
export function sortEventsByDate(
  events: Event[],
  order: 'asc' | 'desc' = 'asc'
): Event[] {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.ongoingFrom ?? a.startDate).getTime();
    const dateB = new Date(b.ongoingFrom ?? b.startDate).getTime();

    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Format event date range for display
 * @param event - Event object
 * @returns Formatted date string
 */
export function formatEventDateRange(event: Event): string {
  const start = new Date(event.ongoingFrom ?? event.startDate);
  const end = new Date(event.ongoingUntil ?? event.endDate);

  const startStr = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const endStr = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (startStr === endStr) {
    return startStr;
  }

  return `${startStr} – ${endStr}`;
}

/**
 * Get days until event starts (or days since ended)
 * @param event - Event object
 * @param currentDate - Current date
 * @returns Number of days (negative if past)
 */
export function getDaysUntilEvent(
  event: Event,
  currentDate: Date = new Date()
): number {
  const startDate = new Date(event.ongoingFrom ?? event.startDate);
  const diffTime = startDate.getTime() - currentDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Single “hero” event for listing spotlight: prefer ongoing (soonest end), else nearest upcoming.
 */
export function getSpotlightEvent(
  events: Event[],
  currentDate: Date = new Date()
): Event | null {
  const ongoing = filterEventsByCategory(events, 'ongoing', currentDate);
  if (ongoing.length) {
    return sortEventsByDate(ongoing, 'asc')[0];
  }
  const upcoming = filterEventsByCategory(events, 'upcoming', currentDate);
  if (!upcoming.length) return null;
  return sortEventsByDate(upcoming, 'asc')[0];
}
