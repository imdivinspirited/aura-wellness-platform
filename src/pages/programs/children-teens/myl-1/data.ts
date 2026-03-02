/**
 * Medha Yoga Level 1 - Program Data
 *
 * Complete program information following the provided content.
 */

import type { ProgramData } from '../../shared/types';

export const myl1Data: ProgramData = {
  id: 'myl-1',
  title: 'Medha Yoga Level 1',
  subtitle: 'Empowering Teens to Handle Pressure and Excel',
  description: 'A transformative program designed for teenagers aged 13-18 to handle academic pressure, improve focus, control anger, and develop emotional intelligence. Through yoga, breathing techniques, and life skills, teens learn to navigate challenges with confidence and clarity.',
  ageGroup: '13-18 years',
  duration: '3-4 days',
  format: 'residential',
  contributionDisclaimer: 'Your contribution supports social projects and makes these programs accessible to all.',

  benefits: [
    {
      id: 'handle-pressure',
      title: 'Handle Pressure',
      subtitle: 'Stress Management',
      description: 'Learn effective techniques to manage academic pressure, exam stress, and life challenges with calmness and confidence.',
      icon: 'Shield',
    },
    {
      id: 'improve-focus',
      title: 'Improve Focus',
      subtitle: 'Enhanced Concentration',
      description: 'Develop laser-sharp focus and concentration through meditation and breathing techniques, leading to better academic performance.',
      icon: 'Target',
    },
    {
      id: 'control-anger',
      title: 'Control Anger',
      subtitle: 'Emotional Mastery',
      description: 'Master techniques to manage anger, frustration, and negative emotions, developing emotional intelligence and maturity.',
      icon: 'Brain',
    },
    {
      id: 'boost-confidence',
      title: 'Boost Confidence',
      subtitle: 'Self-Esteem',
      description: 'Build unshakeable self-confidence and self-esteem through self-awareness practices and positive reinforcement.',
      icon: 'Sparkles',
    },
    {
      id: 'better-relationships',
      title: 'Better Relationships',
      subtitle: 'Social Skills',
      description: 'Improve communication skills, empathy, and ability to build healthy relationships with peers, teachers, and family.',
      icon: 'Users',
    },
    {
      id: 'inner-peace',
      title: 'Inner Peace',
      subtitle: 'Mental Clarity',
      description: 'Experience deep inner peace and mental clarity, reducing anxiety and creating space for joy and creativity.',
      icon: 'Heart',
    },
  ],

  whatIsProgram: {
    title: 'What is Medha Yoga Level 1?',
    content: `Medha Yoga Level 1 is a specially designed program for teenagers that combines the ancient wisdom of yoga with modern life skills. The program addresses the unique challenges faced by teens in today's fast-paced world, including academic pressure, peer pressure, emotional turmoil, and the search for identity.

Through a carefully structured curriculum of yoga asanas, pranayama (breathing techniques), meditation, interactive sessions, and group activities, participants learn practical tools to:
- Manage stress and pressure effectively
- Improve focus and academic performance
- Handle emotions with maturity and wisdom
- Build confidence and self-esteem
- Develop better relationships
- Discover their inner potential

The program is conducted in a supportive, non-judgmental environment where teens can express themselves freely, learn from each other, and grow together.`,
  },

  whoIsItFor: {
    title: 'Who is it for?',
    content: 'Medha Yoga Level 1 is designed for teenagers aged 13-18 who want to:',
    eligibility: [
      'Handle academic pressure and exam stress better',
      'Improve focus and concentration for better performance',
      'Learn to manage anger and negative emotions',
      'Build confidence and self-esteem',
      'Develop better relationships with peers and family',
      'Discover their inner potential and purpose',
      'Experience inner peace and mental clarity',
      'Learn life skills for success and happiness',
    ],
  },

  corePractices: {
    title: 'Core Practices & Elements',
    practices: [
      {
        title: 'Yoga Asanas',
        description: 'Age-appropriate yoga postures that strengthen the body, improve flexibility, and enhance physical well-being.',
      },
      {
        title: 'Pranayama (Breathing Techniques)',
        description: 'Powerful breathing exercises that calm the mind, reduce stress, and boost energy levels naturally.',
      },
      {
        title: 'Meditation',
        description: 'Guided meditation sessions that improve focus, reduce anxiety, and bring inner peace and clarity.',
      },
      {
        title: 'Life Skills Sessions',
        description: 'Interactive sessions on time management, goal setting, communication skills, and emotional intelligence.',
      },
      {
        title: 'Group Activities',
        description: 'Fun, engaging group activities that teach teamwork, leadership, and social skills while building friendships.',
      },
      {
        title: 'Discussions & Sharing',
        description: 'Safe space for teens to share experiences, learn from each other, and gain new perspectives on life.',
      },
    ],
  },

  research: {
    title: 'Scientific Research & Impact',
    description: 'Research studies have shown significant improvements in participants:',
    metrics: [
      {
        id: 'accuracy',
        title: 'Accuracy Improvement',
        value: '+22%',
        description: 'Increase in academic accuracy and performance',
        source: 'Research Study 2023',
      },
      {
        id: 'wellbeing',
        title: 'Wellbeing Enhancement',
        value: '+29%',
        description: 'Improvement in overall wellbeing and life satisfaction',
        source: 'Research Study 2023',
      },
      {
        id: 'focus',
        title: 'Focus Enhancement',
        value: '+35%',
        description: 'Improvement in concentration and focus levels',
        source: 'Research Study 2023',
      },
      {
        id: 'stress-reduction',
        title: 'Stress Reduction',
        value: '-42%',
        description: 'Reduction in stress and anxiety levels',
        source: 'Research Study 2023',
      },
    ],
  },

  testimonials: [
    {
      id: 'meera',
      quote: 'Medha Yoga Level 1 changed my life. I used to get so stressed before exams, but now I feel calm and confident. My grades have improved, and I feel happier overall.',
      name: 'Meera',
      age: 16,
      role: 'Student',
      location: 'Bangalore',
    },
    {
      id: 'akshay',
      quote: 'I learned to control my anger and handle pressure better. The breathing techniques really help when I feel overwhelmed. This program gave me tools I use every day.',
      name: 'Akshay',
      age: 15,
      role: 'Student',
      location: 'Mumbai',
    },
    {
      id: 'shriya',
      quote: 'The best part was meeting other teens going through similar challenges. I made great friends and learned so much about myself. My confidence has grown tremendously.',
      name: 'Shriya',
      age: 17,
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
      id: 'myl1-jan-2026',
      date: 'January 20-23, 2026',
      location: 'Bangalore Ashram',
      language: 'English',
      duration: '4 days',
      format: 'residential',
      spots: 60,
    },
    {
      id: 'myl1-feb-2026',
      date: 'February 15-18, 2026',
      location: 'Mumbai Center',
      language: 'English',
      duration: '4 days',
      format: 'residential',
      spots: 50,
    },
    {
      id: 'myl1-mar-2026',
      date: 'March 25-28, 2026',
      location: 'Delhi Center',
      language: 'Hindi',
      duration: '4 days',
      format: 'residential',
      spots: 55,
    },
    {
      id: 'myl1-apr-2026',
      date: 'April 20-23, 2026',
      location: 'Bangalore Ashram',
      language: 'English',
      duration: '4 days',
      format: 'residential',
      spots: 60,
    },
  ],

  faqs: [
    {
      id: 'age-requirement',
      question: 'What is the age requirement for Medha Yoga Level 1?',
      answer: 'Medha Yoga Level 1 is designed for teenagers aged 13-18 years. This age group is ideal as teens are at a crucial stage of development and can benefit greatly from the life skills and techniques taught in the program.',
    },
    {
      id: 'prerequisites',
      question: 'Do I need any prior yoga experience?',
      answer: 'No prior yoga experience is required. The program is designed for beginners and teaches everything from the basics. All practices are age-appropriate and taught in a supportive, non-competitive environment.',
    },
    {
      id: 'academic-benefits',
      question: 'How will this help with my studies?',
      answer: 'The program teaches techniques to improve focus, concentration, and memory. Many participants report better academic performance, reduced exam anxiety, and improved time management skills. The breathing and meditation practices help calm the mind, leading to better retention and recall.',
    },
    {
      id: 'parent-attendance',
      question: 'Do parents need to attend?',
      answer: 'No, parents do not need to attend. The program is designed for teens to participate independently. However, there may be a brief parent orientation session before the program begins to explain the program structure and answer any questions.',
    },
    {
      id: 'what-to-bring',
      question: 'What should I bring to the program?',
      answer: 'Participants should bring comfortable clothing for yoga practice, a water bottle, notebook and pen, and any personal items they may need. A detailed list will be provided upon registration.',
    },
    {
      id: 'contribution',
      question: 'What is the contribution amount?',
      answer: 'The contribution amount varies by location and helps support the program and social projects. Your contribution makes these programs accessible to teens from all backgrounds. Please contact the center for specific contribution details.',
    },
  ],

  registrationUrl: 'https://programs.vvmvp.org/',
};
