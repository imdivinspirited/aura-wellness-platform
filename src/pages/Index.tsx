import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { HeroSection } from '@/components/home/HeroSection';
import { HomeShowcaseSection } from '@/components/home/HomeShowcaseSection';
import { FeaturedProgramsSection } from '@/components/home/FeaturedProgramsSection';
import { UpcomingEventsSection } from '@/components/home/UpcomingEventsSection';
import { MissionSection } from '@/components/home/MissionSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CTASection } from '@/components/home/CTASection';
import { MoodHomePage } from '@/components/home/MoodHomePage';
import { useUserStore } from '@/stores/userStore';
import { PERSONAL_HOME_VIEW } from '@/hooks/useLogoHomeNavigation';

const Index = () => {
  const [searchParams] = useSearchParams();
  const { currentMood } = useUserStore();

  const hasMood = Boolean(currentMood);
  const showMoodView = hasMood && searchParams.get('view') === PERSONAL_HOME_VIEW;

  return (
    <>
      <MainLayout>
        <div className="relative">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 min-h-[min(42vh,380px)] bg-gradient-to-b from-sky-50/90 via-amber-50/30 to-transparent dark:from-primary/10 dark:via-transparent dark:to-transparent"
            aria-hidden
          />
          <div className="relative z-10">
            {showMoodView ? (
              <div className="container py-6 md:py-8">
                <MoodHomePage />
              </div>
            ) : (
              <div className="flex flex-col">
                <HeroSection />
                <HomeShowcaseSection />
                <FeaturedProgramsSection />
                <UpcomingEventsSection />
                <MissionSection />
                <TestimonialsSection />
                <CTASection />
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default Index;
