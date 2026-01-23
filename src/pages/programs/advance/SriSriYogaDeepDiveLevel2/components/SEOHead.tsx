import { useEffect } from 'react';
import type { ProgramData } from '../data';

interface SEOHeadProps {
  data: ProgramData;
}

/**
 * SEO Component for Sri Sri Yoga Deep Dive Level 2
 * Updates document title and meta tags for better SEO
 */
export const SEOHead = ({ data }: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    const originalTitle = document.title;
    document.title = `${data.title} | Art of Living Foundation`;

    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', data.description);

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${window.location.origin}/programs/advance/sri-sri-yoga-deep-dive-level-2`);

    // Cleanup function
    return () => {
      document.title = originalTitle;
    };
  }, [data]);

  return null;
};
