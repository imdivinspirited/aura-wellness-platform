import { useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { faqsPageData } from './data';
import { FAQsSection } from './components/FAQsSection';

/**
 * FAQs / Help Center Page
 *
 * Comprehensive FAQ page for NRIs & Foreign Nationals featuring:
 * - Visa & travel questions
 * - Airport → Ashram routing
 * - Health & medical assistance
 * - Cultural considerations
 * - Financial & payment info
 * - Refunds & cancellation
 * - Code of conduct
 * - General FAQs
 * - Volunteer contact information
 *
 * Features:
 * - Search functionality (O(n) with memoization)
 * - Category filtering
 * - Deep-linkable FAQ items
 * - Accordion-based layout
 * - Highlighted important FAQs
 * - Fully responsive
 * - Accessible (WCAG 2.1 AA)
 */
const FAQsPage = () => {
  useEffect(() => {
    // Update document title
    const originalTitle = document.title;
    document.title = 'FAQs / Help Center | Art of Living Foundation';

    // Add Schema.org FAQPage structured data
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqsPageData.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.title = originalTitle;
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript && existingScript.textContent?.includes('FAQPage')) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <MainLayout>
      <div className="container py-8 max-w-4xl">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-light mb-4 text-stone-900">
            FAQs / Help Center
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to commonly asked questions. If you can't find what you're looking for, our volunteer team is here to help.
          </p>
        </div>

        {/* FAQs Section */}
        <FAQsSection data={faqsPageData} />
      </div>
    </MainLayout>
  );
};

export default FAQsPage;
