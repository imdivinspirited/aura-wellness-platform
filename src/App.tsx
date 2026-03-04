import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { RouteSync } from '@/components/layout/RouteSync';
import { LanguageSelectionModal } from '@/components/onboarding/LanguageSelectionModal';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

import { updateGlobalLanguage } from '@/lib/i18n';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { initializeSearchWithData } from '@/lib/search/services/dataCollection';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

/* Only the home page is eagerly loaded */
import Index from '@/pages/Index';

/* Lazy-loaded pages — split into separate chunks */
const CorporateProgram = React.lazy(() => import('@/pages/programs/beginning/CorporateProgram'));
const HappinessProgram = React.lazy(() => import('@/pages/programs/beginning/HappinessProgram'));
const SahajSamadhiProgram = React.lazy(() => import('@/pages/programs/beginning/SahajSamadhiProgram'));
const SilenceRetreatProgram = React.lazy(() => import('@/pages/programs/beginning/SilenceRetreatProgram'));
const SriSriYogaProgram = React.lazy(() => import('@/pages/programs/beginning/SriSriYogaProgram'));
const WellnessProgram = React.lazy(() => import('@/pages/programs/beginning/Wellness'));

const AdvanceMeditationProgram = React.lazy(() => import('@/pages/programs/advance/AdvanceMeditationProgram'));
const BlessingsProgram = React.lazy(() => import('@/pages/programs/advance/BlessingsProgram'));
const DynamismForSelfNation = React.lazy(() => import('./pages/programs/advance/DynamismForSelfNation'));
const SriSriYogaDeepDiveLevel2 = React.lazy(() => import('@/pages/programs/advance/SriSriYogaDeepDiveLevel2/SriSriYogaDeepDiveLevel2'));
const SamyamPage = React.lazy(() => import('@/pages/programs/advance/samyam/SamyamPage'));

const UtkarshaYogaPage = React.lazy(() => import('@/pages/programs/children-teens/utkarsha-yoga/UtkarshaYogaPage'));
const MedhaYogaLevel1Page = React.lazy(() => import('@/pages/programs/children-teens/myl-1/MedhaYogaLevel1Page'));
const MedhaYogaLevel2Page = React.lazy(() => import('@/pages/programs/children-teens/myl-2/MedhaYogaLevel2Page'));
const IntuitionProcessPage = React.lazy(() => import('@/pages/programs/children-teens/intuition-process/IntuitionProcessPage'));

const VedicWisdomPage = React.lazy(() => import('@/pages/programs/more/vedic-wisdom/VedicWisdomPage'));
const PanchkarmaPage = React.lazy(() => import('@/pages/programs/more/panchkarma/PanchkarmaPage'));
const SriSriYogaDeepDivePage = React.lazy(() => import('@/pages/programs/more/sri-sri-yoga-deep-dive/SriSriYogaDeepDivePage'));
const HathaYogaPage = React.lazy(() => import('@/pages/programs/more/hatha-yoga/HathaYogaPage'));
const SpineCareYogaPage = React.lazy(() => import('@/pages/programs/more/spine-care/SpineCareYogaPage'));

const CorporateRetreatsPage = React.lazy(() => import('@/pages/programs/retreats/corporate/CorporateRetreatsPage'));
const SelfDesignedGetawaysPage = React.lazy(() => import('@/pages/programs/retreats/self-designed/SelfDesignedGetawaysPage'));
const HostYourProgramPage = React.lazy(() => import('@/pages/programs/retreats/host/HostYourProgramPage'));

const ShoppingPage = React.lazy(() => import('@/pages/services/shopping/ShoppingPage'));
const DiningPage = React.lazy(() => import('@/pages/services/dining/DiningPage'));
const StayPage = React.lazy(() => import('@/pages/services/stay/StayPage'));
const TransportPage = React.lazy(() => import('@/pages/services/transport/TransportPage'));
const FacilitiesPage = React.lazy(() => import('@/pages/services/facilities/FacilitiesPage'));

