/**
 * Event Service
 *
 * Handles event operations including admin actions.
 * In production, this would communicate with a backend API.
 *
 * This service abstracts the data layer and provides:
 * - Event CRUD operations
 * - Admin actions (move to past, etc.)
 * - Data persistence
 * - Cache management
 */

import type { Event, AdminAction } from '../types';
import { allEvents } from '../data/events';
import { logAdminAction } from '../admin/adminAuth';

const EVENT_OVERRIDES_KEY = 'aura-events-overrides-v1';

type EventOverride = Partial<Event> & {
  id: string;
  updatedAt: string;
  manualOverride?: boolean;
};

function loadOverrides(): Record<string, EventOverride> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(EVENT_OVERRIDES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, EventOverride>;
  } catch {
    return {};
  }
}

function saveOverrides(overrides: Record<string, EventOverride>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(EVENT_OVERRIDES_KEY, JSON.stringify(overrides));
}

/**
 * Move event to past category
 *
 * ⚠️ PRODUCTION NOTE:
 * This should call a secure backend API endpoint that:
 * 1. Verifies admin authentication
 * 2. Updates the database
 * 3. Invalidates cache
 * 4. Returns updated event
 *
 * @param eventId - Event ID to move
 * @param reason - Reason for moving (for audit log)
 * @param adminId - Admin ID performing the action
 * @returns Updated event
 */
export async function moveEventToPast(
  eventId: string,
  reason?: string,
  adminId?: string
): Promise<Event> {
  // In production, this would be:
  // const response = await fetch(`/api/events/${eventId}/move-to-past`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${adminToken}`,
  //   },
  //   body: JSON.stringify({ reason }),
  // });
  // if (!response.ok) throw new Error('Failed to move event');
  // return response.json();

  // Find event
  const event = allEvents.find((e) => e.id === eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  // Log admin action
  if (adminId) {
    logAdminAction(adminId, 'move-to-past', eventId, {
      eventTitle: event.title,
      reason: reason || 'No reason provided',
      previousCategory: event.category,
    });
  }

  // Update event (in production, this would be done on the server)
  const updatedEvent: Event = {
    ...event,
    category: 'past',
    status: 'past',
    manualOverride: true,
    overrideReason: reason,
    updatedAt: new Date().toISOString(),
    updatedBy: adminId,
  };

  // Persist override locally (backend-ready: replace with secure API + DB persistence)
  const overrides = loadOverrides();
  overrides[eventId] = {
    ...overrides[eventId],
    ...updatedEvent,
    id: eventId,
    manualOverride: true,
    updatedAt: updatedEvent.updatedAt,
  };
  saveOverrides(overrides);

  console.log('[Event Service] Event moved to past:', {
    eventId,
    title: event.title,
    reason,
    adminId,
  });

  return updatedEvent;
}

/**
 * Get all events
 * In production, this would fetch from API with caching
 */
export async function getAllEvents(): Promise<Event[]> {
  // In production:
  // const response = await fetch('/api/events');
  // return response.json();

  // Merge persisted overrides on top of base events
  const overrides = loadOverrides();
  if (!overrides || Object.keys(overrides).length === 0) return allEvents;

  return allEvents.map((e) => {
    const override = overrides[e.id];
    return override ? ({ ...e, ...override } as Event) : e;
  });
}

/**
 * Get events by category
 * @param category - Event category
 */
export async function getEventsByCategory(
  category: 'upcoming' | 'ongoing' | 'past'
): Promise<Event[]> {
  const events = await getAllEvents();
  const { filterEventsByCategory } = require('../utils/eventCategorization');
  return filterEventsByCategory(events, category);
}

/**
 * Get event by ID
 * @param eventId - Event ID
 */
export async function getEventById(eventId: string): Promise<Event | null> {
  const events = await getAllEvents();
  return events.find((e) => e.id === eventId) || null;
}

/**
 * Search events
 * @param query - Search query
 * @param filters - Additional filters
 */
export async function searchEvents(
  query: string,
  filters?: {
    category?: 'upcoming' | 'ongoing' | 'past';
    location?: string;
    language?: string;
  }
): Promise<Event[]> {
  const events = await getAllEvents();

  let filtered = events;

  // Apply category filter
  if (filters?.category) {
    const { filterEventsByCategory } = require('../utils/eventCategorization');
    filtered = filterEventsByCategory(filtered, filters.category);
  }

  // Apply search query
  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(
      (event) =>
        event.title.toLowerCase().includes(lowerQuery) ||
        event.description.toLowerCase().includes(lowerQuery) ||
        event.shortDescription?.toLowerCase().includes(lowerQuery) ||
        event.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Apply location filter
  if (filters?.location) {
    filtered = filtered.filter((event) =>
      event.location.name?.toLowerCase().includes(filters.location!.toLowerCase()) ||
      event.location.city?.toLowerCase().includes(filters.location!.toLowerCase())
    );
  }

  // Apply language filter
  if (filters?.language) {
    filtered = filtered.filter((event) =>
      event.languages.includes(filters.language!)
    );
  }

  return filtered;
}
