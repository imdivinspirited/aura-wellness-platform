/**
 * Panchkarma - Program Data
 */

import type { ProgramData } from '../../shared/types';

export const panchkarmaData: ProgramData = {
  id: 'panchkarma',
  title: 'Panchkarma',
  subtitle: 'Deep Cleansing & Rejuvenation Through Ayurveda',
  description: 'A comprehensive Ayurvedic detoxification and rejuvenation program that uses five therapeutic procedures to cleanse the body, balance doshas, and restore optimal health. Experience deep healing through traditional Panchkarma treatments.',
  ageGroup: 'Adults (18+)',
  duration: '14-21 days',
  format: 'residential',
  contributionDisclaimer: 'Your contribution supports social projects and makes these programs accessible to all.',

  benefits: [
    {
      id: 'detoxification',
      title: 'Deep Detoxification',
      subtitle: 'Body Cleansing',
      description: 'Remove accumulated toxins from the body through five specialized therapeutic procedures that cleanse at the deepest level.',
      icon: 'Sparkles',
    },
    {
      id: 'dosha-balance',
      title: 'Dosha Balance',
      subtitle: 'Ayurvedic Balance',
      description: 'Restore balance to Vata, Pitta, and Kapha doshas, bringing harmony to body, mind, and spirit.',
      icon: 'Scale',
    },
    {
      id: 'rejuvenation',
      title: 'Rejuvenation',
      subtitle: 'Youthful Vitality',
      description: 'Experience deep rejuvenation and restoration of energy, vitality, and overall well-being.',
      icon: 'Heart',
    },
    {
      id: 'digestive-health',
      title: 'Digestive Health',
      subtitle: 'Optimal Digestion',
      description: 'Improve digestive function, metabolism, and absorption of nutrients for better health.',
      icon: 'Apple',
    },
    {
      id: 'mental-clarity',
      title: 'Mental Clarity',
      subtitle: 'Clear Mind',
      description: 'Achieve mental clarity, improved focus, and emotional balance through holistic healing.',
      icon: 'Brain',
    },
    {
      id: 'chronic-conditions',
      title: 'Chronic Conditions',
      subtitle: 'Natural Healing',
      description: 'Support healing of chronic conditions, pain management, and restoration of natural health.',
      icon: 'Cross',
    },
  ],

  whatIsProgram: {
    title: 'What is Panchkarma?',
    content: `Panchkarma is a comprehensive Ayurvedic detoxification and rejuvenation program that has been practiced for thousands of years. The name "Panchkarma" means "five actions" or "five procedures," referring to five specialized therapeutic treatments designed to cleanse the body of accumulated toxins (ama) and restore balance to the doshas.

The program includes:
- **Vamana (Therapeutic Emesis)**: Cleansing of the upper respiratory tract and stomach
- **Virechana (Purgation)**: Cleansing of the intestines and liver
- **Basti (Enema Therapy)**: Cleansing and nourishing of the colon
- **Nasya (Nasal Administration)**: Cleansing of the head and neck region
- **Raktamokshana (Bloodletting)**: Purification of the blood (when indicated)

Each treatment is customized based on individual constitution (Prakriti), current imbalances (Vikriti), and specific health needs. The program is conducted under the supervision of experienced Ayurvedic doctors and therapists.`,
  },

  whoIsItFor: {
    title: 'Who is it for?',
    content: 'Panchkarma is beneficial for:',
    eligibility: [
      'Adults (18+) seeking deep detoxification and rejuvenation',
      'Those with chronic health conditions seeking natural healing',
      'Individuals experiencing digestive issues, fatigue, or low immunity',
      'People with stress-related disorders, anxiety, or insomnia',
      'Those wanting to prevent disease and maintain optimal health',
      'Anyone ready for a comprehensive Ayurvedic healing experience',
    ],
  },

  corePractices: {
    title: 'Panchkarma Procedures',
    practices: [
      {
        title: 'Preparatory Phase (Purvakarma)',
        description: 'Pre-treatment procedures including oil massage (Abhyanga), steam therapy (Swedana), and internal oleation to prepare the body for deep cleansing.',
      },
      {
        title: 'Vamana (Therapeutic Emesis)',
        description: 'Controlled therapeutic vomiting to eliminate excess Kapha dosha and toxins from the upper respiratory tract, stomach, and head region.',
      },
      {
        title: 'Virechana (Purgation)',
        description: 'Medicated purgation to cleanse the intestines, liver, and eliminate excess Pitta dosha and toxins from the digestive system.',
      },
      {
        title: 'Basti (Enema Therapy)',
        description: 'Medicated enemas using herbal decoctions and oils to cleanse and nourish the colon, balance Vata dosha, and support overall health.',
      },
      {
        title: 'Nasya (Nasal Administration)',
        description: 'Administration of medicated oils or powders through the nasal passages to cleanse the head, neck, and upper respiratory system.',
      },
      {
        title: 'Post-Treatment Care (Paschatkarma)',
        description: 'Gradual reintroduction of diet and lifestyle practices to maintain the benefits of Panchkarma and support long-term health.',
      },
    ],
  },

  testimonials: [
    {
      id: 'testimonial-1',
      quote: 'Panchkarma was a transformative experience. After 21 days, I felt like a new person - more energy, better digestion, and mental clarity I hadn\'t experienced in years. The treatments were gentle yet powerful.',
      name: 'Suresh',
      role: 'Business Executive',
      location: 'Bangalore',
    },
    {
      id: 'testimonial-2',
      quote: 'I came with chronic digestive issues and fatigue. The Panchkarma program addressed the root cause, not just symptoms. I feel rejuvenated and my health has improved dramatically.',
      name: 'Anita',
      role: 'Teacher',
      location: 'Mumbai',
    },
    {
      id: 'testimonial-3',
      quote: 'The care and expertise of the Ayurvedic doctors and therapists was exceptional. The program was customized to my needs, and I experienced deep healing on all levels - physical, mental, and emotional.',
      name: 'Ravi',
      role: 'Engineer',
      location: 'Delhi',
    },
  ],

  founder: {
    name: 'Gurudev Sri Sri Ravi Shankar',
    title: 'Founder, Art of Living Foundation',
    description: 'Gurudev Sri Sri Ravi Shankar is a humanitarian, spiritual leader, and peace advocate. He has been instrumental in reviving and making accessible traditional Ayurvedic practices like Panchkarma, ensuring that this ancient wisdom serves modern health needs.',
  },

  upcomingPrograms: [
    {
      id: 'panchkarma-jan-2026',
      date: 'January 1-21, 2026',
      location: 'Bangalore Ashram',
      language: 'English',
      duration: '21 days',
      format: 'residential',
      spots: 20,
    },
    {
      id: 'panchkarma-feb-2026',
      date: 'February 1-14, 2026',
      location: 'Rishikesh Center',
      language: 'Hindi',
      duration: '14 days',
      format: 'residential',
      spots: 15,
    },
    {
      id: 'panchkarma-mar-2026',
      date: 'March 1-21, 2026',
      location: 'Bangalore Ashram',
      language: 'English',
      duration: '21 days',
      format: 'residential',
      spots: 20,
    },
  ],

  faqs: [
    {
      id: 'duration',
      question: 'Why is Panchkarma 14-21 days?',
      answer: 'Panchkarma requires sufficient time for preparatory treatments, the main cleansing procedures, and post-treatment recovery. The duration allows for deep cleansing, proper healing, and gradual restoration of health. Shorter programs (14 days) focus on specific procedures, while longer programs (21 days) provide comprehensive treatment.',
    },
    {
      id: 'medical-supervision',
      question: 'Is medical supervision provided?',
      answer: 'Yes, all Panchkarma treatments are conducted under the supervision of qualified Ayurvedic doctors who assess your condition, determine the appropriate procedures, and monitor your progress throughout the program.',
    },
    {
      id: 'all-procedures',
      question: 'Will I receive all five procedures?',
      answer: 'Not necessarily. The specific procedures are determined by your individual constitution, current imbalances, and health needs. The Ayurvedic doctor will customize your treatment plan, which may include some or all of the five procedures as appropriate.',
    },
    {
      id: 'diet',
      question: 'What about diet during Panchkarma?',
      answer: 'A specific Ayurvedic diet is prescribed during Panchkarma to support the cleansing process. The diet is light, easily digestible, and designed to enhance the effectiveness of the treatments. Dietary guidelines are provided and meals are prepared according to Ayurvedic principles.',
    },
    {
      id: 'contraindications',
      question: 'Are there any contraindications?',
      answer: 'Panchkarma may not be suitable for pregnant women, those with certain acute conditions, or individuals with specific health concerns. A preliminary consultation with the Ayurvedic doctor will determine your suitability for the program.',
    },
    {
      id: 'contribution',
      question: 'What is the contribution amount?',
      answer: 'The contribution amount varies by location and program duration. It includes accommodation, meals, all treatments, and doctor consultations. Please contact the center for specific contribution details.',
    },
  ],

  registrationUrl: 'https://programs.vvmvp.org/',
};