const AboutAshramPage = React.lazy(() => import('@/pages/explore/about/AboutAshramPage'));
const MissionVisionPage = React.lazy(() => import('@/pages/explore/mission/MissionVisionPage'));
const ArticlesPage = React.lazy(() => import('@/pages/explore/articles/ArticlesPage'));
const VideosPage = React.lazy(() => import('@/pages/explore/videos/VideosPage'));
const TestimonialsPage = React.lazy(() => import('@/pages/explore/testimonials/TestimonialsPage'));

const EventsListingPage = React.lazy(() => import('@/pages/events/EventsListingPage').then(m => ({ default: m.EventsListingPage })));
const EventDetailPage = React.lazy(() => import('@/pages/events/EventDetailPage'));
const UpcomingEventsPage = React.lazy(() => import('@/pages/events/UpcomingEventsPage'));
const OngoingEventsPage = React.lazy(() => import('@/pages/events/OngoingEventsPage'));
const PastEventsPage = React.lazy(() => import('@/pages/events/PastEventsPage'));

const SevaCareersPage = React.lazy(() => import('@/pages/seva-careers/SevaCareersPage').then(m => ({ default: m.SevaCareersPage })));
const ContactPage = React.lazy(() => import('@/pages/connect/contact/ContactPage'));
const SupportPage = React.lazy(() => import('@/pages/connect/support/SupportPage'));
const FAQsPage = React.lazy(() => import('@/pages/connect/faqs/FAQsPage'));

const NotFound = React.lazy(() => import('@/pages/NotFound'));
const Settings = React.lazy(() => import('@/pages/Settings'));
const Profile = React.lazy(() => import('@/pages/Profile'));

/* Generic pages - lazy loaded */
const GenericPageLazy = React.lazy(() => import('@/pages/GenericPage').then(m => ({ default: (props: any) => React.createElement(m.GenericPage, props) })));
const ProgramsPage = React.lazy(() => import('@/pages/GenericPage').then(m => ({ default: m.ProgramsPage })));
const ServicesPage = React.lazy(() => import('@/pages/GenericPage').then(m => ({ default: m.ServicesPage })));
const ExplorePage = React.lazy(() => import('@/pages/GenericPage').then(m => ({ default: m.ExplorePage })));
const ConnectPage = React.lazy(() => import('@/pages/GenericPage').then(m => ({ default: m.ConnectPage })));
const OpportunitiesPage = React.lazy(() => import('@/pages/GenericPage').then(m => ({ default: m.OpportunitiesPage })));
const EventsPage = React.lazy(() => import('@/pages/GenericPage').then(m => ({ default: m.EventsPage })));

const queryClient = new QueryClient();

/* Minimal loading fallback */
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

