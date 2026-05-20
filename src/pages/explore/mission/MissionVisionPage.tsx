/**
 * Mission & Vision Page
 *
 * Communicates philosophy, direction, and impact.
 */

import { MainLayout } from '@/components/layout/MainLayout';
import { HeroSection } from './components/HeroSection';
import { MissionPillarsSection } from './components/MissionPillarsSection';
import { CoreValuesSection } from './components/CoreValuesSection';
import { ImpactStatsSection } from './components/ImpactStatsSection';
import { LeadershipQuotesSection } from './components/LeadershipQuotesSection';
import { RoadmapSection } from './components/RoadmapSection';
import { missionVisionData } from './data';

const MissionVisionPage = () => {
  return (
    <MainLayout>
      <HeroSection data={missionVisionData.hero} />
      <MissionPillarsSection pillars={missionVisionData.missionPillars} />
      <CoreValuesSection values={missionVisionData.coreValues} />
      <ImpactStatsSection stats={missionVisionData.impactStats} />
      <LeadershipQuotesSection quotes={missionVisionData.quotes} />
      <RoadmapSection roadmap={missionVisionData.roadmap} />
    </MainLayout>
  );
};

export default MissionVisionPage;
