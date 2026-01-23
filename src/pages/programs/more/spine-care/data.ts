/**
 * Spine Care Yoga - Program Data
 */

import type { ProgramData } from '../../shared/types';

export const spineCareYogaData: ProgramData = {
  id: 'spine-care',
  title: 'Spine Care Yoga',
  subtitle: 'Heal and Strengthen Your Spine Through Yoga',
  description: 'A specialized program designed to address spinal health through therapeutic yoga practices. Learn specific asanas, movements, and techniques to improve spinal alignment, flexibility, and strength while relieving back pain and discomfort.',
  ageGroup: 'Adults (18+)',
  duration: '5-7 days',
  format: 'residential',
  contributionDisclaimer: 'Your contribution supports social projects and makes these programs accessible to all.',

  benefits: [
    {
      id: 'spinal-alignment',
      title: 'Spinal Alignment',
      subtitle: 'Posture Correction',
      description: 'Improve spinal alignment and posture through targeted yoga practices that address common postural issues.',
      icon: 'Activity',
    },
    {
      id: 'pain-relief',
      title: 'Pain Relief',
      subtitle: 'Back Pain Management',
      description: 'Learn techniques to relieve and manage back pain, neck pain, and other spinal discomfort through therapeutic yoga.',
      icon: 'Heart',
    },
    {
      id: 'flexibility',
      title: 'Spinal Flexibility',
      subtitle: 'Range of Motion',
      description: 'Increase flexibility and range of motion in the spine through gentle, progressive yoga practices.',
      icon: 'Wind',
    },
    {
      id: 'strength',
      title: 'Core Strength',
      subtitle: 'Supporting Muscles',
      description: 'Strengthen core muscles and supporting structures that maintain spinal health and stability.',
      icon: 'Target',
    },
    {
      id: 'awareness',
      title: 'Body Awareness',
      subtitle: 'Mindful Movement',
      description: 'Develop greater awareness of your body, posture, and movement patterns to prevent future spinal issues.',
      icon: 'Brain',
    },
    {
      id: 'daily-practice',
      title: 'Daily Practice',
      subtitle: 'Home Routine',
      description: 'Learn a personalized home practice routine to maintain spinal health and prevent future problems.',
      icon: 'Home',
    },
  ],

  whatIsProgram: {
    title: 'What is Spine Care Yoga?',
    content: `Spine Care Yoga is a specialized therapeutic program designed to address spinal health through targeted yoga practices. The program combines gentle yoga asanas, specific movements, breathing techniques, and body awareness practices to improve spinal alignment, flexibility, and strength.

The program addresses:
- **Common Spinal Issues**: Lower back pain, upper back tension, neck pain, sciatica, and postural problems
- **Spinal Alignment**: Techniques to improve posture and correct spinal misalignment
- **Flexibility & Mobility**: Gentle practices to increase spinal flexibility and range of motion
- **Strength Building**: Core strengthening exercises that support spinal health
- **Pain Management**: Therapeutic practices to relieve and manage spinal discomfort
- **Prevention**: Education and practices to prevent future spinal problems

The program is suitable for individuals with various levels of spinal issues, from mild discomfort to chronic pain. All practices are adapted to individual needs and limitations.`,
  },

  whoIsItFor: {
    title: 'Who is it for?',
    content: 'Spine Care Yoga is beneficial for:',
    eligibility: [
      'Adults (18+) experiencing back pain or spinal discomfort',
      'Those with postural issues or spinal misalignment',
      'People with sedentary lifestyles or desk jobs',
      'Individuals recovering from spinal injuries (with medical clearance)',
      'Those wanting to prevent spinal problems and maintain spinal health',
      'Anyone interested in therapeutic yoga for spinal wellness',
    ],
  },

  corePractices: {
    title: 'Program Elements',
    practices: [
      {
        title: 'Therapeutic Asanas',
        description: 'Gentle, targeted yoga postures specifically designed to address spinal issues, improve alignment, and relieve pain.',
      },
      {
        title: 'Spinal Movements',
        description: 'Specific movements and sequences that mobilize the spine in all directions, improving flexibility and range of motion.',
      },
      {
        title: 'Core Strengthening',
        description: 'Exercises to strengthen the core muscles that support the spine, including the deep stabilizing muscles.',
      },
      {
        title: 'Postural Awareness',
        description: 'Education and practices to develop awareness of posture and movement patterns in daily activities.',
      },
      {
        title: 'Breathing Techniques',
        description: 'Pranayama practices that support spinal health, reduce tension, and promote relaxation.',
      },
      {
        title: 'Home Practice',
        description: 'Learn a personalized home practice routine tailored to your specific needs for ongoing spinal care.',
      },
    ],
  },

  testimonials: [
    {
      id: 'testimonial-1',
      quote: 'I came with chronic lower back pain that I\'d had for years. The Spine Care Yoga program gave me tools and practices that have significantly reduced my pain. I feel stronger and more flexible than I have in a long time.',
      name: 'Kumar',
      role: 'Software Engineer',
      location: 'Bangalore',
    },
    {
      id: 'testimonial-2',
      quote: 'The program was gentle yet effective. I learned specific practices for my spinal issues and gained awareness of how to maintain spinal health. The home practice routine has been invaluable.',
      name: 'Lakshmi',
      role: 'Teacher',
      location: 'Mumbai',
    },
    {
      id: 'testimonial-3',
      quote: 'After years of neck and upper back pain from desk work, this program was a game-changer. I learned postural awareness and practices that I use daily. My pain has reduced dramatically.',
      name: 'Raj',
      role: 'Accountant',
      location: 'Delhi',
    },
  ],

  founder: {
    name: 'Gurudev Sri Sri Ravi Shankar',
    title: 'Founder, Art of Living Foundation',
    description: 'Gurudev Sri Sri Ravi Shankar is a humanitarian, spiritual leader, and peace advocate. He has emphasized the importance of physical health and well-being, making therapeutic yoga practices accessible to help people heal and maintain optimal health.',
  },

  upcomingPrograms: [
    {
      id: 'spine-jan-2026',
      date: 'January 12-18, 2026',
      location: 'Bangalore Ashram',
      language: 'English',
      duration: '7 days',
      format: 'residential',
      spots: 30,
    },
    {
      id: 'spine-feb-2026',
      date: 'February 8-13, 2026',
      location: 'Mumbai Center',
      language: 'English',
      duration: '5 days',
      format: 'residential',
      spots: 25,
    },
    {
      id: 'spine-mar-2026',
      date: 'March 15-21, 2026',
      location: 'Bangalore Ashram',
      language: 'English',
      duration: '7 days',
      format: 'residential',
      spots: 30,
    },
  ],

  faqs: [
    {
      id: 'medical-conditions',
      question: 'Can I attend if I have a serious spinal condition?',
      answer: 'If you have a serious spinal condition, injury, or recent surgery, please consult with your healthcare provider before attending. The program can be adapted to many conditions, but medical clearance may be required for certain cases.',
    },
    {
      id: 'pain-level',
      question: 'What if I\'m in significant pain?',
      answer: 'The program is designed to be gentle and therapeutic. Practices are adapted to your individual needs and limitations. However, if you are in severe pain, please consult with your healthcare provider first.',
    },
    {
      id: 'beginner-friendly',
      question: 'Do I need prior yoga experience?',
      answer: 'No prior yoga experience is required. The program is designed for all levels, and all practices are taught with modifications and variations to suit individual needs.',
    },
    {
      id: 'results',
      question: 'How quickly will I see results?',
      answer: 'Results vary depending on individual conditions and commitment to practice. Many participants experience relief during the program, while others see gradual improvement with continued practice at home.',
    },
    {
      id: 'home-practice',
      question: 'Will I learn a home practice?',
      answer: 'Yes, the program includes learning a personalized home practice routine tailored to your specific needs. This is essential for maintaining the benefits and preventing future problems.',
    },
    {
      id: 'contribution',
      question: 'What is the contribution amount?',
      answer: 'The contribution amount varies by location and program duration. Your contribution supports the program and social projects. Please contact the center for specific contribution details.',
    },
  ],

  registrationUrl: 'https://programs.vvmvp.org/',
};
