/**
 * About the Ashram Page
 *
 * Comprehensive page introducing the ashram's history, facilities, and significance.
 */

import { MainLayout } from '@/components/layout/MainLayout';
import { HeroSection } from './components/HeroSection';
import { TimelineSection } from './components/TimelineSection';
import { DailyLifeSection } from './components/DailyLifeSection';
import { FacilitiesSection } from './components/FacilitiesSection';
import { GlobalSignificanceSection } from './components/GlobalSignificanceSection';
import { MapGallerySection } from './components/MapGallerySection';
import { aboutAshramData } from './data';

const AboutAshramPage = () => {
  return (
    <MainLayout>
      <HeroSection data={aboutAshramData.hero} />
      <TimelineSection events={aboutAshramData.timeline} />
      <DailyLifeSection activities={aboutAshramData.dailyLife} />
      <FacilitiesSection facilities={aboutAshramData.facilities} />
      <GlobalSignificanceSection statistics={aboutAshramData.statistics} />
      <MapGallerySection mapLocation={aboutAshramData.mapLocation} />
    </MainLayout>
  );
};

export default AboutAshramPage;
