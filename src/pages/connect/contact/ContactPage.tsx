import { useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { contactPageData } from './data';
import { TransportInfoSection } from './components/TransportInfo';
import { BookingAssistanceSection } from './components/BookingAssistance';
import { TimingsSection } from './components/TimingsSection';
import { StayConnectedSection } from './components/StayConnected';
import { AddressSection } from './components/AddressSection';
import { SocialMediaSection } from './components/SocialMediaSection';
import { HowToReachSection } from './components/HowToReach';
import { MapSection } from './components/MapSection';
import { FounderSection } from './components/FounderSection';

/**
 * Contact Us Page
 *
 * Comprehensive contact information page featuring:
 * - Transport updates (BMTC A/C Bus)
 * - Booking assistance
 * - Timings (Vishalakshi Mantap, Check-in)
 * - Stay Connected (Phone, Email)
 * - Full Address
 * - Social Media links
 * - How to Reach Ashram (NICE Road, Flight, Bus/Metro/Train)
 * - Interactive map
 * - Founder section
 *
 * Features:
 * - Fully responsive
 * - Accessible (WCAG 2.1 AA)
 * - SEO optimized with Schema.org markup
 * - Copy-to-clipboard functionality
 * - Click-to-call/email buttons
 */
const ContactPage = () => {
  useEffect(() => {
    // Update document title
    const originalTitle = document.title;
    document.title = 'Contact Us | Art of Living Foundation';

    // Add Schema.org ContactPage structured data
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      mainEntity: {
        '@type': 'Organization',
        name: contactPageData.address.name,
        address: {
          '@type': 'PostalAddress',
          streetAddress: contactPageData.address.street,
          addressLocality: contactPageData.address.city,
          addressRegion: contactPageData.address.state,
          postalCode: contactPageData.address.pincode,
          addressCountry: contactPageData.address.country,
        },
        telephone: contactPageData.contactMethods.find((m) => m.type === 'phone')?.value,
        email: contactPageData.contactMethods.find((m) => m.type === 'email')?.value,
        url: window.location.origin,
        sameAs: contactPageData.socialMedia.map((sm) => sm.url),
      },
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.title = originalTitle;
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript && existingScript.textContent?.includes('ContactPage')) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <MainLayout>
      <div className="container py-8 max-w-6xl">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-light mb-4 text-stone-900">
            Contact Us
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get in touch with us. We're here to help you with any questions or assistance you may need.
          </p>
        </div>

        {/* Transport Updates */}
        <TransportInfoSection data={contactPageData.transportInfo} />

        {/* Booking Assistance */}
        <BookingAssistanceSection data={contactPageData.bookingAssistance} />

        {/* Timings */}
        <TimingsSection timings={contactPageData.timings} />

        {/* Stay Connected */}
        <StayConnectedSection contactMethods={contactPageData.contactMethods} />

        {/* Full Address */}
        <AddressSection address={contactPageData.address} />

        {/* Social Media */}
        <SocialMediaSection socialMedia={contactPageData.socialMedia} />

        {/* How to Reach Ashram */}
        <HowToReachSection travelOptions={contactPageData.travelOptions} />

        {/* Interactive Map */}
        <MapSection
          lat={contactPageData.mapLocation.lat}
          lng={contactPageData.mapLocation.lng}
          zoom={contactPageData.mapLocation.zoom}
          address={contactPageData.address.fullAddress}
        />

        {/* Founder Section */}
        <FounderSection founder={contactPageData.founder} />
      </div>
    </MainLayout>
  );
};

export default ContactPage;
