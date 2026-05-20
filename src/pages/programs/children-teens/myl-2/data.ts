/**
 * Medha Yoga Level 2 - Program Data
 *
 * Complete program information following the provided content.
 */

import type { ProgramData } from '../../shared/types';

export const myl2Data: ProgramData = {
  id: 'myl-2',
  title: 'Medha Yoga Level 2',
  subtitle: 'Advanced Practices for Resilience and Self-Mastery',
  description: 'An advanced program for graduates of Medha Yoga Level 1, focusing on deeper practices including service, mudra pranayamas, advanced discussions, and extended meditation. This program builds resilience, self-control, and a spirit of service.',
  ageGroup: '13-18 years (Level 1 graduates)',
  duration: '5-7 days',
  format: 'residential',
  contributionDisclaimer: 'Your contribution supports social projects and makes these programs accessible to all.',

  benefits: [
    {
      id: 'resilience',
      title: 'Build Resilience',
      subtitle: 'Inner Strength',
      description: 'Develop unshakeable resilience to face life\'s challenges with grace, strength, and equanimity.',
      icon: 'Shield',
    },
    {
      id: 'self-control',
      title: 'Self-Control',
      subtitle: 'Emotional Mastery',
      description: 'Master advanced techniques for self-control, emotional regulation, and maintaining balance in all situations.',
      icon: 'Brain',
    },
    {
      id: 'spirit-of-service',
      title: 'Spirit of Service',
      subtitle: 'Giving Back',
      description: 'Cultivate a deep sense of service and contribution, learning that true happiness comes from giving.',
      icon: 'Heart',
    },
    {
      id: 'deeper-meditation',
      title: 'Deeper Meditation',
      subtitle: 'Advanced Practice',
      description: 'Experience deeper states of meditation and inner silence, accessing profound peace and clarity.',
      icon: 'Moon',
    },
    {
      id: 'advanced-breathing',
      title: 'Advanced Breathing',
      subtitle: 'Mudra Pranayamas',
      description: 'Learn advanced mudra pranayamas and breathing techniques for enhanced energy and vitality.',
      icon: 'Wind',
    },
    {
      id: 'wisdom-discussions',
      title: 'Wisdom Discussions',
      subtitle: 'Life Insights',
      description: 'Engage in deep discussions on life, purpose, values, and wisdom, gaining clarity on your path forward.',
      icon: 'BookOpen',
    },
  ],

  whatIsProgram: {
    title: 'What is Medha Yoga Level 2?',
    content: `Medha Yoga Level 2 is an advanced program designed for graduates of Medha Yoga Level 1. This program takes participants deeper into the practices and wisdom of yoga, offering more advanced techniques and profound experiences.

Building upon the foundation established in Level 1, Level 2 focuses on:
- Advanced meditation practices for deeper inner silence
- Mudra pranayamas (hand gestures with breathing) for enhanced energy
- Service activities that cultivate compassion and contribution
- Extended periods of silence for self-reflection
- Deep discussions on life, purpose, and values
- Advanced yoga asanas and practices

The program emphasizes the integration of all practices into daily life, helping participants develop resilience, self-control, and a spirit of service. It is designed for teens who are ready to go deeper and take their practice to the next level.`,
  },

  whoIsItFor: {
    title: 'Who is it for?',
    content: 'Medha Yoga Level 2 is designed for:',
    eligibility: [
      'Graduates of Medha Yoga Level 1',
      'Teens aged 13-18 who have completed MYL-1',
      'Those ready to deepen their practice and understanding',
      'Teens seeking advanced techniques and deeper experiences',
      'Participants committed to regular practice and growth',
    ],
  },

  corePractices: {
    title: 'Main Elements',
    practices: [
      {
        title: 'Service (Seva)',
        description: 'Engage in meaningful service activities that cultivate compassion, humility, and the joy of giving. Service is seen as a path to inner fulfillment.',
      },
      {
        title: 'Mudra Pranayamas',
        description: 'Advanced breathing techniques combined with hand gestures (mudras) that enhance energy flow, balance the nervous system, and deepen meditation.',
      },
      {
        title: 'Advanced Discussions',
        description: 'Deep, meaningful discussions on life, purpose, values, relationships, and wisdom, providing clarity and direction for the journey ahead.',
      },
      {
        title: 'Extended Meditation',
        description: 'Longer meditation sessions that allow participants to experience deeper states of inner silence, peace, and self-awareness.',
      },
      {
        title: 'Silence Practice',
        description: 'Periods of silence that create space for self-reflection, inner growth, and deeper connection with oneself.',
      },
      {
        title: 'Advanced Yoga Practices',
        description: 'More advanced yoga asanas and practices that build strength, flexibility, and deeper awareness of the body-mind connection.',
      },
    ],
  },

  research: {
    title: 'Research & Impact',
    description: 'Studies show significant improvements in Level 2 participants:',
    metrics: [
      {
        id: 'resilience',
        title: 'Resilience',
        value: '+38%',
        description: 'Increase in resilience and ability to handle challenges',
        source: 'Research Study 2023',
      },
      {
        id: 'self-control',
        title: 'Self-Control',
        value: '+31%',
        description: 'Improvement in self-control and emotional regulation',
        source: 'Research Study 2023',
      },
      {
        id: 'wellbeing',
        title: 'Wellbeing',
        value: '+45%',
        description: 'Enhancement in overall wellbeing and life satisfaction',
        source: 'Research Study 2023',
      },
      {
        id: 'service-orientation',
        title: 'Service Orientation',
        value: '+52%',
        description: 'Increase in desire to serve and contribute to society',
        source: 'Research Study 2023',
      },
    ],
  },

  testimonials: [
    {
      id: 'testimonial-1',
      quote: 'Level 2 took my practice to a whole new level. The service activities were life-changing, and I learned so much about myself. The extended meditation sessions were profound.',
      name: 'Rahul',
      age: 17,
      role: 'Student',
      location: 'Bangalore',
    },
    {
      id: 'testimonial-2',
      quote: 'I loved the mudra pranayamas! They gave me so much energy and clarity. The discussions helped me understand my purpose better. This program transformed me.',
      name: 'Priya',
      age: 16,
      role: 'Student',
      location: 'Mumbai',
    },
    {
      id: 'testimonial-3',
      quote: 'The silence practice was challenging but so rewarding. I discovered parts of myself I never knew existed. Level 2 is a must for anyone serious about their growth.',
      name: 'Arjun',
      age: 18,
      role: 'Student',
      location: 'Delhi',
    },
  ],

  founder: {
    name: 'Gurudev Sri Sri Ravi Shankar',
    title: 'Founder, Art of Living Foundation',
    description: 'Gurudev Sri Sri Ravi Shankar is a humanitarian, spiritual leader, and peace advocate. He has dedicated his life to empowering youth and helping them discover their inner potential. Through the Art of Living Foundation, he has touched millions of lives, including thousands of teenagers, helping them navigate the challenges of adolescence with wisdom, confidence, and inner strength.',
  },

  upcomingPrograms: [
    {
      id: 'myl2-jan-2026',
      date: 'January 25-30, 2026',
      location: 'Bangalore Ashram',
      language: 'English',
      duration: '6 days',
      format: 'residential',
      spots: 40,
    },
    {
      id: 'myl2-feb-2026',
      date: 'February 20-25, 2026',
      location: 'Mumbai Center',
      language: 'English',
      duration: '6 days',
      format: 'residential',
      spots: 35,
    },
    {
      id: 'myl2-mar-2026',
      date: 'March 30 - April 4, 2026',
      location: 'Delhi Center',
      language: 'Hindi',
      duration: '6 days',
      format: 'residential',
      spots: 40,
    },
  ],

  faqs: [
    {
      id: 'prerequisite',
      question: 'Do I need to complete Level 1 before joining Level 2?',
      answer: 'Yes, Medha Yoga Level 2 is designed for graduates of Medha Yoga Level 1. The Level 1 program provides the foundation necessary for the advanced practices in Level 2.',
    },
    {
      id: 'difference',
      question: 'What is the difference between Level 1 and Level 2?',
      answer: 'Level 2 builds upon Level 1 with more advanced practices including mudra pranayamas, extended meditation, service activities, and deeper discussions. It is designed for those ready to go deeper in their practice and understanding.',
    },
    {
      id: 'service-activities',
      question: 'What kind of service activities are included?',
      answer: 'Service activities may include helping with program organization, supporting other participants, community service projects, and other meaningful activities that cultivate the spirit of giving and contribution.',
    },
    {
      id: 'silence-practice',
      question: 'What does the silence practice involve?',
      answer: 'The silence practice involves periods of maintaining silence (mauna) to create space for self-reflection and inner growth. It is a powerful practice that deepens self-awareness and inner peace.',
    },
    {
      id: 'duration',
      question: 'Why is Level 2 longer than Level 1?',
      answer: 'Level 2 includes more advanced practices that require more time, including extended meditation sessions, service activities, and deeper discussions. The longer duration allows for a more immersive and transformative experience.',
    },
    {
      id: 'contribution',
      question: 'What is the contribution amount?',
      answer: 'The contribution amount varies by location and helps support the program and social projects. Your contribution makes these programs accessible to teens from all backgrounds. Please contact the center for specific contribution details.',
    },
  ],

  registrationUrl: 'https://programs.vvmvp.org/',
};
