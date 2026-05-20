import { MainLayout } from '@/components/layout/MainLayout';
import { SupportForm } from './components/SupportForm';
import type { SupportFormValues } from './components/SupportForm';

/**
 * Support Desk Page
 *
 * Express Interest Form for program inquiries featuring:
 * - Full name, email, phone, country
 * - Program selector (all programs categorized)
 * - Preferred call time slots
 * - Query textarea
 * - GDPR-compliant consent checkbox
 *
 * Features:
 * - Client-side validation with Zod
 * - Debounced input validation
 * - Accessible form labels
 * - Success & error states
 * - Form data sanitization
 * - CSRF-ready structure
 */
const SupportPage = () => {
  const handleSubmit = async (data: SupportFormValues) => {
    // In production, this would send data to your backend API
    // For now, we'll simulate an API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Simulate API call
        // In production: await fetch('/api/support', { method: 'POST', body: JSON.stringify(data) })

        // Simulate success (in production, check response)
        if (data.email && data.fullName) {
          resolve();
        } else {
          reject(new Error('Failed to submit form. Please try again.'));
        }
      }, 1500);
    });
  };

  return (
    <MainLayout>
      <div className="container py-8 max-w-4xl">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-light mb-4 text-stone-900">
            Support Desk
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about our programs? Express your interest and our team will get back to you at your preferred time.
          </p>
        </div>

        {/* Support Form */}
        <SupportForm onSubmit={handleSubmit} />
      </div>
    </MainLayout>
  );
};

export default SupportPage;
