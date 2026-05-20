/**
 * Centralized Route Constants
 *
 * Single source of truth for all routes.
 * Prevents hardcoded magic strings.
 */

export const ROUTES = {
  // Main Pages
  HOME: '/',
  PROGRAMS: '/programs',
  EVENTS: '/events',
  SERVICES: '/services',
  EXPLORE: '/explore',
  CONNECT: '/connect',

  // Program Categories (use query params for filtering on the unified ProgramsListingPage)
  PROGRAMS_BEGINNING: '/programs?category=beginning',
  PROGRAMS_ADVANCED: '/programs?category=advanced',
  PROGRAMS_CHILDREN: '/programs?category=children',
  PROGRAMS_TEENS: '/programs?category=teens',
  PROGRAMS_MORE: '/programs?category=more',
  PROGRAMS_RETREATS: '/programs?category=retreats',

  // Specific Programs
  PROGRAM_HAPPINESS: '/programs/happiness-program',
  PROGRAM_SILENCE: '/programs/silence-retreat',
  PROGRAM_YOGA: '/programs/sri-sri-yoga',

  // Events
  EVENTS_UPCOMING: '/events/upcoming',
  EVENTS_ONGOING: '/events/ongoing',
  EVENTS_PAST: '/events/past',

  // Explore
  EXPLORE_ABOUT: '/explore/about',
  EXPLORE_MISSION: '/explore/mission',
  EXPLORE_ARTICLES: '/explore/articles',
  EXPLORE_VIDEOS: '/explore/videos',
  EXPLORE_TESTIMONIALS: '/explore/testimonials',

  // Connect
  CONNECT_CONTACT: '/connect/contact',
  CONNECT_SUPPORT: '/connect/support',
  CONNECT_FAQS: '/connect/faqs',

  // External
  GOOGLE_MAPS: 'https://www.google.com/maps?q=12.7915,77.4994',
  REGISTRATION: 'https://programs.vvmvp.org/',

  // Auth & account
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  PROFILE: '/profile',

  /** Public shareable profile (no login): append your user id from Profile → Copy public link */
  publicUserProfile: (userId: string) => `/u/${encodeURIComponent(userId)}` as const,

  // Services (direct links for sharing)
  SERVICES_SHOPPING: '/services/shopping',
  SERVICES_DINING: '/services/dining',
  SERVICES_STAY: '/services/stay',
  SERVICES_TRANSPORT: '/services/transport',
  SERVICES_FACILITIES: '/services/facilities',
  INTERNATIONAL: '/international',

  // Programs — share individual course pages (add more as needed)
  PROGRAM_CORPORATE: '/programs/corporate',
  PROGRAM_SAHAJ_SAMADHI: '/programs/sahaj-samadhi',
  PROGRAM_WELLNESS: '/programs/wellness',
  PROGRAM_UTKARSHA_YOGA: '/programs/utkarsha-yoga',
  PROGRAM_VEDIC_WISDOM: '/programs/vedic-wisdom',
  PROGRAM_PANCHKARMA: '/programs/panchkarma',
  PROGRAM_HOST: '/programs/host',

  // CMS / editor pages (slug from admin)
  cmsPage: (slug: string) => `/p/${encodeURIComponent(slug)}` as const,

  // Events — use slug from listing
  eventDetail: (slug: string) => `/events/${encodeURIComponent(slug)}` as const,

  // Other hubs
  SEVA_CAREERS: '/seva-careers',
  OPPORTUNITIES: '/opportunities',
  SETTINGS: '/settings',
} as const;

/** Full URL for sharing (e.g. WhatsApp). Safe only in browser. */
export function getAbsoluteSiteUrl(path: string): string {
  if (typeof window === 'undefined') return path.startsWith('/') ? path : `/${path}`;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${window.location.origin}${p}`;
}

/** Path only: `/u/<uuid>` — pair with `getAbsoluteSiteUrl` for copy/share. */
export function getPublicProfilePath(userId: string): string {
  const id = String(userId || '').trim();
  return id ? `/u/${encodeURIComponent(id)}` : '/profile';
}

/**
 * Get route with query params
 */
export function getRouteWithParams(baseRoute: string, params: Record<string, string>): string {
  const url = new URL(baseRoute, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.pathname + url.search;
}

/**
 * Navigate to programs with category filter
 */
export function getProgramsRouteWithCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    beginning: ROUTES.PROGRAMS_BEGINNING,
    advanced: ROUTES.PROGRAMS_ADVANCED,
    children: ROUTES.PROGRAMS_CHILDREN,
    teens: ROUTES.PROGRAMS_TEENS,
    more: ROUTES.PROGRAMS_MORE,
    retreats: ROUTES.PROGRAMS_RETREATS,
  };
  return categoryMap[category.toLowerCase()] || ROUTES.PROGRAMS;
}