/* =======================
   APP CONTENT
======================= */
const AppContent = () => {
  const { hasCompletedLanguageSetup, language } = useUserStore();
  const initializeAuth = useAuthStore((state) => state.initialize);

  React.useEffect(() => {
    updateGlobalLanguage(language);
  }, [language]);

  React.useEffect(() => {
    initializeAuth().catch((error) => {
      console.warn('Failed to initialize auth:', error);
    });
  }, []);

  React.useEffect(() => {
    initializeSearchWithData().catch((error) => {
      console.warn('Failed to initialize search engine:', error);
    });
  }, []);

  if (!hasCompletedLanguageSetup) {
    return <LanguageSelectionModal />;
  }

  return (
    <>
      <LanguageSelectionModal />
      <RouteSync />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* HOME */}
          <Route path="/" element={<Index />} />

          {/* PROGRAMS ROOT */}
          <Route path="/programs" element={<ProgramsPage />} />

          {/* BEGINNING PROGRAMS */}
          <Route path="/programs/happiness-program" element={<HappinessProgram />} />
          <Route path="/programs/corporate" element={<CorporateProgram />} />
          <Route path="/programs/sahaj-samadhi" element={<SahajSamadhiProgram />} />
          <Route path="/programs/sri-sri-yoga" element={<SriSriYogaProgram />} />
          <Route path="/programs/silence-retreat" element={<SilenceRetreatProgram />} />
          <Route path="/programs/wellness" element={<WellnessProgram />} />

          {/* ADVANCED PROGRAMS */}
          <Route path="/programs/advance/amp" element={<AdvanceMeditationProgram />} />
          <Route path="/programs/advance/dsn" element={<DynamismForSelfNation />} />
          <Route path="/programs/advance/blessings" element={<BlessingsProgram />} />
          <Route path="/programs/advance/sri-sri-yoga-deep-dive-level-2" element={<SriSriYogaDeepDiveLevel2 />} />
          <Route path="/programs/advance/samyam" element={<SamyamPage />} />

          {/* CHILDREN & TEENS PROGRAMS */}
          <Route path="/programs/uy" element={<UtkarshaYogaPage />} />
          <Route path="/programs/utkarsha-yoga" element={<UtkarshaYogaPage />} />
          <Route path="/programs/myl-1" element={<MedhaYogaLevel1Page />} />
          <Route path="/programs/myl-2" element={<MedhaYogaLevel2Page />} />
          <Route path="/programs/ip" element={<IntuitionProcessPage />} />
          <Route path="/programs/intuition-process" element={<IntuitionProcessPage />} />

          {/* MORE PROGRAMS */}
          <Route path="/programs/vedic-wisdom" element={<VedicWisdomPage />} />
          <Route path="/programs/panchkarma" element={<PanchkarmaPage />} />
          <Route path="/programs/yoga-deep-dive" element={<SriSriYogaDeepDivePage />} />
          <Route path="/programs/hatha-yoga" element={<HathaYogaPage />} />
          <Route path="/programs/spine-care" element={<SpineCareYogaPage />} />

          {/* RETREATS */}
          <Route path="/programs/corporate-retreats" element={<CorporateRetreatsPage />} />
          <Route path="/programs/self-designed" element={<SelfDesignedGetawaysPage />} />
          <Route path="/programs/host" element={<HostYourProgramPage />} />

          {/* PROGRAMS FALLBACK */}
          <Route path="/programs/*" element={<GenericPageLazy path="" />} />

          {/* SERVICES */}
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/shopping" element={<ShoppingPage />} />
          <Route path="/services/dining" element={<DiningPage />} />
          <Route path="/services/stay" element={<StayPage />} />
          <Route path="/services/transport" element={<TransportPage />} />
          <Route path="/services/facilities" element={<FacilitiesPage />} />
          <Route path="/services/*" element={<GenericPageLazy path="" />} />

          {/* EVENTS */}
          <Route path="/events" element={<EventsListingPage />} />
          <Route path="/events/:slug" element={<EventDetailPage />} />
          <Route path="/events/upcoming" element={<UpcomingEventsPage />} />
          <Route path="/events/ongoing" element={<OngoingEventsPage />} />
          <Route path="/events/past" element={<PastEventsPage />} />
          <Route path="/events/*" element={<GenericPageLazy path="" />} />

          {/* EXPLORE */}
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/explore/about" element={<AboutAshramPage />} />
          <Route path="/explore/mission" element={<MissionVisionPage />} />
          <Route path="/explore/articles" element={<ArticlesPage />} />
          <Route path="/explore/videos" element={<VideosPage />} />
          <Route path="/explore/testimonials" element={<TestimonialsPage />} />
          <Route path="/explore/*" element={<GenericPageLazy path="" />} />

          {/* SEVA & CAREERS */}
          <Route path="/seva-careers" element={<SevaCareersPage />} />
          <Route path="/seva-careers/*" element={<GenericPageLazy path="" />} />

          {/* OPPORTUNITIES */}
          <Route path="/opportunities" element={<OpportunitiesPage />} />
          <Route path="/opportunities/*" element={<GenericPageLazy path="" />} />

          {/* CONNECT */}
          <Route path="/connect" element={<ConnectPage />} />
          <Route path="/connect/contact" element={<ContactPage />} />
          <Route path="/connect/support" element={<SupportPage />} />
          <Route path="/connect/faqs" element={<FAQsPage />} />
          <Route path="/connect/faq" element={<FAQsPage />} />
          <Route path="/connect/*" element={<GenericPageLazy path="" />} />

          {/* SETTINGS & PROFILE */}
          <Route path="/settings" element={<Settings />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

/* =======================
   APP WRAPPER
======================= */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
