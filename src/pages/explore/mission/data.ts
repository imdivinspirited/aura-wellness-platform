/**
 * Mission & Vision - Data
 *
 * Content data for the Mission & Vision page.
 */

import type { MissionVisionPageData } from '../types';

export const missionVisionData: MissionVisionPageData = {
  hero: {
    visionStatement: 'A stress-free, violence-free society through the upliftment of human values',
    subtitle: 'Transforming Lives, One Breath at a Time',
  },

  missionPillars: [
    {
      id: 'pillar-1',
      title: 'Personal Transformation',
      description: 'Empowering individuals to discover inner peace, reduce stress, and unlock their full potential through ancient wisdom and modern techniques.',
      icon: 'Sparkles',
      order: 1,
    },
    {
      id: 'pillar-2',
      title: 'Social Harmony',
      description: 'Building bridges across communities, cultures, and religions to create a more harmonious and inclusive world.',
      icon: 'Users',
      order: 2,
    },
    {
      id: 'pillar-3',
      title: 'Service to Humanity',
      description: 'Addressing critical social issues through education, healthcare, disaster relief, and sustainable development initiatives.',
      icon: 'Heart',
      order: 3,
    },
    {
      id: 'pillar-4',
      title: 'Environmental Stewardship',
      description: 'Protecting and preserving our planet through tree planting, water conservation, and sustainable living practices.',
      icon: 'Leaf',
      order: 4,
    },
    {
      id: 'pillar-5',
      title: 'Youth Empowerment',
      description: 'Inspiring and equipping young people with life skills, leadership training, and values-based education.',
      icon: 'GraduationCap',
      order: 5,
    },
    {
      id: 'pillar-6',
      title: 'Conflict Resolution',
      description: 'Promoting peace and reconciliation through dialogue, meditation, and trauma relief programs in conflict zones.',
      icon: 'Peace',
      order: 6,
    },
  ],

  coreValues: [
    {
      id: 'value-1',
      name: 'Service',
      description: 'Selfless service to humanity is the highest form of worship.',
      icon: 'Heart',
      order: 1,
    },
    {
      id: 'value-2',
      name: 'Compassion',
      description: 'Extending love and understanding to all beings without discrimination.',
      icon: 'HandHeart',
      order: 2,
    },
    {
      id: 'value-3',
      name: 'Integrity',
      description: 'Living with honesty, authenticity, and moral principles in all actions.',
      icon: 'Shield',
      order: 3,
    },
    {
      id: 'value-4',
      name: 'Excellence',
      description: 'Striving for the highest quality in everything we do, from programs to service.',
      icon: 'Star',
      order: 4,
    },
    {
      id: 'value-5',
      name: 'Inclusivity',
      description: 'Welcoming people from all backgrounds, cultures, and walks of life.',
      icon: 'Globe',
      order: 5,
    },
    {
      id: 'value-6',
      name: 'Innovation',
      description: 'Combining ancient wisdom with modern approaches to address contemporary challenges.',
      icon: 'Lightbulb',
      order: 6,
    },
  ],

  impactStats: [
    {
      id: 'impact-1',
      category: 'People Reached',
      value: 500000000,
      label: 'Lives Touched',
      unit: '+',
      trend: 'up',
      description: 'Over 500 million people have benefited from our programs worldwide',
    },
    {
      id: 'impact-2',
      category: 'Countries',
      value: 180,
      label: 'Countries',
      trend: 'up',
      description: 'Presence in 180 countries across all continents',
    },
    {
      id: 'impact-3',
      category: 'Programs',
      value: 1000000,
      label: 'Programs Conducted',
      unit: '+',
      trend: 'up',
      description: 'Millions of programs delivered globally',
    },
    {
      id: 'impact-4',
      category: 'Trees Planted',
      value: 100000000,
      label: 'Trees Planted',
      unit: '+',
      trend: 'up',
      description: 'Massive reforestation efforts worldwide',
    },
    {
      id: 'impact-5',
      category: 'Schools',
      value: 1000,
      label: 'Schools Supported',
      unit: '+',
      trend: 'up',
      description: 'Educational institutions providing values-based education',
    },
    {
      id: 'impact-6',
      category: 'Volunteers',
      value: 10000000,
      label: 'Volunteers',
      unit: '+',
      trend: 'up',
      description: 'Dedicated volunteers serving communities globally',
    },
  ],

  quotes: [
    {
      id: 'quote-1',
      text: 'When we are centered in joy, we can transform the world around us. Inner peace is the foundation for outer peace.',
      author: {
        id: 'gurudev',
        name: 'Gurudev Sri Sri Ravi Shankar',
        role: 'Founder, Art of Living Foundation',
        avatar: '/images/founders/gurudev.jpg',
      },
      context: 'From a discourse on peace and transformation',
      date: '2020',
    },
    {
      id: 'quote-2',
      text: 'Service is not a one-time activity. It is a way of life that brings fulfillment and meaning to our existence.',
      author: {
        id: 'gurudev',
        name: 'Gurudev Sri Sri Ravi Shankar',
        role: 'Founder, Art of Living Foundation',
        avatar: '/images/founders/gurudev.jpg',
      },
      context: 'Address to volunteers',
      date: '2019',
    },
    {
      id: 'quote-3',
      text: 'When we take responsibility for our own happiness, we naturally contribute to the happiness of others.',
      author: {
        id: 'gurudev',
        name: 'Gurudev Sri Sri Ravi Shankar',
        role: 'Founder, Art of Living Foundation',
        avatar: '/images/founders/gurudev.jpg',
      },
      context: 'Wisdom talk',
      date: '2021',
    },
  ],

  roadmap: {
    title: 'Our Vision for the Future',
    description: 'Building on our foundation of service and transformation, we continue to expand our reach and deepen our impact.',
    initiatives: [
      {
        id: 'initiative-1',
        title: 'Global Peace Initiative',
        description: 'Expanding peace-building programs in conflict zones and areas of tension, bringing meditation and dialogue to communities in need.',
        timeline: 'Ongoing',
      },
      {
        id: 'initiative-2',
        title: 'Climate Action',
        description: 'Accelerating environmental conservation efforts, with a goal to plant 1 billion trees and restore ecosystems worldwide.',
        timeline: '2025-2030',
      },
      {
        id: 'initiative-3',
        title: 'Education for All',
        description: 'Expanding access to quality education, life skills training, and values-based learning for children and youth globally.',
        timeline: 'Ongoing',
      },
      {
        id: 'initiative-4',
        title: 'Mental Health & Wellness',
        description: 'Making stress-relief and mental wellness programs accessible to millions more, especially in underserved communities.',
        timeline: 'Ongoing',
      },
      {
        id: 'initiative-5',
        title: 'Digital Transformation',
        description: 'Leveraging technology to make wisdom and wellness accessible to everyone, everywhere, through online platforms and mobile apps.',
        timeline: 'Ongoing',
      },
    ],
  },
};
