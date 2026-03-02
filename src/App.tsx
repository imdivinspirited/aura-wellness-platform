import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
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

/* =======================
   BEGINNING PROGRAMS
======================= */
import CorporateProgram from '@/pages/programs/beginning/CorporateProgram';
import HappinessProgram from '@/pages/programs/beginning/HappinessProgram';
import SahajSamadhiProgram from '@/pages/programs/beginning/SahajSamadhiProgram';
import SilenceRetreatProgram from '@/pages/programs/beginning/SilenceRetreatProgram';
import SriSriYogaProgram from '@/pages/programs/beginning/SriSriYogaProgram';
import WellnessProgram from '@/pages/programs/beginning/Wellness';

/* =======================
   ADVANCED PROGRAMS
======================= */
import AdvanceMeditationProgram from '@/pages/programs/advance/AdvanceMeditationProgram';
import BlessingsProgram from '@/pages/programs/advance/BlessingsProgram';
import DynamismForSelfNation from './pages/programs/advance/DynamismForSelfNation';
import SriSriYogaDeepDiveLevel2 from '@/pages/programs/advance/SriSriYogaDeepDiveLevel2/SriSriYogaDeepDiveLevel2';
/* =======================
   GENERIC PAGES
======================= */
import {
  ConnectPage,
  EventsPage,
  ExplorePage,
  GenericPage,
  OpportunitiesPage,
  ProgramsPage,
  ServicesPage,
} from '@/pages/GenericPage';

/* =======================
   EXPLORE PAGES
======================= */
import AboutAshramPage from '@/pages/explore/about/AboutAshramPage';
import MissionVisionPage from '@/pages/explore/mission/MissionVisionPage';
import ArticlesPage from '@/pages/explore/articles/ArticlesPage';
import VideosPage from '@/pages/explore/videos/VideosPage';
import TestimonialsPage from '@/pages/explore/testimonials/TestimonialsPage';

/* =======================
   CONNECT PAGES
======================= */
import { SevaCareersPage } from '@/pages/seva-careers/SevaCareersPage';
import ContactPage from '@/pages/connect/contact/ContactPage';
import SupportPage from '@/pages/connect/support/SupportPage';
import FAQsPage from '@/pages/connect/faqs/FAQsPage';

/* =======================
   EVENTS PAGES
======================= */
import UpcomingEventsPage from '@/pages/events/UpcomingEventsPage';
import OngoingEventsPage from '@/pages/events/OngoingEventsPage';
import PastEventsPage from '@/pages/events/PastEventsPage';
import { EventsListingPage } from '@/pages/events/EventsListingPage';
import EventDetailPage from '@/pages/events/EventDetailPage';

/* =======================
   CHILDREN & TEENS PROGRAMS
======================= */
import UtkarshaYogaPage from '@/pages/programs/children-teens/utkarsha-yoga/UtkarshaYogaPage';
import MedhaYogaLevel1Page from '@/pages/programs/children-teens/myl-1/MedhaYogaLevel1Page';
import MedhaYogaLevel2Page from '@/pages/programs/children-teens/myl-2/MedhaYogaLevel2Page';
import IntuitionProcessPage from '@/pages/programs/children-teens/intuition-process/IntuitionProcessPage';

/* =======================
   MORE PROGRAMS
======================= */
import VedicWisdomPage from '@/pages/programs/more/vedic-wisdom/VedicWisdomPage';
import PanchkarmaPage from '@/pages/programs/more/panchkarma/PanchkarmaPage';
import SriSriYogaDeepDivePage from '@/pages/programs/more/sri-sri-yoga-deep-dive/SriSriYogaDeepDivePage';
import HathaYogaPage from '@/pages/programs/more/hatha-yoga/HathaYogaPage';
import SpineCareYogaPage from '@/pages/programs/more/spine-care/SpineCareYogaPage';

