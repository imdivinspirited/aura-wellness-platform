/**
 * Global Card Image System
 * 
 * Provides standardized image paths and fallbacks for all cards across the platform.
 * All images must be in public/images/ folder structure.
 */

export type CardCategory = 
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
  | 'contact';

export interface CardImageConfig {
  title: string;
  description?: string;
  image?: string; // Path relative to public/ (e.g., '/images/programs/happiness.jpg')
  link?: string;
  openInNewTab?: boolean; // Default: false
  category: CardCategory;
}

/**
 * Get default image for a category
 */
export function getDefaultImage(category: CardCategory): string {
  const defaults: Record<CardCategory, string> = {
    programs: '/images/programs/default.jpg',
    events: '/images/events/default.jpg',
    shopping: '/images/shopping/default.jpg',
    dining: '/images/dining/default.jpg',
    stay: '/images/stay/default.jpg',
    videos: '/images/videos/default.jpg',
    testimonials: '/images/testimonials/default.jpg',
    support: '/images/support/default.jpg',
    faq: '/images/faq/default.jpg',
    services: '/images/services/default.jpg',
    explore: '/images/explore/default.jpg',
    contact: '/images/contact/default.jpg',
  };
  return defaults[category];
}

/**
 * Get card image with fallback
 */
export function getCardImage(config: CardImageConfig): string {
  if (config.image) {
    // Ensure image path starts with /images/
    if (config.image.startsWith('/images/')) {
      return config.image;
    }
    // If relative path provided, construct full path
    return `/images/${config.category}/${config.image}`;
  }
  return getDefaultImage(config.category);
}

/**
 * Create a standardized card image path
 */
export function createCardImagePath(category: CardCategory, filename: string): string {
  return `/images/${category}/${filename}`;
}

/**
 * Validate image path exists (client-side check)
 */
export function validateImagePath(path: string): boolean {
  // In production, this could check against a manifest or API
  // For now, we'll rely on the browser's natural image loading behavior
  return path.startsWith('/images/') || path.startsWith('http');
}
