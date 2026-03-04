/**
 * Data Collection Service
 *
 * Collects all searchable content from the application
 * and converts it to SearchDocument format for indexing.
 *
 * This service is called on app initialization to build the search index.
 */

import type { SearchDocument, SearchResultType } from '../types';
import { getAllEvents } from '@/pages/events/services/eventService';
import type { Event } from '@/pages/events/types';
import { faqsPageData } from '@/pages/connect/faqs/data';
import type { FAQ } from '@/pages/connect/faqs/data';

/**
 * Convert Event to SearchDocument
 */
function eventToDocument(event: Event): SearchDocument {
  return {
    id: `event-${event.id}`,
    type: 'event' as SearchResultType,
    title: event.title,
    content: `${event.description} ${event.shortDescription || ''} ${event.highlights?.join(' ') || ''}`,
    fields: {
      description: event.shortDescription || event.description.substring(0, 200),
      location: event.location.name || event.location.city || '',
      category: event.category,
      tags: event.tags?.join(', ') || '',
    },
    metadata: {
      url: `/events/${event.slug || event.id}`,
      category: event.category,
      location: event.location.city || event.location.name,
      language: event.languages.join(', '),
      startDate: event.startDate,
      endDate: event.endDate,
      tags: event.tags,
      online: event.location.online,
    },
    indexedAt: Date.now(),
  };
}

/**
 * Convert FAQ to SearchDocument
 */
function faqToDocument(faq: FAQ, index: number): SearchDocument {
  return {
    id: `faq-${faq.id || `faq-${index}`}`,
    type: 'faq' as SearchResultType,
    title: faq.question,
    content: faq.answer,
    fields: {
      category: faq.category,
      answer: faq.answer,
    },
    metadata: {
      url: `/connect/faqs?faq=${faq.id || `faq-${index}`}`,
      category: faq.category,
    },
    indexedAt: Date.now(),
  };
}

/**
 * Program metadata for search
 * These are static program pages that should be searchable
 */
const PROGRAM_PAGES: Array<{
  id: string;
  title: string;
  description: string;
  url: string;
  type: SearchResultType;
  tags?: string[];
}> = [
  {
    id: 'happiness-program',
    title: 'Happiness Program',
    description: 'A comprehensive program designed to bring lasting happiness and inner peace through meditation, breathing techniques, and wisdom.',
    url: '/programs/happiness-program',
    type: 'program',
    tags: ['meditation', 'happiness', 'beginner', 'wellness'],
  },
  {
    id: 'sri-sri-yoga',
    title: 'Sri Sri Yoga',
    description: 'A holistic approach to yoga combining asanas, pranayama, and meditation for physical and mental well-being.',
    url: '/programs/sri-sri-yoga',
    type: 'program',
    tags: ['yoga', 'asanas', 'pranayama', 'meditation'],
  },
  {
    id: 'sahaj-samadhi',
    title: 'Sahaj Samadhi Meditation',
    description: 'An effortless meditation technique that brings deep rest and inner silence, reducing stress and enhancing clarity.',
    url: '/programs/sahaj-samadhi',
    type: 'program',
    tags: ['meditation', 'samadhi', 'stress-relief', 'clarity'],
  },
  {
    id: 'silence-retreat',
    title: 'Silence Retreat',
    description: 'A residential retreat in complete silence to deepen your meditation practice and experience inner transformation.',
    url: '/programs/silence-retreat',
    type: 'program',
    tags: ['retreat', 'silence', 'meditation', 'residential'],
  },
  {
    id: 'corporate-program',
    title: 'Corporate Programs',
    description: 'Wellness programs designed for organizations to improve employee well-being, reduce stress, and enhance productivity.',
    url: '/programs/corporate',
    type: 'program',
    tags: ['corporate', 'wellness', 'stress-management', 'productivity'],
  },
  {
    id: 'amp',
    title: 'Advanced Meditation Program (AMP)',
    description: 'An advanced residential program for deepening meditation practice and experiencing higher states of consciousness.',
    url: '/programs/advance/amp',
    type: 'program',
    tags: ['advanced', 'meditation', 'residential', 'consciousness'],
  },
  {
    id: 'dsn',
    title: 'Dynamism for Self and Nation (DSN)',
    description: 'A leadership program that empowers individuals to contribute to society while achieving personal excellence.',
    url: '/programs/advance/dsn',
    type: 'program',
    tags: ['leadership', 'service', 'excellence', 'society'],
  },
  {
    id: 'blessings',
    title: 'Blessings Program',
    description: 'A spiritual program offering blessings and guidance for life transformation.',
    url: '/programs/advance/blessings',
    type: 'program',
    tags: ['spiritual', 'blessings', 'transformation'],
  },
  {
    id: 'sri-sri-yoga-deep-dive-level-2',
    title: 'Sri Sri Yoga Deep Dive (Level 2)',
    description: 'An advanced yoga program deepening your practice with advanced asanas, pranayama techniques, and yogic wisdom.',
    url: '/programs/advance/sri-sri-yoga-deep-dive-level-2',
    type: 'program',
    tags: ['yoga', 'advanced', 'pranayama', 'yogic-wisdom'],
  },
];

/**
 * Convert program page to SearchDocument
 */
function programToDocument(program: typeof PROGRAM_PAGES[0]): SearchDocument {
  return {
    id: `program-${program.id}`,
    type: program.type,
    title: program.title,
    content: program.description,
    fields: {
      description: program.description,
      tags: program.tags?.join(', ') || '',
    },
    metadata: {
      url: program.url,
      tags: program.tags,
    },
    indexedAt: Date.now(),
  };
}

/**
 * Collect all searchable documents
 *
 * This function gathers content from:
 * - Events
 * - FAQs
 * - Program pages
 *
 * @returns Array of SearchDocuments ready for indexing
 */
export async function collectAllDocuments(): Promise<SearchDocument[]> {
  const documents: SearchDocument[] = [];

  try {
    // Collect events
    const events = await getAllEvents();
    events.forEach((event) => {
      documents.push(eventToDocument(event));
    });
  } catch (error) {
    console.warn('Failed to collect events for search:', error);
  }

  try {
    // Collect FAQs
    faqsPageData.faqs.forEach((faq, index) => {
      documents.push(faqToDocument(faq, index));
    });
  } catch (error) {
    console.warn('Failed to collect FAQs for search:', error);
  }

  try {
    // Collect program pages
    PROGRAM_PAGES.forEach((program) => {
      documents.push(programToDocument(program));
    });
  } catch (error) {
    console.warn('Failed to collect programs for search:', error);
  }

  return documents;
}

/**
 * Initialize search engine with all documents
 *
 * Call this on app initialization to build the search index.
 */
export async function initializeSearchWithData(): Promise<void> {
  const { initializeSearchEngine } = await import('../core/SearchEngine');
  const documents = await collectAllDocuments();
  initializeSearchEngine(documents);

  if (import.meta.env.DEV) {
    console.log(`[Search] Indexed ${documents.length} documents for search`);
  }
}
