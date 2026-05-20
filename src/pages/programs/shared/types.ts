/**
 * Shared Types for Programs
 *
 * Common type definitions used across all program pages.
 */

export type Language = 'English' | 'Hindi' | 'Tamil' | 'Telugu' | 'Kannada' | 'Marathi' | 'Sanskrit' | 'English / Hindi';
export type ProgramFormat = 'residential' | 'online' | 'hybrid';
export type ProgramType = 'in-person' | 'online';

export interface Benefit {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  icon: string; // Icon name from lucide-react
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role?: string;
  age?: number;
  location?: string;
  photo?: string;
}

export interface UpcomingProgram {
  id: string;
  date: string;
  name?: string;
  location: string;
  language: Language;
  duration: string;
  format?: ProgramFormat;
  spots?: number;
  registerUrl?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface ResearchMetric {
  id: string;
  title: string;
  value: string;
  description?: string;
  source?: string;
}

export interface ProgramData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ageGroup?: string;
  duration: string;
  format: ProgramFormat;
  contributionDisclaimer?: string;
  benefits: Benefit[];
  whatIsProgram?: {
    title: string;
    content: string;
    sections?: Array<{
      title: string;
      content: string;
    }>;
  };
  whoIsItFor?: {
    title: string;
    content: string;
    eligibility?: string[];
  };
  corePractices?: {
    title: string;
    practices: Array<{
      title: string;
      description: string;
    }>;
  };
  research?: {
    title: string;
    metrics: ResearchMetric[];
    description?: string;
  };
  testimonials: Testimonial[];
  founder: {
    name: string;
    title: string;
    description: string;
    image?: string;
  };
  upcomingPrograms: UpcomingProgram[];
  faqs: FAQ[];
  registrationUrl?: string;
}
