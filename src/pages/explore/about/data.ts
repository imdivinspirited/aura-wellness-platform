/**
 * About the Ashram - Data
 *
 * Content data for the About the Ashram page.
 * In production, this would be fetched from a CMS or database.
 */

import type { AboutAshramPageData } from '../types';

export const aboutAshramData: AboutAshramPageData = {
  hero: {
    title: 'A Sanctuary for Transformation',
    subtitle: 'Where ancient wisdom meets modern life, creating a space for inner peace and global harmony',
    image: '/images/ashram/hero-ashram.jpg',
    ctaText: 'Plan Your Visit',
    ctaLink: '/connect/contact',
  },

  timeline: [
    {
      id: 'timeline-1981',
      year: 1981,
      title: 'The Beginning',
      description: 'Gurudev Sri Sri Ravi Shankar founded the Art of Living Foundation, establishing the first ashram as a center for spiritual learning and service.',
      significance: 'Foundation of the global movement',
      image: '/images/ashram/timeline-1981.jpg',
    },
    {
      id: 'timeline-1986',
      year: 1986,
      title: 'International Center Established',
      description: 'The Art of Living International Center in Bangalore became the heart of the organization, welcoming seekers from around the world.',
      significance: 'Global expansion begins',
      image: '/images/ashram/timeline-1986.jpg',
    },
    {
      id: 'timeline-1995',
      year: 1995,
      title: 'Expansion of Facilities',
      description: 'Major expansion included new meditation halls, accommodation blocks, and dining facilities to serve the growing community.',
      significance: 'Infrastructure for global community',
    },
    {
      id: 'timeline-2005',
      year: 2005,
      title: 'Recognition & Awards',
      description: 'The ashram received recognition for its humanitarian work and contribution to peace-building initiatives worldwide.',
      significance: 'Global recognition',
    },
    {
      id: 'timeline-2015',
      year: 2015,
      title: 'Digital Transformation',
      description: 'Introduction of online programs and digital resources, making wisdom accessible to millions globally while maintaining the ashram experience.',
      significance: 'Technology meets tradition',
    },
    {
      id: 'timeline-present',
      year: 2025,
      title: 'A Global Hub',
      description: 'Today, the ashram serves as a beacon of peace, welcoming over 10 million visitors from 180+ countries, offering programs in multiple languages, and continuing to spread the message of inner peace and outer harmony.',
      significance: 'Continuing the mission',
      image: '/images/ashram/timeline-present.jpg',
    },
  ],

  dailyLife: [
    {
      id: 'daily-morning',
      time: '5:00 AM',
      title: 'Morning Meditation',
      description: 'The day begins with collective meditation, setting a peaceful tone for the hours ahead.',
      icon: 'Sun',
    },
    {
      id: 'daily-breakfast',
      time: '7:00 AM',
      title: 'Sattvic Breakfast',
      description: 'Nourishing vegetarian meals prepared with care, following yogic dietary principles.',
      icon: 'Utensils',
    },
    {
      id: 'daily-yoga',
      time: '8:00 AM',
      title: 'Yoga & Pranayama',
      description: 'Daily practice of asanas and breathing techniques for physical and mental well-being.',
      icon: 'Activity',
    },
    {
      id: 'daily-wisdom',
      time: '10:00 AM',
      title: 'Wisdom Sessions',
      description: 'Interactive sessions on ancient wisdom, practical life skills, and spiritual growth.',
      icon: 'BookOpen',
    },
    {
      id: 'daily-seva',
      time: '2:00 PM',
      title: 'Seva (Service)',
      description: 'Volunteer activities and community service, putting wisdom into action.',
      icon: 'Heart',
    },
    {
      id: 'daily-evening',
      time: '6:00 PM',
      title: 'Evening Satsang',
      description: 'Gathering for meditation, chanting, and sharing experiences in a supportive community.',
      icon: 'Users',
    },
  ],

  facilities: [
    {
      id: 'facility-meditation-hall',
      name: 'Meditation Halls',
      type: 'meditation',
      description: 'Spacious halls designed for collective meditation and spiritual practices, accommodating hundreds of participants.',
      images: ['/images/ashram/facilities/meditation-hall-1.jpg', '/images/ashram/facilities/meditation-hall-2.jpg'],
      capacity: 5000,
      features: ['Air-conditioned', 'Sound system', 'Natural lighting', 'Sacred atmosphere'],
    },
    {
      id: 'facility-accommodation',
      name: 'Accommodation',
      type: 'accommodation',
      description: 'Comfortable rooms ranging from shared dormitories to private suites, all designed for a peaceful stay.',
      images: ['/images/ashram/facilities/accommodation-1.jpg'],
      capacity: 2000,
      features: ['Clean & comfortable', 'Attached bathrooms', '24/7 hot water', 'Room service'],
    },
    {
      id: 'facility-dining',
      name: 'Dining Halls',
      type: 'dining',
      description: 'Large dining facilities serving nutritious vegetarian meals three times daily, prepared with love and care.',
      images: ['/images/ashram/facilities/dining-1.jpg'],
      capacity: 3000,
      features: ['Vegetarian cuisine', 'Multiple serving counters', 'Outdoor seating', 'Special dietary options'],
    },
    {
      id: 'facility-gardens',
      name: 'Peaceful Gardens',
      type: 'garden',
      description: 'Beautifully landscaped gardens with walking paths, meditation spots, and serene water features.',
      images: ['/images/ashram/facilities/gardens-1.jpg', '/images/ashram/facilities/gardens-2.jpg'],
      features: ['Walking paths', 'Meditation spots', 'Water features', 'Native plants'],
    },
    {
      id: 'facility-library',
      name: 'Knowledge Center',
      type: 'other',
      description: 'Extensive library with books on spirituality, wellness, philosophy, and personal development.',
      images: ['/images/ashram/facilities/library-1.jpg'],
      features: ['Thousands of books', 'Reading areas', 'Digital resources', 'Quiet study spaces'],
    },
    {
      id: 'facility-recreation',
      name: 'Recreation Areas',
      type: 'recreation',
      description: 'Spaces for physical activity, sports, and community gatherings.',
      images: ['/images/ashram/facilities/recreation-1.jpg'],
      features: ['Sports facilities', 'Walking tracks', 'Community spaces', 'Children\'s play area'],
    },
  ],

  statistics: [
    {
      id: 'stat-visitors',
      category: 'visitors',
      value: 10000000,
      label: 'Visitors Welcomed',
      unit: '+',
      trend: 'up',
    },
    {
      id: 'stat-countries',
      category: 'countries',
      value: 180,
      label: 'Countries Represented',
      trend: 'up',
    },
    {
      id: 'stat-programs',
      category: 'programs',
      value: 50000,
      label: 'Programs Conducted',
      unit: '+',
      trend: 'up',
    },
    {
      id: 'stat-years',
      category: 'years',
      value: 44,
      label: 'Years of Service',
      trend: 'stable',
    },
  ],

  mapLocation: {
    lat: 12.7915,
    lng: 77.4994,
    address: '21st Km, Kanakapura Road, Udayapura, Bangalore, Karnataka 560082, India',
  },
};
