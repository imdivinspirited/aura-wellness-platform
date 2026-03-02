/**
 * Events System - Type Definitions
 *
 * Centralized type definitions for the Events system.
 * Designed for scalability and future CMS integration.
 */

export type EventCategory = 'upcoming' | 'ongoing' | 'past';

export type EventStatus = 'upcoming' | 'ongoing' | 'past' | 'cancelled';

export interface EventStats {
  attendees?: number;
  countries?: number;
  performers?: number;
  sessions?: number;
  languages?: number;
}

export interface EventMedia {
  banner: string;
  thumbnail?: string;
  gallery?: string[];
  videos?: string[];
  audio?: string[];
}

export interface EventCTA {
  label: string;
  link: string;
  external?: boolean;
  openInNewTab?: boolean;
  disabled?: boolean;
}

export interface EventLocation {
  name: string;
  address?: string;
  city?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  online?: boolean;
  hybrid?: boolean;
}

export interface EventTimeline {
  date: string; // ISO date
  time: string; // HH:MM format
  timezone: string;
  title: string;
  description?: string;
  location?: string;
}

/**
 * Main Event Interface
 *
 * This is the core data model for all events in the system.
 * Designed to support:
 * - Automatic categorization based on dates
 * - Manual admin overrides
 * - Rich media content
 * - Multi-language support
 * - Analytics and tracking
 * - Future ticketing integration
 */
export interface Event {
  // Core Identifiers
  id: string; // Unique identifier (UUID recommended)
  title: string; // Event title
  slug: string; // URL-friendly identifier
  description: string; // Full event description
  shortDescription?: string; // Brief summary for cards

  // Categorization
  category: EventCategory; // Current category (can be manually overridden)
  status: EventStatus; // Event status
  tags?: string[]; // For filtering and search

  // Dates & Time
  startDate: string; // ISO 8601 date string
  endDate: string; // ISO 8601 date string
  timezone: string; // IANA timezone (e.g., 'Asia/Kolkata')
  isAllDay?: boolean; // For all-day events
  timeline?: EventTimeline[]; // Detailed schedule

  // Location & Language
  location: EventLocation;
  languages: string[]; // Supported languages

  // Content
  highlights?: string[]; // Key highlights/bullet points
  speakers?: string[]; // Featured speakers/teachers
  programs?: string[]; // Related programs

  // Statistics
  stats?: EventStats;

  // Media
  media: EventMedia;

  // Call to Action
  cta: EventCTA;

  // Live Status
  isLive?: boolean; // Currently live/streaming
  liveStreamUrl?: string; // Live stream URL if applicable

  // Admin & Metadata
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  createdBy?: string; // Admin ID who created
  updatedBy?: string; // Admin ID who last updated
  manualOverride?: boolean; // If admin manually changed category
  overrideReason?: string; // Reason for manual override

  // SEO & Analytics
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];

  // Future Extensions
  ticketing?: {
    enabled: boolean;
    url?: string;
    price?: number;
    currency?: string;
  };
  donations?: {
    enabled: boolean;
    url?: string;
  };
}

/**
 * Event Filter Options
 * Used for filtering events on each page
 */
export interface EventFilters {
  dateRange?: {
    start?: string;
    end?: string;
  };
  location?: string;
  language?: string;
  tags?: string[];
  searchQuery?: string;
  sort?: EventSortOption;
}

/**
 * Event Sort Options
 */
export type EventSortOption =
  | 'date-asc'
  | 'date-desc'
  | 'title-asc'
  | 'title-desc'
  | 'relevance';

/**
 * Pagination Metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Event List Response
 * Structure for paginated event lists
 */
export interface EventListResponse {
  events: Event[];
  pagination: PaginationMeta;
  filters?: EventFilters;
}

/**
 * Admin Action Types
 */
export type AdminAction = 'move-to-past' | 'move-to-upcoming' | 'move-to-ongoing' | 'delete' | 'update';

export interface AdminActionLog {
  id: string;
  eventId: string;
  action: AdminAction;
  adminId: string;
  timestamp: string;
  reason?: string;
  ipAddress?: string;
}