/* =======================
   RETREATS
======================= */
import CorporateRetreatsPage from '@/pages/programs/retreats/corporate/CorporateRetreatsPage';
import SelfDesignedGetawaysPage from '@/pages/programs/retreats/self-designed/SelfDesignedGetawaysPage';
import HostYourProgramPage from '@/pages/programs/retreats/host/HostYourProgramPage';

/* =======================
   ADVANCED - SAMYAM
======================= */
import SamyamPage from '@/pages/programs/advance/samyam/SamyamPage';

/* =======================
   SERVICES PAGES
======================= */
import ShoppingPage from '@/pages/services/shopping/ShoppingPage';
import DiningPage from '@/pages/services/dining/DiningPage';
import StayPage from '@/pages/services/stay/StayPage';
import TransportPage from '@/pages/services/transport/TransportPage';
import FacilitiesPage from '@/pages/services/facilities/FacilitiesPage';

/* =======================
   CORE PAGES
======================= */
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import Settings from '@/pages/Settings';
import Profile from '@/pages/Profile';

const queryClient = new QueryClient();

/* =======================
   APP CONTENT
======================= */
const AppContent = () => {
  const { hasCompletedLanguageSetup, language } = useUserStore();
  const initializeAuth = useAuthStore((state) => state.initialize);

  React.useEffect(() => {
    updateGlobalLanguage(language);
  }, [language]);

  // Initialize authentication (only once on mount)
  React.useEffect(() => {
    initializeAuth().catch((error) => {
      console.warn('Failed to initialize auth:', error);
    });
  }, []); // Empty deps - only run once on mount

  // Initialize search engine with all documents
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

        {/* ADVANCED PROGRAMS (IMPORTANT: ABOVE /programs/*) */}
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
        <Route path="/programs/*" element={<GenericPage path="" />} />

        {/* SERVICES */}
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/shopping" element={<ShoppingPage />} />
        <Route path="/services/dining" element={<DiningPage />} />
        <Route path="/services/stay" element={<StayPage />} />
        <Route path="/services/transport" element={<TransportPage />} />
        <Route path="/services/facilities" element={<FacilitiesPage />} />
        <Route path="/services/*" element={<GenericPage path="" />} />

        {/* EVENTS */}
        <Route path="/events" element={<EventsListingPage />} />
        <Route path="/events/:slug" element={<EventDetailPage />} />
        <Route path="/events/upcoming" element={<UpcomingEventsPage />} />
        <Route path="/events/ongoing" element={<OngoingEventsPage />} />
        <Route path="/events/past" element={<PastEventsPage />} />
        <Route path="/events/*" element={<GenericPage path="" />} />

        {/* EXPLORE */}
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/explore/about" element={<AboutAshramPage />} />
        <Route path="/explore/mission" element={<MissionVisionPage />} />
        <Route path="/explore/articles" element={<ArticlesPage />} />
        <Route path="/explore/videos" element={<VideosPage />} />
        <Route path="/explore/testimonials" element={<TestimonialsPage />} />
        <Route path="/explore/*" element={<GenericPage path="" />} />

        {/* SEVA & CAREERS */}
        <Route path="/seva-careers" element={<SevaCareersPage />} />
        <Route path="/seva-careers/*" element={<GenericPage path="" />} />

        {/* OPPORTUNITIES */}
        <Route path="/opportunities" element={<OpportunitiesPage />} />
        <Route path="/opportunities/*" element={<GenericPage path="" />} />

        {/* CONNECT */}
        <Route path="/connect" element={<ConnectPage />} />
        <Route path="/connect/contact" element={<ContactPage />} />
        <Route path="/connect/support" element={<SupportPage />} />
        <Route path="/connect/faqs" element={<FAQsPage />} />
        <Route path="/connect/faq" element={<FAQsPage />} /> {/* Alias for backward compatibility */}
        <Route path="/connect/*" element={<GenericPage path="" />} />

        {/* SETTINGS & PROFILE */}
        <Route path="/settings" element={<Settings />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
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
