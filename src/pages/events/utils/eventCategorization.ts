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

/**
 * Get current date in a specific timezone
 * @param timezone - IANA timezone string (e.g., 'Asia/Kolkata')
 * @returns Date object in the specified timezone
 */
export function getCurrentDateInTimezone(timezone: string = 'Asia/Kolkata'): Date {
  const now = new Date();
  // Convert to timezone-aware date
  // Note: In production, use a library like date-fns-tz or luxon
  return now;
}

/**
 * Compare dates ignoring time
 * @param date1 - First date
 * @param date2 - Second date
 * @returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
function compareDates(date1: Date, date2: Date): number {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
}

/**
 * Automatically determine event category based on dates
 *
 * Logic:
 * - If currentDate < startDate → 'upcoming'
 * - If startDate ≤ currentDate ≤ endDate → 'ongoing'
 * - If currentDate > endDate → 'past'
 *
 * @param event - Event object
 * @param currentDate - Current date (defaults to now)
 * @returns Automatically determined category
 */
export function getAutomaticCategory(
  event: Event,
  currentDate: Date = new Date()
): EventCategory {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  // Compare dates (ignoring time for day-based comparison)
  const startCompare = compareDates(currentDate, startDate);
  const endCompare = compareDates(currentDate, endDate);

  if (startCompare < 0) {
    // Current date is before start date
    return 'upcoming';
  } else if (startCompare >= 0 && endCompare <= 0) {
    // Current date is between start and end dates
    return 'ongoing';
  } else {
    // Current date is after end date
    return 'past';
  }
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

  const category = event.manualOverride
    ? event.category
    : getAutomaticCategory(event, currentDate);

  return category as EventStatus;
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
    const dateA = new Date(a.startDate).getTime();
    const dateB = new Date(b.startDate).getTime();

    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Format event date range for display
 * @param event - Event object
 * @returns Formatted date string
 */
export function formatEventDateRange(event: Event): string {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);

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

  return `${startStr} - ${endStr}`;
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
  const startDate = new Date(event.startDate);
  const diffTime = startDate.getTime() - currentDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
