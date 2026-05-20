import { MainLayout } from '@/components/layout/MainLayout';
import { IntlHero } from '@/components/international/IntlHero';
import { IntlPersonalizationQuiz } from '@/components/international/IntlPersonalizationQuiz';
import { IntlExperiences } from '@/components/international/IntlExperiences';
import { IntlMeetMaster } from '@/components/international/IntlMeetMaster';
import { IntlTransformation } from '@/components/international/IntlTransformation';
import { IntlTestimonials } from '@/components/international/IntlTestimonials';
import { IntlPlanVisit } from '@/components/international/IntlPlanVisit';
import { IntlStayFacilities } from '@/components/international/IntlStayFacilities';
import { IntlFoodLifestyle } from '@/components/international/IntlFoodLifestyle';
import { IntlWhatToExpect } from '@/components/international/IntlWhatToExpect';
import { IntlGlobalImpact } from '@/components/international/IntlGlobalImpact';
import { IntlScienceBacked } from '@/components/international/IntlScienceBacked';
import { IntlPackages } from '@/components/international/IntlPackages';
import { IntlFAQ } from '@/components/international/IntlFAQ';
import { IntlFinalCTA } from '@/components/international/IntlFinalCTA';
import { IntlStickyCTA } from '@/components/international/IntlStickyCTA';
export default function InternationalVisitorsPage() {
  return (
    <MainLayout hideFooter>

      <IntlHero />
      <IntlPersonalizationQuiz />
      <IntlExperiences />
      <IntlMeetMaster />
      <IntlTransformation />
      <IntlTestimonials />
      <IntlPlanVisit />
      <IntlStayFacilities />
      <IntlFoodLifestyle />
      <IntlWhatToExpect />
      <IntlGlobalImpact />
      <IntlScienceBacked />
      <IntlPackages />
      <IntlFAQ />
      <IntlFinalCTA />
      <IntlStickyCTA />
    </MainLayout>
  );
}
