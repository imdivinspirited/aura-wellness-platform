import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { programData } from './data';
import { SEOHead } from './components/SEOHead';
import { HeroSection } from './components/HeroSection';
import { ProgramHighlights } from './components/ProgramHighlights';
import { BenefitsGrid } from './components/BenefitsGrid';
import { WorkshopDetails } from './components/WorkshopDetails';
import { DeepDiveTechniques } from './components/DeepDiveTechniques';
import { TestimonialsCarousel } from './components/TestimonialsCarousel';
import { FounderSection } from './components/FounderSection';
import { UpcomingPrograms } from './components/UpcomingPrograms';
import { CTASection } from './components/CTASection';
import { StickyMobileCTA } from './components/StickyMobileCTA';
import { CookieConsent } from './components/CookieConsent';

/**
 * Sri Sri Yoga Deep Dive (Level 2) Program Page
 *
 * A comprehensive landing page for the advanced yoga program featuring:
 * - Hero section with program overview
 * - Program highlights and benefits
 * - Workshop details and format
 * - Deep dive techniques and AMP concept
 * - Participant testimonials
 * - Founder information
 * - Upcoming programs listing
 * - Call-to-action sections
 * - Cookie consent banner
 *
 * Features:
 * - Fully responsive (mobile, tablet, desktop)
 * - Accessible (WCAG 2.1 AA compliant)
 * - SEO optimized
 * - Data-driven design for easy CMS integration
 * - Performance optimized with lazy loading
 */
const SriSriYogaDeepDiveLevel2 = () => {
  const handleRegister = () => {
    // Open registration URL in new tab
    window.open('https://programs.vvmvp.org/', '_blank', 'noopener,noreferrer');
  };

  const handleProgramRegister = (programId: string) => {
    // Handle individual program registration
    handleRegister();
  };

  return (
    <>
      {/* SEO Head */}
      <SEOHead data={programData} />

      <MainLayout>
        {/* Hero Section */}
        <HeroSection data={programData} onRegister={handleRegister} />

        {/* Program Highlights - "What will I get from this workshop?" */}
        <ProgramHighlights benefits={programData.benefits.slice(0, 3)} />

        {/* All Benefits Grid */}
        <BenefitsGrid benefits={programData.benefits} />

        {/* Workshop Details - Format & Contribution */}
        <WorkshopDetails data={programData} />

        {/* Deep Dive Techniques - AMP Concept & Yogic Techniques */}
        <DeepDiveTechniques data={programData} />

        {/* Testimonials */}
        <TestimonialsCarousel testimonials={programData.testimonials} />

        {/* Founder Section */}
        <FounderSection data={programData} />

        {/* Upcoming Programs */}
        <UpcomingPrograms programs={programData.upcomingPrograms} onRegister={handleProgramRegister} />

        {/* Final CTA Section */}
        <CTASection onRegister={handleRegister} />
      </MainLayout>

      {/* Sticky Mobile CTA */}
      <StickyMobileCTA onRegister={handleRegister} />

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </>
  );
};

export default SriSriYogaDeepDiveLevel2;
