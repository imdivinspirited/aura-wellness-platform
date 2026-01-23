/**
 * Explore Section - Shared Type Definitions
 *
 * Centralized types for all Explore pages.
 * Designed for future CMS integration and scalability.
 */

/* ==================== BASE TYPES ==================== */

export interface BaseContent {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  featured?: boolean;
  metadata?: Record<string, unknown>;
}

export interface Author {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
  role?: string;
  location?: string;
}

/* ==================== ABOUT ASHRAM ==================== */

export interface TimelineEvent {
  id: string;
  year: number;
  month?: number;
  title: string;
  description: string;
  image?: string;
  significance?: string;
  metadata?: Record<string, unknown>;
}

export interface Facility {
  id: string;
  name: string;
  type: 'accommodation' | 'meditation' | 'dining' | 'garden' | 'recreation' | 'other';
  description: string;
  images: string[];
  capacity?: number;
  features?: string[];
  location?: string;
  metadata?: Record<string, unknown>;
}

export interface DailyLifeActivity {
  id: string;
  time: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
}

export interface AshramStatistic {
  id: string;
  category: 'visitors' | 'countries' | 'programs' | 'years';
  value: number;
  label: string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
}

/* ==================== MISSION & VISION ==================== */

export interface MissionPillar {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  image?: string;
  metadata?: Record<string, unknown>;
}

export interface CoreValue {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
}

export interface ImpactStat {
  id: string;
  category: string;
  value: number;
  label: string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  description?: string;
}

export interface LeadershipQuote {
  id: string;
  text: string;
  author: Author;
  context?: string;
  image?: string;
  date?: string;
}

/* ==================== ARTICLES ==================== */

export interface Article extends BaseContent {
  excerpt: string;
  content: string;
  author: Author;
  readingTime: number; // minutes
  category: ArticleCategory;
  tags: Tag[];
  featuredImage: string;
  publishedAt: string;
  viewCount?: number;
}

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  articleCount?: number;
  color?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  articleCount?: number;
}

/* ==================== VIDEOS ==================== */

export interface Video extends BaseContent {
  description: string;
  url: string;
  thumbnail: string;
  duration: number; // seconds
  speaker: Author;
  category: VideoCategory;
  views: number;
  transcript?: string;
  playlistId?: string;
  publishedAt: string;
  language?: string;
}

export interface VideoCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  videoCount?: number;
  icon?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  videos: Video[];
  thumbnail?: string;
  createdAt: string;
}

/* ==================== TESTIMONIALS ==================== */

export interface Testimonial {
  id: string;
  quote: string;
  fullStory?: string;
  author: {
    name: string;
    photo?: string;
    location?: string;
    country: string;
    countryCode?: string;
    role?: string;
    age?: number;
  };
  category: TestimonialCategory;
  type: 'text' | 'video';
  videoUrl?: string;
  thumbnail?: string;
  date: string;
  featured?: boolean;
  approved: boolean;
  metadata?: Record<string, unknown>;
}

export interface TestimonialCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  testimonialCount?: number;
  icon?: string;
}

/* ==================== PAGE DATA TYPES ==================== */

export interface AboutAshramPageData {
  hero: {
    title: string;
    subtitle: string;
    image: string;
    ctaText: string;
    ctaLink: string;
  };
  timeline: TimelineEvent[];
  dailyLife: DailyLifeActivity[];
  facilities: Facility[];
  statistics: AshramStatistic[];
  mapLocation: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface MissionVisionPageData {
  hero: {
    visionStatement: string;
    subtitle: string;
  };
  missionPillars: MissionPillar[];
  coreValues: CoreValue[];
  impactStats: ImpactStat[];
  quotes: LeadershipQuote[];
  roadmap: {
    title: string;
    description: string;
    initiatives: Array<{
      id: string;
      title: string;
      description: string;
      timeline?: string;
    }>;
  };
}

export interface ArticlesPageData {
  featured: Article[];
  categories: ArticleCategory[];
  tags: Tag[];
  articles: Article[];
  authors: Author[];
}

export interface VideosPageData {
  featured: Video[];
  categories: VideoCategory[];
  videos: Video[];
  playlists: Playlist[];
  speakers: Author[];
}

export interface TestimonialsPageData {
  featured: Testimonial[];
  categories: TestimonialCategory[];
  testimonials: Testimonial[];
  statistics: {
    total: number;
    countries: number;
    categories: number;
  };
}
