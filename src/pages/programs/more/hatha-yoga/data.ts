/**
 * Hatha Yoga Sadhana - Program Data
 */

import type { ProgramData } from '../../shared/types';

export const hathaYogaData: ProgramData = {
  id: 'hatha-yoga',
  title: 'Hatha Yoga Sadhana',
  subtitle: 'Traditional Hatha Yoga for Deep Practice',
  description: 'An intensive program focused on traditional Hatha Yoga practices including asanas, pranayama, mudras, bandhas, and meditation. Experience the classical approach to yoga for physical, mental, and spiritual transformation.',
  ageGroup: 'Adults (18+)',
  duration: '7-14 days',
  format: 'residential',
  contributionDisclaimer: 'Your contribution supports social projects and makes these programs accessible to all.',

  benefits: [
    {
      id: 'classical-hatha',
      title: 'Classical Hatha Yoga',
      subtitle: 'Traditional Practice',
      description: 'Learn authentic Hatha Yoga practices as taught in traditional yoga schools, preserving the essence of classical yoga.',
      icon: 'Activity',
    },
    {
      id: 'asanas-mastery',
      title: 'Asana Mastery',
      subtitle: 'Posture Practice',
      description: 'Master Hatha Yoga asanas with proper alignment, holding postures for extended periods to develop strength and flexibility.',
      icon: 'Target',
    },
    {
      id: 'pranayama-advanced',
      title: 'Advanced Pranayama',
      subtitle: 'Breath Control',
      description: 'Learn traditional pranayama techniques including various breathing practices for energy control and mental clarity.',
      icon: 'Wind',
    },
    {
      id: 'mudras-bandhas',
      title: 'Mudras & Bandhas',
      subtitle: 'Energy Locks',
      description: 'Master hand gestures (mudras) and energy locks (bandhas) to channel and control prana (life force energy).',
      icon: 'Hand',
    },
    {
      id: 'meditation-depth',
      title: 'Deep Meditation',
      subtitle: 'Inner Silence',
      description: 'Experience extended meditation sessions and deeper states of consciousness through traditional Hatha Yoga meditation.',
      icon: 'Moon',
    },
    {
      id: 'spiritual-growth',
      title: 'Spiritual Growth',
      subtitle: 'Inner Transformation',
      description: 'Experience profound spiritual growth and inner transformation through dedicated Hatha Yoga practice.',
      icon: 'Flower',
    },
  ],

  whatIsProgram: {
    title: 'What is Hatha Yoga Sadhana?',
    content: `Hatha Yoga Sadhana is an intensive residential program dedicated to the traditional practice of Hatha Yoga. "Hatha" means force or effort, and "Sadhana" means spiritual practice or discipline. This program focuses on the classical approach to yoga, emphasizing physical postures, breath control, energy locks, and meditation.

The program includes:
- **Classical Asanas**: Traditional Hatha Yoga postures practiced with proper alignment and held for extended periods
- **Pranayama**: Various breathing techniques for energy control, mental clarity, and spiritual development
- **Mudras**: Hand gestures and body positions that channel and direct prana (life force energy)
- **Bandhas**: Energy locks that control the flow of prana in the body
- **Meditation**: Extended meditation sessions for deep inner silence and spiritual growth
- **Yoga Philosophy**: Understanding the principles and philosophy underlying Hatha Yoga practice

This program is designed for serious practitioners who want to experience the depth and power of traditional Hatha Yoga.`,
  },

  whoIsItFor: {
    title: 'Who is it for?',
    content: 'Hatha Yoga Sadhana is designed for:',
    eligibility: [
      'Adults (18+) with prior yoga experience',
      'Serious yoga practitioners seeking traditional Hatha Yoga',
      'Those interested in classical yoga practices and philosophy',
      'Individuals ready for intensive practice and discipline',
      'Yoga teachers wanting to deepen their understanding',
      'Anyone committed to spiritual growth through yoga',
    ],
  },

  corePractices: {
    title: 'Program Elements',
    practices: [
      {
        title: 'Classical Hatha Asanas',
        description: 'Traditional Hatha Yoga postures practiced with proper alignment, held for extended periods to develop strength, flexibility, and awareness.',
      },
      {
        title: 'Pranayama Techniques',
        description: 'Various breathing practices including basic and advanced pranayama techniques for energy control and mental clarity.',
      },
      {
        title: 'Mudras (Hand Gestures)',
        description: 'Learn traditional mudras that channel and direct prana (life force energy) for physical, mental, and spiritual benefits.',
      },
      {
        title: 'Bandhas (Energy Locks)',
        description: 'Master the three main bandhas (Mula, Uddiyana, Jalandhara) to control and direct the flow of prana in the body.',
      },
      {
        title: 'Extended Meditation',
        description: 'Long meditation sessions allowing for deep inner silence, spiritual growth, and the experience of higher states of consciousness.',
      },
      {
        title: 'Yoga Philosophy',
        description: 'Study the principles and philosophy underlying Hatha Yoga, including the relationship between body, breath, mind, and spirit.',
      },
    ],
  },

  testimonials: [
    {
      id: 'testimonial-1',
      quote: 'Hatha Yoga Sadhana was a profound experience. The traditional approach, extended practice sessions, and focus on classical techniques gave me a completely new understanding of yoga. My practice has transformed.',
      name: 'Ramesh',
      role: 'Yoga Teacher',
      location: 'Bangalore',
    },
    {
      id: 'testimonial-2',
      quote: 'I loved learning the mudras and bandhas. These practices have added a new dimension to my yoga. The extended meditation sessions were particularly powerful. This is authentic Hatha Yoga.',
      name: 'Sunita',
      role: 'Wellness Practitioner',
      location: 'Mumbai',
    },
    {
      id: 'testimonial-3',
      quote: 'The program deepened my practice in ways I never expected. The traditional approach, combined with expert guidance, helped me understand the true essence of Hatha Yoga. Highly recommended.',
      name: 'Vikram',
      role: 'Engineer',
      location: 'Delhi',
    },
  ],

  founder: {
    name: 'Gurudev Sri Sri Ravi Shankar',
    title: 'Founder, Art of Living Foundation',
    description: 'Gurudev Sri Sri Ravi Shankar is a humanitarian, spiritual leader, and peace advocate. He has preserved and made accessible traditional yoga practices, ensuring that the authentic teachings of Hatha Yoga continue to benefit practitioners worldwide.',
  },

  upcomingPrograms: [
    {
      id: 'hatha-jan-2026',
      date: 'January 5-19, 2026',
      location: 'Rishikesh Center',
      language: 'English',
      duration: '14 days',
      format: 'residential',
      spots: 30,
    },
    {
      id: 'hatha-feb-2026',
      date: 'February 10-17, 2026',
      location: 'Bangalore Ashram',
      language: 'English',
      duration: '7 days',
      format: 'residential',
      spots: 35,
    },
    {
      id: 'hatha-mar-2026',
      date: 'March 15-29, 2026',
      location: 'Rishikesh Center',
      language: 'Hindi',
      duration: '14 days',
      format: 'residential',
      spots: 30,
    },
  ],

  faqs: [
    {
      id: 'prerequisites',
      question: 'What are the prerequisites?',
      answer: 'It is recommended that participants have prior yoga experience and a regular practice. The program is intensive and requires physical capability and commitment to extended practice sessions.',
    },
    {
      id: 'hatha-vs-other',
      question: 'How is this different from other yoga programs?',
      answer: 'Hatha Yoga Sadhana focuses specifically on traditional Hatha Yoga practices, including mudras, bandhas, and classical asanas. The emphasis is on the traditional approach with extended practice sessions and deeper exploration of these techniques.',
    },
    {
      id: 'intensity',
      question: 'How intensive is the program?',
      answer: 'The program is intensive with extended practice sessions, but modifications are available for different levels. The focus is on deepening your practice at your own pace while maintaining the traditional approach.',
    },
    {
      id: 'mudras-bandhas',
      question: 'Will I learn all mudras and bandhas?',
      answer: 'The program covers the main mudras and the three primary bandhas (Mula, Uddiyana, Jalandhara). Advanced practitioners may explore additional techniques based on their readiness and the instructor\'s guidance.',
    },
    {
      id: 'daily-schedule',
      question: 'What is the daily schedule?',
      answer: 'The schedule includes extended asana practice, pranayama, mudras, bandhas, meditation, and philosophy sessions. The program is intensive but balanced with adequate rest and integration time.',
    },
    {
      id: 'contribution',
      question: 'What is the contribution amount?',
      answer: 'The contribution amount varies by location and program duration. Your contribution supports the program and social projects. Please contact the center for specific contribution details.',
    },
  ],

  registrationUrl: 'https://programs.vvmvp.org/',
};
