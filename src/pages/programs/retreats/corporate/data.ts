/**
 * Corporate Wellbeing Retreats - Program Data
 */

import type { ProgramData } from '../../shared/types';

export const corporateRetreatsData: ProgramData = {
  id: 'corporate-retreats',
  title: 'Corporate Wellbeing Retreats',
  subtitle: 'Transform Your Team Through Wellness & Mindfulness',
  description: 'Customized retreats designed for organizations to enhance employee wellbeing, reduce stress, improve team dynamics, and boost productivity. Experience the power of yoga, meditation, and life skills in a corporate setting.',
  ageGroup: 'Corporate Teams',
  duration: '2-5 days',
  format: 'residential',
  contributionDisclaimer: 'Custom pricing available for corporate groups.',

  benefits: [
    {
      id: 'stress-reduction',
      title: 'Stress Reduction',
      subtitle: 'Workplace Wellness',
      description: 'Learn techniques to manage workplace stress, improve work-life balance, and maintain calm under pressure.',
      icon: 'Heart',
    },
    {
      id: 'team-building',
      title: 'Team Building',
      subtitle: 'Stronger Bonds',
      description: 'Build stronger team relationships, improve communication, and foster a collaborative work environment.',
      icon: 'Users',
    },
    {
      id: 'productivity',
      title: 'Enhanced Productivity',
      subtitle: 'Peak Performance',
      description: 'Improve focus, concentration, and decision-making skills for better workplace performance.',
      icon: 'Target',
    },
    {
      id: 'leadership',
      title: 'Leadership Skills',
      subtitle: 'Effective Leadership',
      description: 'Develop emotional intelligence, empathy, and leadership qualities that inspire and motivate teams.',
      icon: 'Crown',
    },
    {
      id: 'work-life-balance',
      title: 'Work-Life Balance',
      subtitle: 'Holistic Wellness',
      description: 'Learn to maintain balance between professional responsibilities and personal wellbeing.',
      icon: 'Scale',
    },
    {
      id: 'corporate-culture',
      title: 'Positive Culture',
      subtitle: 'Workplace Culture',
      description: 'Foster a positive, supportive workplace culture that values employee wellbeing and happiness.',
      icon: 'Sparkles',
    },
  ],

  whatIsProgram: {
    title: 'What are Corporate Wellbeing Retreats?',
    content: `Corporate Wellbeing Retreats are customized programs designed specifically for organizations and their teams. These retreats combine yoga, meditation, breathing techniques, and life skills training to address the unique challenges of the modern workplace.

The programs are tailored to your organization's needs and may include:
- **Stress Management**: Techniques to handle workplace pressure and maintain calm
- **Team Building**: Activities that strengthen relationships and improve collaboration
- **Leadership Development**: Skills for effective leadership and team management
- **Work-Life Balance**: Strategies for maintaining balance and preventing burnout
- **Communication Skills**: Enhanced communication and conflict resolution
- **Productivity Enhancement**: Tools for improved focus, decision-making, and performance

Retreats can be conducted at our centers or at your preferred location, and can be customized in duration, content, and format to meet your organization's specific requirements.`,
  },

  whoIsItFor: {
    title: 'Who is it for?',
    content: 'Corporate Wellbeing Retreats are designed for:',
    eligibility: [
      'Corporate teams and organizations',
      'Leadership teams and executives',
      'Departments seeking team building',
      'Companies prioritizing employee wellness',
      'Organizations wanting to reduce stress and burnout',
      'Teams looking to improve communication and collaboration',
    ],
  },

  corePractices: {
    title: 'Program Elements',
    practices: [
      {
        title: 'Yoga & Meditation',
        description: 'Daily yoga and meditation sessions to reduce stress, improve focus, and enhance overall wellbeing.',
      },
      {
        title: 'Breathing Techniques',
        description: 'Learn powerful breathing techniques that can be used in the workplace for instant stress relief and energy boost.',
      },
      {
        title: 'Team Building Activities',
        description: 'Engaging activities designed to strengthen team bonds, improve communication, and foster collaboration.',
      },
      {
        title: 'Leadership Sessions',
        description: 'Workshops on emotional intelligence, effective leadership, and creating positive workplace culture.',
      },
      {
        title: 'Work-Life Balance',
        description: 'Strategies and tools for maintaining balance between professional responsibilities and personal wellbeing.',
      },
      {
        title: 'Customized Content',
        description: 'Content tailored to your organization\'s specific needs, challenges, and goals.',
      },
    ],
  },

  testimonials: [
    {
      id: 'testimonial-1',
      quote: 'Our team retreat was transformative. The stress management techniques have been invaluable, and we\'ve seen a noticeable improvement in team dynamics and productivity. Highly recommended for any organization.',
      name: 'HR Director',
      role: 'Technology Company',
      location: 'Bangalore',
    },
    {
      id: 'testimonial-2',
      quote: 'The corporate retreat exceeded our expectations. Our team came back refreshed, more connected, and with practical tools they use daily. The impact on our workplace culture has been significant.',
      name: 'CEO',
      role: 'Financial Services',
      location: 'Mumbai',
    },
  ],

  founder: {
    name: 'Gurudev Sri Sri Ravi Shankar',
    title: 'Founder, Art of Living Foundation',
    description: 'Gurudev Sri Sri Ravi Shankar has been a pioneer in bringing wellness and mindfulness to the corporate world. His programs have helped thousands of organizations worldwide create happier, more productive workplaces.',
  },

  upcomingPrograms: [
    {
      id: 'corporate-custom',
      date: 'Custom Dates Available',
      location: 'Multiple Locations',
      language: 'English / Hindi',
      duration: '2-5 days',
      format: 'residential',
    },
  ],

  faqs: [
    {
      id: 'customization',
      question: 'Can the retreat be customized for our organization?',
      answer: 'Yes, all corporate retreats are customized to meet your organization\'s specific needs, goals, and challenges. We work with you to design a program that addresses your unique requirements.',
    },
    {
      id: 'location',
      question: 'Where can the retreat be conducted?',
      answer: 'Retreats can be conducted at our centers, at your office location, or at a venue of your choice. We can accommodate various locations and settings.',
    },
    {
      id: 'group-size',
      question: 'What is the ideal group size?',
      answer: 'We can accommodate groups of various sizes, from small teams of 10-15 to large groups of 100+. The program is adapted based on group size to ensure effectiveness.',
    },
    {
      id: 'duration',
      question: 'What duration is recommended?',
      answer: 'Retreats can range from 2-5 days depending on your needs. We recommend at least 3 days for maximum impact, but shorter programs are also effective.',
    },
    {
      id: 'pricing',
      question: 'How is pricing determined?',
      answer: 'Pricing is customized based on group size, duration, location, and specific requirements. Please contact us for a detailed quote tailored to your needs.',
    },
    {
      id: 'follow-up',
      question: 'Is follow-up support provided?',
      answer: 'Yes, we provide follow-up support including online sessions, resources, and ongoing guidance to help maintain the benefits of the retreat.',
    },
  ],

  registrationUrl: 'https://programs.vvmvp.org/',
};
