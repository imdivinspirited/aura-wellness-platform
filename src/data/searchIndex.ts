/**
 * Centralized Search Index — base entries + automatic merge of `/events` from `allEvents`
 * so new events in `src/pages/events/data/events.ts` appear in site search without duplicating URLs here.
 */

import { allEvents } from '@/pages/events/data/events';

export interface SearchIndexItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  url: string;
  image?: string;
}

/** Static routes & hubs — individual events are merged from `allEvents` below. */
const searchIndexBase: SearchIndexItem[] = [
  // ——— Programs ———
  {
    id: 'happiness-program',
    title: 'Happiness Program',
    description: 'Transform your life with ancient wisdom. A comprehensive program for lasting happiness and inner peace through meditation, breathing techniques (SKY), and wisdom.',
    category: 'Course',
    tags: ['meditation', 'yoga', 'stress relief', 'SKY', 'wellness', 'beginner'],
    url: '/programs/happiness-program',
    image: '/images/programs/happiness-program.jpg',
  },
  {
    id: 'sri-sri-yoga',
    title: 'Sri Sri Yoga',
    description: 'A holistic approach to yoga combining asanas, pranayama, and meditation for physical and mental well-being.',
    category: 'Course',
    tags: ['yoga', 'asanas', 'pranayama', 'meditation'],
    url: '/programs/sri-sri-yoga',
    image: '/images/programs/sri-sri-yoga.jpg',
  },
  {
    id: 'sahaj-samadhi',
    title: 'Sahaj Samadhi Meditation',
    description: 'An effortless meditation technique that brings deep rest and inner silence, reducing stress and enhancing clarity.',
    category: 'Course',
    tags: ['meditation', 'samadhi', 'stress relief', 'clarity'],
    url: '/programs/sahaj-samadhi',
    image: '/images/programs/sahaj-samadhi.jpg',
  },
  {
    id: 'silence-retreat',
    title: 'Silence Retreat',
    description: 'A residential retreat in complete silence to deepen your meditation practice and experience inner transformation.',
    category: 'Course',
    tags: ['retreat', 'silence', 'meditation', 'residential'],
    url: '/programs/silence-retreat',
    image: '/images/programs/silence-retreat.jpg',
  },
  {
    id: 'corporate-program',
    title: 'Corporate Programs',
    description: 'Wellness programs for organizations: reduce stress, improve employee well-being, and enhance productivity.',
    category: 'Course',
    tags: ['corporate', 'wellness', 'stress management', 'productivity'],
    url: '/programs/corporate',
    image: '/images/programs/corporate.jpg',
  },
  {
    id: 'amp',
    title: 'Advanced Meditation Program (AMP)',
    description: 'An advanced residential program for deepening meditation and experiencing higher states of consciousness.',
    category: 'Course',
    tags: ['advanced', 'meditation', 'residential', 'consciousness'],
    url: '/programs/advance/amp',
    image: '/images/programs/amp.jpg',
  },
  {
    id: 'dsn',
    title: 'Dynamism for Self and Nation (DSN)',
    description: 'A leadership program that empowers individuals to contribute to society while achieving personal excellence.',
    category: 'Course',
    tags: ['leadership', 'service', 'excellence', 'society'],
    url: '/programs/advance/dsn',
    image: '/images/programs/dsn.jpg',
  },
  {
    id: 'blessings',
    title: 'Blessings Program',
    description: 'A spiritual program offering blessings and guidance for life transformation.',
    category: 'Course',
    tags: ['spiritual', 'blessings', 'transformation'],
    url: '/programs/advance/blessings',
    image: '/images/programs/blessings.jpg',
  },
  {
    id: 'sri-sri-yoga-deep-dive',
    title: 'Sri Sri Yoga Deep Dive (Level 2)',
    description: 'An advanced yoga program with advanced asanas, pranayama techniques, and yogic wisdom.',
    category: 'Course',
    tags: ['yoga', 'advanced', 'pranayama', 'yogic wisdom'],
    url: '/programs/advance/sri-sri-yoga-deep-dive-level-2',
    image: '/images/programs/yoga-deep-dive.jpg',
  },
  // ——— Explore / Pages ———
  {
    id: 'explore-about',
    title: 'About Us',
    description: 'Learn about Art of Living Foundation, our mission, Gurudev Sri Sri Ravi Shankar, and our global impact.',
    category: 'Page',
    tags: ['about', 'mission', 'foundation', 'Gurudev'],
    url: '/explore/about',
    image: '/images/explore/about.jpg',
  },
  {
    id: 'explore',
    title: 'Explore',
    description: 'Explore programs, articles, videos, and resources for wellness and meditation.',
    category: 'Page',
    tags: ['explore', 'articles', 'videos', 'resources'],
    url: '/explore',
    image: '/images/explore/explore.jpg',
  },
  {
    id: 'explore-articles',
    title: 'Articles & Blog',
    description: 'Read articles and blog posts on meditation, yoga, wellness, and life skills.',
    category: 'Page',
    tags: ['articles', 'blog', 'meditation', 'wellness'],
    url: '/explore/articles',
    image: '/images/explore/articles.jpg',
  },
  {
    id: 'connect',
    title: 'Connect',
    description: 'Get in touch: contact, FAQs, support, and community.',
    category: 'Page',
    tags: ['contact', 'FAQs', 'support', 'connect'],
    url: '/connect',
    image: '/images/connect/connect.jpg',
  },
  {
    id: 'connect-faqs',
    title: 'FAQs',
    description: 'Frequently asked questions about programs, registration, and Art of Living.',
    category: 'Page',
    tags: ['FAQs', 'help', 'questions', 'support'],
    url: '/connect/faqs',
    image: '/images/connect/faqs.jpg',
  },
  {
    id: 'connect-contact',
    title: 'Contact Us',
    description: 'Contact Art of Living: email, phone, and visit the ashram.',
    category: 'Page',
    tags: ['contact', 'email', 'phone', 'ashram'],
    url: '/connect/contact',
    image: '/images/connect/contact.jpg',
  },
  {
    id: 'seva-careers',
    title: 'Seva & Careers',
    description: 'Serve, grow and thrive at Art of Living. Seva, jobs, and internships — apply online.',
    category: 'Page',
    tags: ['seva', 'careers', 'jobs', 'internships', 'volunteer'],
    url: '/seva-careers',
    image: '/images/seva-careers.jpg',
  },
  {
    id: 'programs-listing',
    title: 'All Programs',
    description: 'Browse all Art of Living programs: happiness, yoga, meditation, corporate, and advanced courses.',
    category: 'Page',
    tags: ['programs', 'courses', 'catalog', 'listing'],
    url: '/programs',
    image: '/images/programs/listing.jpg',
  },
  {
    id: 'events',
    title: 'Events',
    description: 'Upcoming events, workshops, and retreats near you.',
    category: 'Event',
    tags: ['events', 'workshops', 'retreats', 'calendar'],
    url: '/events',
    image: '/images/events.jpg',
  },
  {
    id: 'events-upcoming',
    title: 'Upcoming Events',
    description: 'Browse upcoming workshops, celebrations, and retreats at the ashram.',
    category: 'Event',
    tags: ['events', 'upcoming', 'calendar', 'schedule'],
    url: '/events/upcoming',
  },
  {
    id: 'events-ongoing',
    title: 'Ongoing Events',
    description: 'Events happening now on campus.',
    category: 'Event',
    tags: ['events', 'ongoing', 'now'],
    url: '/events/ongoing',
  },
  {
    id: 'events-past',
    title: 'Past Events',
    description: 'Archive of past programs and celebrations.',
    category: 'Event',
    tags: ['events', 'past', 'archive'],
    url: '/events/past',
  },

  // ——— More programs (nav + routes) ———
  {
    id: 'wellness-program',
    title: 'Wellness Programs',
    description: 'Holistic wellness courses and retreats for body and mind.',
    category: 'Course',
    tags: ['wellness', 'health', 'retreat', 'healing'],
    url: '/programs/wellness',
    image: '/images/programs/wellness.jpg',
  },
  {
    id: 'samyam',
    title: 'Samyam',
    description: 'Advanced residential program for deep silence and inner discipline.',
    category: 'Course',
    tags: ['samyam', 'advanced', 'meditation', 'residential'],
    url: '/programs/advance/samyam',
  },
  {
    id: 'utkarsha-yoga',
    title: 'Utkarsha Yoga',
    description: 'Yoga for children and teens — focus, confidence, and joy.',
    category: 'Course',
    tags: ['children', 'teens', 'yoga', 'Utkarsha'],
    url: '/programs/utkarsha-yoga',
  },
  {
    id: 'medha-myl-1',
    title: 'Medha Yoga Level 1 (MYL-1)',
    description: 'Foundational yoga and wisdom for clarity and energy.',
    category: 'Course',
    tags: ['Medha', 'MYL', 'yoga', 'beginner'],
    url: '/programs/myl-1',
  },
  {
    id: 'medha-myl-2',
    title: 'Medha Yoga Level 2 (MYL-2)',
    description: 'Deeper practices and integration for graduates of Level 1.',
    category: 'Course',
    tags: ['Medha', 'MYL', 'yoga', 'advanced'],
    url: '/programs/myl-2',
  },
  {
    id: 'intuition-process',
    title: 'Intuition Process',
    description: 'Unlock intuition and creativity for children and adults.',
    category: 'Course',
    tags: ['intuition', 'children', 'creativity', 'IP'],
    url: '/programs/intuition-process',
  },
  {
    id: 'vedic-wisdom',
    title: 'Vedic Wisdom',
    description: 'Study of Vedic knowledge, chanting, and timeless wisdom.',
    category: 'Course',
    tags: ['Vedic', 'wisdom', 'scripture', 'Sanskrit'],
    url: '/programs/vedic-wisdom',
  },
  {
    id: 'panchkarma',
    title: 'Panchakarma',
    description: 'Ayurvedic cleansing and rejuvenation therapies.',
    category: 'Course',
    tags: ['Ayurveda', 'Panchakarma', 'wellness', 'detox', 'therapy'],
    url: '/programs/panchkarma',
  },
  {
    id: 'yoga-deep-dive',
    title: 'Sri Sri Yoga Deep Dive',
    description: 'Immersive yoga journey with asanas, pranayama, and depth.',
    category: 'Course',
    tags: ['yoga', 'deep dive', 'Sri Sri Yoga', 'asanas'],
    url: '/programs/yoga-deep-dive',
  },
  {
    id: 'hatha-yoga',
    title: 'Hatha Yoga Sadhana',
    description: 'Classical hatha yoga for strength, flexibility, and steadiness.',
    category: 'Course',
    tags: ['Hatha', 'yoga', 'asanas'],
    url: '/programs/hatha-yoga',
  },
  {
    id: 'spine-care-yoga',
    title: 'Spine Care Yoga',
    description: 'Gentle yoga for spinal health and back care.',
    category: 'Course',
    tags: ['spine', 'back', 'yoga', 'therapy', 'posture'],
    url: '/programs/spine-care',
  },
  {
    id: 'corporate-retreats',
    title: 'Corporate Wellbeing Retreats',
    description: 'Team retreats and wellbeing programs for organizations.',
    category: 'Course',
    tags: ['corporate', 'retreat', 'team', 'wellbeing'],
    url: '/programs/corporate-retreats',
  },
  {
    id: 'self-designed-getaways',
    title: 'Self-Designed Getaways',
    description: 'Design your own stay and program mix at the ashram.',
    category: 'Course',
    tags: ['getaway', 'stay', 'custom', 'retreat'],
    url: '/programs/self-designed',
  },
  {
    id: 'host-your-program',
    title: 'Host Your Program',
    description: 'Host courses, retreats, or gatherings at the campus.',
    category: 'Course',
    tags: ['host', 'venue', 'organize', 'group'],
    url: '/programs/host',
  },

  // ——— Services hub & ashram services ———
  {
    id: 'services-hub',
    title: 'Services',
    description: 'Stay, dining, transport, shopping, and campus facilities for your visit.',
    category: 'Service',
    tags: ['services', 'ashram', 'visitor', 'stay', 'campus'],
    url: '/services',
  },
  {
    id: 'services-stay',
    title: 'Stay & Meals',
    description: 'Accommodation options and meal plans at the ashram.',
    category: 'Service',
    tags: ['stay', 'accommodation', 'room', 'meals', 'lodging', 'hotel'],
    url: '/services/stay',
    image: '/images/services/stay.jpg',
  },
  {
    id: 'services-dining',
    title: 'Dining',
    description: 'Sattvic dining halls and meal timings for residents and visitors.',
    category: 'Service',
    tags: ['dining', 'food', 'meals', 'restaurant', 'canteen'],
    url: '/services/dining',
  },
  {
    id: 'services-transport',
    title: 'Transport',
    description: 'Airport pickup, campus shuttles, and travel help.',
    category: 'Service',
    tags: ['transport', 'airport', 'taxi', 'shuttle', 'travel'],
    url: '/services/transport',
  },
  {
    id: 'services-facilities',
    title: 'Facilities',
    description: 'Medical desk, utilities, and essential amenities on campus.',
    category: 'Service',
    tags: ['facilities', 'medical', 'amenities', 'campus'],
    url: '/services/facilities',
  },
  {
    id: 'services-shopping',
    title: 'Shopping',
    description: 'Books, gifts, wellness products, and souvenirs.',
    category: 'Service',
    tags: ['shopping', 'store', 'books', 'gifts', 'shop'],
    url: '/services/shopping',
  },
  {
    id: 'international-visitors',
    title: 'International Visitors',
    description: 'Timezone-friendly information, visas, and programs for global guests.',
    category: 'Page',
    tags: ['international', 'foreign', 'visa', 'travel', 'overseas'],
    url: '/international',
  },

  // ——— Explore (more) ———
  {
    id: 'explore-mission',
    title: 'Mission & Vision',
    description: 'Our guiding values, impact, and vision for service.',
    category: 'Page',
    tags: ['mission', 'vision', 'values', 'about'],
    url: '/explore/mission',
  },
  {
    id: 'explore-videos',
    title: 'Videos & Talks',
    description: 'Discourses, guided practices, and inspiring talks.',
    category: 'Page',
    tags: ['videos', 'YouTube', 'talks', 'discourse', 'watch'],
    url: '/explore/videos',
  },
  {
    id: 'explore-testimonials',
    title: 'Testimonials',
    description: 'Stories from participants and visitors worldwide.',
    category: 'Page',
    tags: ['testimonials', 'reviews', 'stories', 'experience'],
    url: '/explore/testimonials',
  },

  // ——— Connect ———
  {
    id: 'connect-hub',
    title: 'Connect',
    description: 'Contact, support, FAQs, and help for your journey.',
    category: 'Connect',
    tags: ['connect', 'help', 'community'],
    url: '/connect',
  },
  {
    id: 'connect-support',
    title: 'Support Desk',
    description: 'Help with bookings, payments, cancellations, and account issues.',
    category: 'Connect',
    tags: ['support', 'help', 'desk', 'ticket', 'customer service'],
    url: '/connect/support',
  },

  // ——— Careers & opportunities ———
  {
    id: 'opportunities',
    title: 'Opportunities',
    description: 'Programs, projects, and paths to grow with the organization.',
    category: 'Page',
    tags: ['opportunities', 'projects', 'growth', 'careers'],
    url: '/opportunities',
  },

  // ——— Account & home ———
  {
    id: 'home',
    title: 'Home',
    description: 'The Art of Living International Center Bangalore — landing page.',
    category: 'Page',
    tags: ['home', 'landing', 'AOLIC', 'Bangalore', 'ashram'],
    url: '/',
    image: '/images/hero/hero_landing_ashram.webp',
  },
  {
    id: 'profile',
    title: 'Profile & Dashboard',
    description: 'Your account, bookings, settings, and preferences.',
    category: 'Page',
    tags: ['profile', 'account', 'dashboard', 'bookings', 'user'],
    url: '/profile',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Language, appearance, notifications, and privacy.',
    category: 'Page',
    tags: ['settings', 'preferences', 'language', 'theme', 'account'],
    url: '/settings',
  },
];

