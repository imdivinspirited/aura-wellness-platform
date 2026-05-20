export type ImageCategory =
  | 'programs'
  | 'events'
  | 'shopping'
  | 'dining'
  | 'stay'
  | 'videos'
  | 'testimonials'
  | 'support'
  | 'faq'
  | 'services'
  | 'explore'
  | 'contact'
  | 'connect';

export const IMAGE_CATEGORY_DEFAULTS: Record<ImageCategory, string> = {
  programs: '/images/programs/card_program_beginner_happiness.jpg',
  events: '/images/events/shivratri-banner.jpg',
  shopping: '/images/services/card_service_shopping.jpg',
  dining: '/images/services/card_service_dining.jpg',
  stay: '/images/services/card_service_stay.jpg',
  videos: '/images/explore/card_watch_experience.jpg',
  testimonials: '/images/explore/card_living_stories.jpg',
  support: '/images/connect/card_contact_phone.jpg',
  faq: '/images/connect/card_contact_faq.jpg',
  services: '/images/services/card_service_facilities.jpg',
  explore: '/images/explore/hero_explore.jpg',
  contact: '/images/connect/hero_connect_support.jpg',
  connect: '/images/connect/hero_connect_support.jpg',
};

/**
 * Build a conventional card hero image path based on category + slug/id.
 * Example: /images/programs/happiness_program/hero.webp
 */
export function cardHeroImagePath(
  category: ImageCategory,
  slugOrId: string,
  filename = 'hero.jpg'
): string {
  const safeSlug = slugOrId.replace(/\s+/g, '_').toLowerCase();
  return `/images/${category}/${safeSlug}/${filename}`;
}

/**
 * Normalize legacy public image paths into the strict folder structure.
 * This keeps the app future-proof while we migrate existing data.
 */
export function normalizePublicImagePath(path?: string | null): string | undefined {
  if (!path) return undefined;
  // Already a full URL (e.g. https://...) - leave as-is (SafeImage can still fallback on error)
  if (/^https?:\/\//i.test(path)) return path;

  // Ensure leading slash
  const p = path.startsWith('/') ? path : `/${path}`;

  // Legacy folder aliases observed in data files
  return p
    .replace(/^\/images\/shops\//, '/images/shopping/')
    .replace(/^\/images\/accommodation\//, '/images/stay/')
    .replace(/^\/images\/articles\//, '/images/explore/')
    .replace(/^\/images\/playlists\//, '/images/videos/')
    .replace(/^\/images\/speakers\//, '/images/videos/')
    .replace(/^\/images\/authors\//, '/images/explore/');
}
