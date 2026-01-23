/**
 * Events Data
 *
 * Centralized event data for the Art of Living Events system.
 * In production, this would be fetched from a CMS or database.
 *
 * Events are organized by their natural category but will be
 * automatically re-categorized based on dates.
 */

import type { Event } from '../types';

/**
 * All Events Database
 *
 * This is the single source of truth for all events.
 * Events are stored here and automatically categorized
 * based on their dates when displayed.
 */
export const allEvents: Event[] = [
  // ==================== UPCOMING EVENTS ====================
  {
    id: 'shivratri-2026',
    title: 'Maha Shivratri Celebrations 2026',
    slug: 'maha-shivratri-2026',
    description: 'Join millions worldwide in celebrating Maha Shivratri, a night of deep meditation, devotion, and transformation. Experience powerful meditations, spiritual discourses, and the divine energy of this auspicious occasion.',
    shortDescription: 'A night of deep meditation and devotion celebrating Lord Shiva',
    category: 'upcoming',
    status: 'upcoming',
    tags: ['festival', 'meditation', 'spiritual', 'celebration'],
    startDate: '2026-02-26T18:00:00+05:30',
    endDate: '2026-02-27T06:00:00+05:30',
    timezone: 'Asia/Kolkata',
    isAllDay: false,
    location: {
      name: 'Art of Living International Center',
      address: '21st Km, Kanakapura Road',
      city: 'Bangalore',
      country: 'India',
      online: true,
      hybrid: true,
    },
    languages: ['English', 'Hindi', 'Sanskrit'],
    highlights: [
      'All-night meditation and chanting',
      'Special discourse by Gurudev',
      'Live webcast for global participation',
      'Powerful group meditations',
    ],
    stats: {
      attendees: 5000000, // Expected
      countries: 180,
    },
    media: {
      banner: '/images/events/shivratri-banner.jpg',
      thumbnail: '/images/events/shivratri-thumb.jpg',
      gallery: [],
      videos: [],
    },
    cta: {
      label: 'Join the Celebration',
      link: '/events/shivratri-2026',
      external: false,
    },
    isLive: false,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'gurudev-birthday-2026',
    title: 'Gurudev Sri Sri Ravi Shankar\'s Birthday Celebration',
    slug: 'gurudev-birthday-2026',
    description: 'Celebrate the birthday of our beloved Gurudev Sri Sri Ravi Shankar on May 13th. Join us for special programs, meditations, and service activities honoring his life and teachings.',
    shortDescription: 'Celebrating Gurudev\'s birthday with special programs and service',
    category: 'upcoming',
    status: 'upcoming',
    tags: ['celebration', 'birthday', 'service', 'meditation'],
    startDate: '2026-05-13T06:00:00+05:30',
    endDate: '2026-05-13T23:59:59+05:30',
    timezone: 'Asia/Kolkata',
    isAllDay: true,
    location: {
      name: 'Global Celebration',
      online: true,
      hybrid: true,
    },
    languages: ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Marathi'],
    highlights: [
      'Special birthday meditation',
      'Service projects worldwide',
      'Global webcast',
      'Community celebrations',
    ],
    stats: {
      attendees: 10000000, // Expected
      countries: 180,
    },
    media: {
      banner: '/images/events/gurudev-birthday-banner.jpg',
      thumbnail: '/images/events/gurudev-birthday-thumb.jpg',
    },
    cta: {
      label: 'Participate',
      link: '/events/gurudev-birthday-2026',
    },
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'world-meditation-day-2026',
    title: 'World Meditation Day 2026',
    slug: 'world-meditation-day-2026',
    description: 'Join the global meditation movement on World Meditation Day. Millions come together to meditate simultaneously, creating a wave of peace and positivity across the planet.',
    shortDescription: 'Global synchronized meditation for world peace',
    category: 'upcoming',
    status: 'upcoming',
    tags: ['meditation', 'global', 'peace', 'wellness'],
    startDate: '2026-05-21T12:00:00Z',
    endDate: '2026-05-21T13:00:00Z',
    timezone: 'UTC',
    isAllDay: false,
    location: {
      name: 'Global - Online',
      online: true,
    },
    languages: ['English', 'Hindi', 'Spanish', 'French', 'German', 'Chinese'],
    highlights: [
      'Synchronized global meditation',
      'Live webcast from multiple locations',
      'Guided meditation by Gurudev',
      'Record-breaking participation',
    ],
    stats: {
      attendees: 50000000, // Expected
      countries: 180,
    },
    media: {
      banner: '/images/events/world-meditation-day-banner.jpg',
      thumbnail: '/images/events/world-meditation-day-thumb.jpg',
    },
    cta: {
      label: 'Register Now',
      link: '/events/world-meditation-day-2026',
    },
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'navratri-2026',
    title: 'Navratri Celebrations 2026',
    slug: 'navratri-2026',
    description: 'Celebrate the nine nights of Navratri with special pujas, meditations, and cultural programs. Experience the divine feminine energy and spiritual transformation.',
    shortDescription: 'Nine nights of devotion, meditation, and celebration',
    category: 'upcoming',
    status: 'upcoming',
    tags: ['festival', 'navratri', 'devotion', 'cultural'],
    startDate: '2026-10-01T18:00:00+05:30',
    endDate: '2026-10-10T23:59:59+05:30',
    timezone: 'Asia/Kolkata',
    isAllDay: false,
    location: {
      name: 'Art of Living International Center',
      city: 'Bangalore',
      country: 'India',
      online: true,
      hybrid: true,
    },
    languages: ['English', 'Hindi', 'Sanskrit'],
    highlights: [
      'Daily pujas and meditations',
      'Cultural performances',
      'Special discourses',
      'Community celebrations',
    ],
    media: {
      banner: '/images/events/navratri-banner.jpg',
      thumbnail: '/images/events/navratri-thumb.jpg',
    },
    cta: {
      label: 'Join Celebrations',
      link: '/events/navratri-2026',
    },
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'iwc-2025',
    title: 'International Women\'s Conference 2025',
    slug: 'iwc-2025',
    description: 'A global gathering of women leaders, change-makers, and visionaries. Explore themes of leadership, empowerment, and creating positive change in the world.',
    shortDescription: 'Global conference for women leaders and change-makers',
    category: 'upcoming',
    status: 'upcoming',
    tags: ['conference', 'women', 'leadership', 'empowerment'],
    startDate: '2025-12-10T09:00:00+05:30',
    endDate: '2025-12-12T18:00:00+05:30',
    timezone: 'Asia/Kolkata',
    isAllDay: false,
    location: {
      name: 'Bangalore International Exhibition Centre',
      city: 'Bangalore',
      country: 'India',
      online: true,
      hybrid: true,
    },
    languages: ['English', 'Hindi'],
    highlights: [
      'Keynote addresses by global leaders',
      'Panel discussions',
      'Networking opportunities',
      'Workshops and sessions',
    ],
    stats: {
      attendees: 50000, // Expected
      countries: 100,
    },
    media: {
      banner: '/images/events/iwc-2025-banner.jpg',
      thumbnail: '/images/events/iwc-2025-thumb.jpg',
    },
    cta: {
      label: 'Register for IWC 2025',
      link: '/events/iwc-2025',
    },
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },

  // ==================== ONGOING EVENTS ====================
  {
    id: 'live-webcast-daily',
    title: 'Daily Live Webcast',
    slug: 'live-webcast-daily',
    description: 'Join us daily for live webcasts featuring meditations, wisdom talks, and interactive sessions with teachers and volunteers from around the world.',
    shortDescription: 'Daily live webcasts with meditations and wisdom talks',
    category: 'ongoing',
    status: 'ongoing',
    tags: ['webcast', 'daily', 'meditation', 'live'],
    startDate: '2024-01-01T06:00:00+05:30',
    endDate: '2099-12-31T23:59:59+05:30', // Ongoing indefinitely
    timezone: 'Asia/Kolkata',
    isAllDay: false,
    location: {
      name: 'Online - Global',
      online: true,
    },
    languages: ['English', 'Hindi'],
    highlights: [
      'Daily morning and evening sessions',
      'Interactive Q&A',
      'Guided meditations',
      'Wisdom talks',
    ],
    media: {
      banner: '/images/events/live-webcast-banner.jpg',
      thumbnail: '/images/events/live-webcast-thumb.jpg',
    },
    cta: {
      label: 'Watch Live',
      link: '/events/live-webcast-daily',
    },
    isLive: true,
    liveStreamUrl: 'https://live.artofliving.org',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },

  // ==================== PAST EVENTS ====================
  {
    id: 'wcf-2023',
    title: 'World Culture Festival 2023',
    slug: 'world-culture-festival-2023',
    description: 'The largest cultural gathering in history, bringing together millions of people from 180+ countries to celebrate unity in diversity through music, dance, meditation, and dialogue.',
    shortDescription: 'The world\'s largest cultural gathering celebrating unity in diversity',
    category: 'past',
    status: 'past',
    tags: ['festival', 'culture', 'world', 'record'],
    startDate: '2023-09-29T18:00:00+05:30',
    endDate: '2023-10-01T23:59:59+05:30',
    timezone: 'Asia/Kolkata',
    isAllDay: false,
    location: {
      name: 'National Capital Region',
      city: 'Delhi',
      country: 'India',
      coordinates: {
        lat: 28.6139,
        lng: 77.2090,
      },
    },
    languages: ['English', 'Hindi', 'Multiple'],
    highlights: [
      '6.5 million attendees',
      '180+ countries represented',
      'Guinness World Record for largest yoga session',
      'Performances by 8,000+ artists',
      'Presence of world leaders and dignitaries',
    ],
    stats: {
      attendees: 6500000,
      countries: 180,
      performers: 8000,
      sessions: 150,
    },
    media: {
      banner: '/images/events/wcf-2023-banner.jpg',
      thumbnail: '/images/events/wcf-2023-thumb.jpg',
      gallery: [],
      videos: [],
    },
    cta: {
      label: 'View Highlights',
      link: '/events/wcf-2023',
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-10-02T00:00:00Z',
  },
  {
    id: 'wcf-2016',
    title: 'World Culture Festival 2016',
    slug: 'world-culture-festival-2016',
    description: 'A historic celebration of unity in diversity on the banks of the Yamuna River in Delhi, featuring performances, meditations, and cultural exchanges from around the world.',
    shortDescription: 'Historic cultural celebration on the banks of Yamuna',
    category: 'past',
    status: 'past',
    tags: ['festival', 'culture', 'world', 'delhi'],
    startDate: '2016-03-11T18:00:00+05:30',
    endDate: '2016-03-13T23:59:59+05:30',
    timezone: 'Asia/Kolkata',
    isAllDay: false,
    location: {
      name: 'Yamuna River Bank',
      city: 'Delhi',
      country: 'India',
    },
    languages: ['English', 'Hindi', 'Multiple'],
    highlights: [
      '3.5 million attendees',
      '155 countries represented',
      'Guinness World Record achievements',
      'Performances by thousands of artists',
    ],
    stats: {
      attendees: 3500000,
      countries: 155,
      performers: 5000,
    },
    media: {
      banner: '/images/events/wcf-2016-banner.jpg',
      thumbnail: '/images/events/wcf-2016-thumb.jpg',
    },
    cta: {
      label: 'View Archive',
      link: '/events/wcf-2016',
    },
    createdAt: '2016-01-01T00:00:00Z',
    updatedAt: '2016-03-14T00:00:00Z',
  },
  {
    id: 'wcf-2011',
    title: 'World Culture Festival 2011',
    slug: 'world-culture-festival-2011',
    description: 'A celebration of global unity featuring cultural performances, meditations, and dialogues from around the world.',
    shortDescription: 'Global celebration of unity and diversity',
    category: 'past',
    status: 'past',
    tags: ['festival', 'culture', 'world'],
    startDate: '2011-03-17T18:00:00+05:30',
    endDate: '2011-03-20T23:59:59+05:30',
    timezone: 'Asia/Kolkata',
    isAllDay: false,
    location: {
      name: 'Bangalore',
      country: 'India',
    },
    languages: ['English', 'Hindi', 'Multiple'],
    highlights: [
      '2.5 million attendees',
      '150+ countries',
      'Cultural performances',
    ],
    stats: {
      attendees: 2500000,
      countries: 150,
    },
    media: {
      banner: '/images/events/wcf-2011-banner.jpg',
      thumbnail: '/images/events/wcf-2011-thumb.jpg',
    },
    cta: {
      label: 'View Archive',
      link: '/events/wcf-2011',
    },
    createdAt: '2011-01-01T00:00:00Z',
    updatedAt: '2011-03-21T00:00:00Z',
  },
  {
    id: 'wcf-2006',
    title: 'World Culture Festival 2006',
    slug: 'world-culture-festival-2006',
    description: 'The inaugural World Culture Festival, bringing together people from around the world to celebrate peace, harmony, and cultural diversity.',
    shortDescription: 'The first World Culture Festival',
    category: 'past',
    status: 'past',
    tags: ['festival', 'culture', 'world', 'inaugural'],
    startDate: '2006-02-17T18:00:00+05:30',
    endDate: '2006-02-19T23:59:59+05:30',
    timezone: 'Asia/Kolkata',
    isAllDay: false,
    location: {
      name: 'Bangalore',
      country: 'India',
    },
    languages: ['English', 'Hindi'],
    highlights: [
      '1 million attendees',
      '100+ countries',
      'Inaugural celebration',
    ],
    stats: {
      attendees: 1000000,
      countries: 100,
    },
    media: {
      banner: '/images/events/wcf-2006-banner.jpg',
      thumbnail: '/images/events/wcf-2006-thumb.jpg',
    },
    cta: {
      label: 'View Archive',
      link: '/events/wcf-2006',
    },
    createdAt: '2006-01-01T00:00:00Z',
    updatedAt: '2006-02-20T00:00:00Z',
  },
  {
    id: 'guinness-yoga-2015',
    title: 'Guinness World Record - Largest Yoga Session',
    slug: 'guinness-yoga-2015',
    description: 'Created a Guinness World Record for the largest yoga session with over 35,000 participants practicing together in a single session.',
    shortDescription: 'Guinness World Record for largest yoga session',
    category: 'past',
    status: 'past',
    tags: ['guinness', 'record', 'yoga', 'achievement'],
    startDate: '2015-06-21T06:00:00+05:30',
    endDate: '2015-06-21T08:00:00+05:30',
    timezone: 'Asia/Kolkata',
    isAllDay: false,
    location: {
      name: 'Art of Living International Center',
      city: 'Bangalore',
      country: 'India',
    },
    languages: ['English', 'Hindi'],
    highlights: [
      '35,985 participants',
      'Guinness World Record',
      'International Yoga Day',
      'Global recognition',
    ],
    stats: {
      attendees: 35985,
      countries: 1,
    },
    media: {
      banner: '/images/events/guinness-yoga-banner.jpg',
      thumbnail: '/images/events/guinness-yoga-thumb.jpg',
    },
    cta: {
      label: 'View Record',
      link: '/events/guinness-yoga-2015',
    },
    createdAt: '2015-01-01T00:00:00Z',
    updatedAt: '2015-06-21T10:00:00Z',
  },
  {
    id: 'iwc-2020',
    title: 'International Women\'s Conference 2020',
    slug: 'iwc-2020',
    description: 'A global gathering of women leaders focusing on empowerment, leadership, and creating positive change in communities worldwide.',
    shortDescription: 'Global conference for women leaders',
    category: 'past',
    status: 'past',
    tags: ['conference', 'women', 'leadership', 'empowerment'],
    startDate: '2020-12-10T09:00:00+05:30',
    endDate: '2020-12-12T18:00:00+05:30',
    timezone: 'Asia/Kolkata',
    isAllDay: false,
    location: {
      name: 'Bangalore International Exhibition Centre',
      city: 'Bangalore',
      country: 'India',
      online: true,
      hybrid: true,
    },
    languages: ['English', 'Hindi'],
    highlights: [
      '40,000+ participants',
      '100+ countries',
      'Virtual and in-person',
      'Keynote speakers',
    ],
    stats: {
      attendees: 40000,
      countries: 100,
    },
    media: {
      banner: '/images/events/iwc-2020-banner.jpg',
      thumbnail: '/images/events/iwc-2020-thumb.jpg',
    },
    cta: {
      label: 'View Archive',
      link: '/events/iwc-2020',
    },
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-12-13T00:00:00Z',
  },
  {
    id: 'glf-2019',
    title: 'Global Leadership Forum 2019',
    slug: 'global-leadership-forum-2019',
    description: 'A gathering of leaders from various fields to discuss global challenges and solutions, focusing on peace, sustainability, and human values.',
    shortDescription: 'Global forum for leaders and change-makers',
    category: 'past',
    status: 'past',
    tags: ['forum', 'leadership', 'global', 'dialogue'],
    startDate: '2019-11-15T09:00:00+05:30',
    endDate: '2019-11-17T18:00:00+05:30',
    timezone: 'Asia/Kolkata',
    isAllDay: false,
    location: {
      name: 'Art of Living International Center',
      city: 'Bangalore',
      country: 'India',
    },
    languages: ['English'],
    highlights: [
      'World leaders and dignitaries',
      'Panel discussions',
      'Networking sessions',
      'Action-oriented outcomes',
    ],
    stats: {
      attendees: 5000,
      countries: 80,
    },
    media: {
      banner: '/images/events/glf-2019-banner.jpg',
      thumbnail: '/images/events/glf-2019-thumb.jpg',
    },
    cta: {
      label: 'View Archive',
      link: '/events/glf-2019',
    },
    createdAt: '2019-01-01T00:00:00Z',
    updatedAt: '2019-11-18T00:00:00Z',
  },
];

/**
 * Get all events (for admin/management purposes)
 * In production, this would fetch from a database
 */
export function getAllEvents(): Event[] {
  return allEvents;
}

/**
 * Get events by category (with automatic categorization)
 * @param category - Target category
 * @returns Filtered events
 */
export function getEventsByCategory(category: 'upcoming' | 'ongoing' | 'past'): Event[] {
  const { filterEventsByCategory, sortEventsByDate } = require('../utils/eventCategorization');
  const filtered = filterEventsByCategory(allEvents, category);
  return sortEventsByDate(filtered, category === 'past' ? 'desc' : 'asc');
}
