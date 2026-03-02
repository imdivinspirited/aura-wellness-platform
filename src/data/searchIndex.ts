/**
 * Centralized Search Index — Single source of truth for search.
 * Add new pages, programs, and blogs here (or via scripts/generateSearchIndex).
 */

export interface SearchIndexItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  url: string;
  image?: string;
}

/** Search index: programs, pages, explore, connect. Register new content here. */
export const searchIndex: SearchIndexItem[] = [
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
];
