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

  // Program Categories
  PROGRAMS_BEGINNING: '/programs/beginning',
  PROGRAMS_ADVANCED: '/programs/advance',
  PROGRAMS_CHILDREN: '/programs/children-teens',
  PROGRAMS_MORE: '/programs/more',
  PROGRAMS_RETREATS: '/programs/retreats',

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
} as const;

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
    teens: ROUTES.PROGRAMS_CHILDREN,
    more: ROUTES.PROGRAMS_MORE,
    retreats: ROUTES.PROGRAMS_RETREATS,
  };
  return categoryMap[category.toLowerCase()] || ROUTES.PROGRAMS;
}
