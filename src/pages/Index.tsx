import { MainLayout } from '@/components/layout/MainLayout';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedProgramsSection } from '@/components/home/FeaturedProgramsSection';
import { UpcomingEventsSection } from '@/components/home/UpcomingEventsSection';
import { MissionSection } from '@/components/home/MissionSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CTASection } from '@/components/home/CTASection';
import { MoodCheckModal } from '@/components/onboarding/MoodCheckModal';

const Index = () => {
  return (
    <>
      {/* Onboarding Modals */}
      <MoodCheckModal />

      <MainLayout>
        {/* Hero Section */}
        <HeroSection />

        {/* Featured Programs */}
        <FeaturedProgramsSection />

        {/* Upcoming Events */}
        <UpcomingEventsSection />

        {/* Mission & Values */}
        <MissionSection />

        {/* Testimonials */}
        <TestimonialsSection />

        {/* CTA Section */}
        <CTASection />
      </MainLayout>
    </>
  );
};

export default Index;
