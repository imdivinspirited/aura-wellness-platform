// ==================== TYPE DEFINITIONS ====================
export type Language = 'English' | 'Hindi' | 'Tamil' | 'Telugu' | 'Kannada' | 'Marathi';

export interface Benefit {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string; // Icon name from lucide-react
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  age?: number;
  photo?: string;
}

export interface UpcomingProgram {
  id: string;
  date: string;
  name: string;
  location: string;
  language: Language;
  duration: string;
  spots?: number;
  registerUrl?: string;
}

export interface ProgramData {
  title: string;
  subtitle: string;
  description: string;
  format: string;
  contributionDisclaimer: string;
  benefits: Benefit[];
  deepDescription: {
    title: string;
    ampConcept: string;
    yogicTechniques: string[];
  };
  testimonials: Testimonial[];
  founder: {
    name: string;
    title: string;
    description: string;
  };
  upcomingPrograms: UpcomingProgram[];
}

// ==================== PROGRAM DATA ====================
export const programData: ProgramData = {
  title: 'Sri Sri Yoga Deep Dive (Level 2)',
  subtitle: 'Advanced Practice for Transformation',
  description: 'Deepen your yoga practice with advanced techniques that integrate body, mind, and spirit. This intensive program builds upon Level 1 foundations, offering profound insights into yogic wisdom and transformative practices.',
  format: '3–4 day residential format',
  contributionDisclaimer: 'Your contribution supports social projects and makes these programs accessible to all.',
  benefits: [
    {
      id: '1',
      title: 'Wipe out Diseases',
      subtitle: 'Preventive Health',
      description: 'Advanced yogic practices strengthen the immune system, improve organ function, and help prevent lifestyle-related diseases through holistic wellness.',
      icon: 'Heart',
    },
    {
      id: '2',
      title: 'Clarity & Focus',
      subtitle: 'Mental Clarity',
      description: 'Deep meditation and pranayama techniques enhance mental clarity, improve concentration, and bring greater focus to all aspects of life.',
      icon: 'Brain',
    },
    {
      id: '3',
      title: 'Healthy Living',
      subtitle: 'Holistic Wellness',
      description: 'Learn advanced lifestyle practices that promote physical vitality, emotional balance, and spiritual growth for complete well-being.',
      icon: 'Sparkles',
    },
    {
      id: '4',
      title: 'Lifestyle Diseases',
      subtitle: 'Prevention & Healing',
      description: 'Comprehensive approach to managing and preventing modern lifestyle diseases through ancient yogic wisdom and practices.',
      icon: 'Shield',
    },
    {
      id: '5',
      title: 'Focus',
      subtitle: 'Enhanced Concentration',
      description: 'Advanced techniques to develop laser-sharp focus, improve productivity, and maintain mental clarity even under pressure.',
      icon: 'Target',
    },
    {
      id: '6',
      title: 'Accomplish More',
      subtitle: 'Peak Performance',
      description: 'Unlock your full potential with practices that enhance energy levels, improve efficiency, and help you achieve more with less effort.',
      icon: 'Zap',
    },
  ],
  deepDescription: {
    title: 'Deep Dive into Advanced Yogic Techniques',
    ampConcept: 'The AMP (Advanced Meditation Program) concept introduces participants to deeper states of consciousness through advanced meditation techniques. This approach integrates ancient wisdom with modern understanding, creating a pathway to profound inner transformation and expanded awareness.',
    yogicTechniques: [
      'Advanced Asanas: Complex postures that build strength, flexibility, and body awareness',
      'Deep Pranayama: Advanced breathing techniques for energy regulation and vitality',
      'Guided Meditation: Progressive meditation practices for deeper states of consciousness',
      'Yogic Philosophy: Ancient wisdom teachings on life, purpose, and inner transformation',
      'Lifestyle Integration: Practical applications of yogic principles in daily life',
      'Energy Work: Techniques for balancing and harmonizing life force energy',
    ],
  },
  testimonials: [
    {
      id: '1',
      quote: 'The Deep Dive program transformed my practice completely. The advanced techniques have brought a new level of awareness and peace to my life.',
      name: 'Priya Sharma',
      role: 'Yoga Teacher',
      age: 38,
    },
    {
      id: '2',
      quote: 'I came with physical limitations, but the program helped me understand that yoga is so much more than poses. The meditation practices have been life-changing.',
      name: 'Rajesh Kumar',
      role: 'Business Executive',
      age: 45,
    },
    {
      id: '3',
      quote: 'The residential format allowed me to fully immerse myself. The combination of asanas, pranayama, and meditation created a profound transformation.',
      name: 'Anjali Menon',
      role: 'Wellness Coach',
      age: 32,
    },
    {
      id: '4',
      quote: 'Level 2 took my practice to a completely different dimension. The advanced techniques have helped me manage stress and find inner clarity.',
      name: 'Vikram Singh',
      role: 'Software Engineer',
      age: 29,
    },
  ],
  founder: {
    name: 'Gurudev Sri Sri Ravi Shankar',
    title: 'Founder, Art of Living Foundation',
    description: 'Global humanitarian, spiritual leader, and ambassador of peace. Gurudev has made authentic yogic practice accessible to all, emphasizing inner transformation over external performance. His teachings have touched millions of lives worldwide, bringing peace, wellness, and spiritual growth to people across 180+ countries.',
  },
  upcomingPrograms: [
    {
      id: '1',
      date: 'Mar 15-18, 2026',
      name: 'Sri Sri Yoga Deep Dive (Level 2)',
      location: 'Bangalore Ashram',
      language: 'English',
      duration: '4 days',
      spots: 25,
      registerUrl: 'https://programs.vvmvp.org/',
    },
    {
      id: '2',
      date: 'Apr 10-13, 2026',
      name: 'Sri Sri Yoga Deep Dive (Level 2)',
      location: 'Mumbai Center',
      language: 'Hindi',
      duration: '4 days',
      spots: 30,
      registerUrl: 'https://programs.vvmvp.org/',
    },
    {
      id: '3',
      date: 'May 5-8, 2026',
      name: 'Sri Sri Yoga Deep Dive (Level 2)',
      location: 'Delhi Center',
      language: 'English',
      duration: '4 days',
      spots: 20,
      registerUrl: 'https://programs.vvmvp.org/',
    },
    {
      id: '4',
      date: 'Jun 12-15, 2026',
      name: 'Sri Sri Yoga Deep Dive (Level 2)',
      location: 'Chennai Center',
      language: 'Tamil',
      duration: '4 days',
      spots: 28,
      registerUrl: 'https://programs.vvmvp.org/',
    },
  ],
};
