/** Home hero spotlight — sync with `allEvents` id. */
export const FEATURED_HERO_EVENT_ID = 'gurudev-birthday-2026' as const;

/**
 * `/events` listing hero — luxury calm lake + mountain reflection (editorial mood).
 * File: `public/images/events/hero_radhakunj_lake.jpg` (1920×1280). Unsplash License: https://unsplash.com/license
 * Swap for official Radhakunj / campus photography when available.
 */
export const EVENTS_LISTING_HERO_IMAGE_URL = '/images/events/hero_radhakunj_lake.jpg';

/**
 * Portrait for listings, horizon, and home featured card (distinct from detail hero).
 * Source: https://commons.wikimedia.org/wiki/File:Sri_Sri_Ravi_Shankar_-_new.jpg
 */
export const GURUDEV_BIRTHDAY_CARD_IMAGE_URL =
  'https://upload.wikimedia.org/wikipedia/commons/8/8d/Sri_Sri_Ravi_Shankar_-_new.jpg';

/**
 * Alternate portrait for gallery / fallback (Wikimedia Commons).
 * Source: https://commons.wikimedia.org/wiki/File:Sri_Sri_Ravi_Shankar.jpg
 */
export const GURUDEV_BIRTHDAY_IMAGE_URL =
  'https://upload.wikimedia.org/wikipedia/commons/5/5d/Sri_Sri_Ravi_Shankar.jpg';

/**
 * Ashram hero for event detail + Gurudev birthday hero — same high-quality campus imagery as the home hero.
 */
export const GURUDEV_BIRTHDAY_HERO_IMAGE_URL = '/images/hero/hero_landing_ashram.webp';

/**
 * Gurudev birthday event detail hero — one image, full-bleed behind title (landscape; distinct from card portrait).
 * Source: https://commons.wikimedia.org/wiki/File:Sri_Sri_Ravi_Shankar.jpg
 */
export const GURUDEV_BIRTHDAY_FULLBLEED_HERO_URL = GURUDEV_BIRTHDAY_IMAGE_URL;