function uniqLowerTags(words: string[]): string[] {
  const s = new Set<string>();
  for (const w of words) {
    const t = w.trim().toLowerCase();
    if (t.length > 0) s.add(t);
  }
  return [...s];
}

/** Derives searchable rows from the same source as the Events UI — keeps search in sync when events are added. */
function searchItemsFromAllEvents(): SearchIndexItem[] {
  return allEvents.map((e) => {
    const descParts = [e.shortDescription, e.description, e.highlights?.join(' ')].filter(Boolean);
    const description = descParts.join(' ').replace(/\s+/g, ' ').trim().slice(0, 720);
    const fromSlug = e.slug.split('-').filter((w) => w.length > 1);
    const fromTitle = e.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);
    const tags = uniqLowerTags([
      ...(e.tags ?? []),
      ...(e.keywords ?? []),
      ...fromSlug,
      ...fromTitle,
      'event',
      'events',
      'celebration',
      'gurudev',
      'sri sri ravi shankar',
      'birthday',
      'meditation',
      'satsang',
      'bangalore',
      'ashram',
    ]);
    const image = e.media?.thumbnail ?? e.media?.banner;
    return {
      id: `event-${e.id}`,
      title: e.title,
      description,
      category: 'Event',
      tags: tags.slice(0, 48),
      url: `/events/${e.slug}`,
      image,
    };
  });
}

const _urlMap = new Map<string, SearchIndexItem>();
for (const it of searchIndexBase) {
  _urlMap.set(it.url, it);
}
for (const it of searchItemsFromAllEvents()) {
  if (!_urlMap.has(it.url)) {
    _urlMap.set(it.url, it);
  }
}

/** Full index: static hubs + one row per event from `allEvents`. */
export const searchIndex: SearchIndexItem[] = [..._urlMap.values()];
