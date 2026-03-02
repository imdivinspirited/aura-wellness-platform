/**
 * Utkarsha Yoga - Program Data
 *
 * Complete program information following the provided content.
 */

import type { ProgramData } from '../../shared/types';

export const utkarshaYogaData: ProgramData = {
  id: 'utkarsha-yoga',
  title: 'Utkarsha Yoga',
  subtitle: 'Empowering Young Minds Through Yoga',
  description: 'A 4-day residential program designed for children aged 8-13, combining yoga, breathing techniques, and fun activities to boost immunity, resolve anger, improve focus, and enhance joy.',
  ageGroup: '8-13 years',
  duration: '4 days',
  format: 'residential',
  contributionDisclaimer: 'Your contribution supports social projects and makes these programs accessible to all.',

  benefits: [
    {
      id: 'boost-immunity',
      title: 'Boost Immunity',
      subtitle: 'Physical Health',
      description: 'Strengthen the immune system through yoga asanas and breathing exercises, helping children stay healthy and active.',
      icon: 'Heart',
    },
    {
      id: 'resolve-anger',
      title: 'Resolve Anger',
      subtitle: 'Emotional Balance',
      description: 'Learn techniques to manage emotions, handle anger constructively, and develop emotional intelligence.',
      icon: 'Brain',
    },
    {
      id: 'improve-focus',
      title: 'Improve Focus',
      subtitle: 'Mental Clarity',
      description: 'Enhance concentration and attention span through meditation and mindfulness practices designed for children.',
      icon: 'Target',
    },
    {
      id: 'enhance-joy',
      title: 'Enhance Joy',
      subtitle: 'Happiness & Wellbeing',
      description: 'Cultivate inner joy, positivity, and a sense of wonder through playful yoga practices and group activities.',
      icon: 'Sparkles',
    },
  ],

  whatIsProgram: {
    title: 'What is Utkarsha Yoga?',
    content: `Utkarsha Yoga is a specially designed program for children that combines the ancient wisdom of yoga with fun, engaging activities. The program helps children develop physical strength, emotional balance, mental clarity, and spiritual awareness in an age-appropriate and enjoyable way.

Through a series of yoga postures, breathing exercises, games, stories, and group activities, children learn valuable life skills while having fun. The program is conducted in a safe, nurturing environment where children can express themselves freely and learn at their own pace.

The word "Utkarsha" means excellence or elevation. This program aims to elevate children to their highest potential by nurturing their body, mind, and spirit.`,
  },

  whoIsItFor: {
    title: 'Who is it for?',
    content: 'Utkarsha Yoga is designed for children aged 8-13 years who want to:',
    eligibility: [
      'Develop physical strength and flexibility',
      'Learn to manage emotions and handle stress',
      'Improve focus and concentration',
      'Build confidence and self-esteem',
      'Make new friends in a positive environment',
      'Experience joy and inner peace',
    ],
  },

  corePractices: {
    title: 'Core Practices',
    practices: [
      {
        title: 'Yoga Asanas',
        description: 'Age-appropriate yoga postures that strengthen the body, improve flexibility, and enhance coordination.',
      },
      {
        title: 'Breathing Exercises',
        description: 'Simple pranayama techniques that help children calm their minds and boost energy levels.',
      },
      {
        title: 'Meditation & Mindfulness',
        description: 'Guided meditation sessions designed for children to improve focus and inner peace.',
      },
      {
        title: 'Games & Activities',
        description: 'Fun, interactive games that teach values, teamwork, and life skills while keeping children engaged.',
      },
      {
        title: 'Stories & Discussions',
        description: 'Inspiring stories and group discussions that impart wisdom and values in an enjoyable way.',
      },
    ],
  },

  testimonials: [
    {
      id: 'amay',
      quote: 'I loved the yoga classes! I feel stronger and happier now. The breathing exercises help me when I feel angry.',
      name: 'Amay',
      age: 10,
      location: 'Bangalore',
    },
    {
      id: 'meera',
      quote: 'Utkarsha Yoga helped me focus better in school. I also made many new friends. The teachers are so kind and fun!',
      name: 'Meera',
      age: 13,
      location: 'Mumbai',
    },
  ],

  founder: {
    name: 'Gurudev Sri Sri Ravi Shankar',
    title: 'Founder, Art of Living Foundation',
    description: 'Gurudev Sri Sri Ravi Shankar is a humanitarian, spiritual leader, and peace advocate. He has dedicated his life to bringing peace, joy, and wellness to people worldwide. Through the Art of Living Foundation, he has touched millions of lives, including children and youth, helping them discover their inner potential and live with greater awareness and compassion.',
  },

  upcomingPrograms: [
    {
      id: 'uy-jan-2026',
      date: 'January 15-18, 2026',
      location: 'Bangalore Ashram',
      language: 'English',
      duration: '4 days',
      format: 'residential',
      spots: 50,
    },
    {
      id: 'uy-feb-2026',
      date: 'February 10-13, 2026',
      location: 'Mumbai Center',
      language: 'English',
      duration: '4 days',
      format: 'residential',
      spots: 40,
    },
    {
      id: 'uy-mar-2026',
      date: 'March 20-23, 2026',
      location: 'Delhi Center',
      language: 'Hindi',
      duration: '4 days',
      format: 'residential',
      spots: 45,
    },
    {
      id: 'uy-apr-2026',
      date: 'April 15-18, 2026',
      location: 'Bangalore Ashram',
      language: 'English',
      duration: '4 days',
      format: 'residential',
      spots: 50,
    },
  ],

  faqs: [
    {
      id: 'age-requirement',
      question: 'What is the age requirement for Utkarsha Yoga?',
      answer: 'Utkarsha Yoga is designed for children aged 8-13 years. This age group is ideal as children are old enough to understand and practice yoga while still being young enough to benefit from the playful, engaging approach of the program.',
    },
    {
      id: 'parent-attendance',
      question: 'Do parents need to attend with their children?',
      answer: 'No, parents do not need to attend. The program is designed for children to participate independently. However, parents are welcome to drop off and pick up their children. There may be a parent orientation session before the program begins.',
    },
    {
      id: 'what-to-bring',
      question: 'What should children bring to the program?',
      answer: 'Children should bring comfortable clothing for yoga practice, a water bottle, and any personal items they may need. A detailed list will be provided upon registration.',
    },
    {
      id: 'residential-facilities',
      question: 'What are the residential facilities like?',
      answer: 'The program is conducted in safe, clean facilities with proper accommodation, nutritious meals, and 24/7 supervision. All facilities are child-friendly and designed to ensure comfort and safety.',
    },
    {
      id: 'contribution',
      question: 'What is the contribution amount?',
      answer: 'The contribution amount varies by location and helps support the program and social projects. Your contribution makes these programs accessible to children from all backgrounds. Please contact the center for specific contribution details.',
    },
  ],

  registrationUrl: 'https://programs.vvmvp.org/',
};
