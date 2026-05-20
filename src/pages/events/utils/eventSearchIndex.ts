/**
 * Events listing search — weighted fuzzy match + deep full-text catch-all.
 * New Event fields (strings, numbers, nested objects) are picked up automatically
 * via `fullBlob`; important facets stay weighted for ranking quality.
 */

import Fuse from 'fuse.js';
import type { Event } from '@/pages/events/types';

export interface EventSearchRecord {
  id: string;
  event: Event;
  title: string;
  description: string;
  shortDescription: string;
  tagsStr: string;
  locationStr: string;
  speakersStr: string;
  programsStr: string;
  highlightsStr: string;
  keywordsStr: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  datesStr: string;
  timelineStr: string;
  /** Entire event serialized to searchable text — future-proof for CMS / new keys */
  fullBlob: string;
}

const MAX_DEPTH = 16;

/**
 * Recursively join all primitive values from an arbitrary structure into one search string.
 * Skips functions / symbols; new Event properties are included without code changes.
 */
export function collectDeepSearchText(value: unknown, depth = 0): string {
  if (depth > MAX_DEPTH) return '';
  if (value == null) return '';
  const t = typeof value;
  if (t === 'string') return value;
  if (t === 'number' || t === 'boolean') return String(value);
  if (Array.isArray(value)) {
    return value.map((v) => collectDeepSearchText(v, depth + 1)).filter(Boolean).join(' ');
  }
  if (t === 'object') {
    return Object.values(value as Record<string, unknown>)
      .map((v) => collectDeepSearchText(v, depth + 1))
      .filter(Boolean)
      .join(' ');
  }
  return '';
}

function buildLocationLine(loc: Event['location']): string {
  if (!loc) return '';
  return [loc.name, loc.address, loc.city, loc.country].filter(Boolean).join(' ');
}

function buildTimelineStr(timeline: Event['timeline']): string {
  if (!timeline?.length) return '';
  return timeline
    .map((slot) =>
      [slot.title, slot.description, slot.location, slot.date, slot.time, slot.timezone].filter(Boolean).join(' ')
    )
    .join(' ');
}

export function buildEventSearchRecord(event: Event): EventSearchRecord {
  const tagsStr = event.tags?.join(' ') ?? '';
  const speakersStr = event.speakers?.join(' ') ?? '';
  const programsStr = event.programs?.join(' ') ?? '';
  const highlightsStr = event.highlights?.join(' ') ?? '';
  const keywordsStr = event.keywords?.join(' ') ?? '';
  const datesStr = [
    event.startDate,
    event.endDate,
    event.ongoingFrom,
    event.ongoingUntil,
    event.timezone,
  ]
    .filter(Boolean)
    .join(' ');

  const fullBlob = collectDeepSearchText(event);

  return {
    id: event.id,
    event,
    title: event.title,
    description: event.description,
    shortDescription: event.shortDescription ?? '',
    tagsStr,
    locationStr: buildLocationLine(event.location),
    speakersStr,
    programsStr,
    highlightsStr,
    keywordsStr,
    metaTitle: event.metaTitle ?? '',
    metaDescription: event.metaDescription ?? '',
    slug: event.slug,
    datesStr,
    timelineStr: buildTimelineStr(event.timeline),
    fullBlob,
  };
}

const FUSE_KEYS: Fuse.IFuseOptions<EventSearchRecord>['keys'] = [
  { name: 'title', weight: 0.28 },
  { name: 'shortDescription', weight: 0.1 },
  { name: 'description', weight: 0.12 },
  { name: 'tagsStr', weight: 0.1 },
  { name: 'locationStr', weight: 0.1 },
  { name: 'speakersStr', weight: 0.06 },
  { name: 'programsStr', weight: 0.05 },
  { name: 'highlightsStr', weight: 0.04 },
  { name: 'keywordsStr', weight: 0.04 },
  { name: 'metaTitle', weight: 0.02 },
  { name: 'metaDescription', weight: 0.02 },
  { name: 'slug', weight: 0.02 },
  { name: 'datesStr', weight: 0.03 },
  { name: 'timelineStr', weight: 0.02 },
  { name: 'fullBlob', weight: 0.1 },
];

const fuseOptions: Fuse.IFuseOptions<EventSearchRecord> = {
  keys: FUSE_KEYS,
  threshold: 0.38,
  ignoreLocation: true,
  minMatchCharLength: 1,
  includeScore: true,
};

function tokenFallbackMatch(events: Event[], q: string): Event[] {
  const tokens = q
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  if (tokens.length === 0) return events;

  return events.filter((e) => {
    const blob = buildEventSearchRecord(e).fullBlob.toLowerCase();
    return tokens.every((t) => blob.includes(t));
  });
}

/** Returns events that match the query (fuzzy + deep text); empty query returns input unchanged. */
export function filterEventsBySearch(events: Event[], query: string): Event[] {
  const q = query.trim();
  if (!q) return events;

  const records = events.map(buildEventSearchRecord);
  const fuse = new Fuse(records, fuseOptions);
  const ranked = fuse.search(q);
  if (ranked.length > 0) {
    return ranked.map((r) => r.item.event);
  }

  return tokenFallbackMatch(events, q);
}

/** Top matches for autocomplete (same scoring as filter). */
export function searchEventsForSuggestions(events: Event[], query: string, limit = 8): Event[] {
  const q = query.trim();
  if (!q) return [];

  const records = events.map(buildEventSearchRecord);
  const fuse = new Fuse(records, fuseOptions);
  const ranked = fuse.search(q);
  if (ranked.length > 0) {
    return ranked.slice(0, limit).map((r) => r.item.event);
  }

  return tokenFallbackMatch(events, q).slice(0, limit);
}
