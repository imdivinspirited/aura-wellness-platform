import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { RouteSync } from '@/components/layout/RouteSync';
import { GlobalSEO } from '@/components/seo/GlobalSEO';
import { SeoOverrideProvider } from '@/components/seo/SeoOverrideContext';
import { Ga4AndWebVitals } from '@/components/analytics/Ga4AndWebVitals';
import { ScrollProgressBar } from '@/components/layout/ScrollProgressBar';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

import { updateGlobalLanguage } from '@/lib/i18n';
import { useUserStore } from '@/stores/userStore';
import { MoodCheckModal } from '@/components/onboarding/MoodCheckModal';
import { LanguageSelectionModal } from '@/components/onboarding/LanguageSelectionModal';
import { AppearanceOnboardingModal } from '@/components/onboarding/AppearanceOnboardingModal';
import { useAuthStore } from '@/stores/authStore';
import { useSessionKeepAlive } from '@/hooks/useSessionKeepAlive';
import { useApplyAppearanceToDocument } from '@/hooks/useApplyAppearanceToDocument';
import { useRootAuthStore } from '@/stores/rootAuthStore';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RoleRoute } from '@/components/auth/ProtectedRoute';

import Index from '@/pages/Index';

import CorporateProgram from '@/pages/programs/beginning/CorporateProgram';
import HappinessProgram from '@/pages/programs/beginning/HappinessProgram';
import SahajSamadhiProgram from '@/pages/programs/beginning/SahajSamadhiProgram';
import SilenceRetreatProgram from '@/pages/programs/beginning/SilenceRetreatProgram';
import SriSriYogaProgram from '@/pages/programs/beginning/SriSriYogaProgram';
import WellnessProgram from '@/pages/programs/beginning/Wellness';

import AdvanceMeditationProgram from '@/pages/programs/advance/AdvanceMeditationProgram';
import BlessingsProgram from '@/pages/programs/advance/BlessingsProgram';
import DynamismForSelfNation from './pages/programs/advance/DynamismForSelfNation';
import SriSriYogaDeepDiveLevel2 from '@/pages/programs/advance/SriSriYogaDeepDiveLevel2/SriSriYogaDeepDiveLevel2';
import SamyamPage from '@/pages/programs/advance/samyam/SamyamPage';

import UtkarshaYogaPage from '@/pages/programs/children-teens/utkarsha-yoga/UtkarshaYogaPage';
import MedhaYogaLevel1Page from '@/pages/programs/children-teens/myl-1/MedhaYogaLevel1Page';
import MedhaYogaLevel2Page from '@/pages/programs/children-teens/myl-2/MedhaYogaLevel2Page';
import IntuitionProcessPage from '@/pages/programs/children-teens/intuition-process/IntuitionProcessPage';

import VedicWisdomPage from '@/pages/programs/more/vedic-wisdom/VedicWisdomPage';
import PanchkarmaPage from '@/pages/programs/more/panchkarma/PanchkarmaPage';
import SriSriYogaDeepDivePage from '@/pages/programs/more/sri-sri-yoga-deep-dive/SriSriYogaDeepDivePage';
import HathaYogaPage from '@/pages/programs/more/hatha-yoga/HathaYogaPage';
import SpineCareYogaPage from '@/pages/programs/more/spine-care/SpineCareYogaPage';

import CorporateRetreatsPage from '@/pages/programs/retreats/corporate/CorporateRetreatsPage';
import SelfDesignedGetawaysPage from '@/pages/programs/retreats/self-designed/SelfDesignedGetawaysPage';
import HostYourProgramPage from '@/pages/programs/retreats/host/HostYourProgramPage';

import ShoppingPage from '@/pages/services/shopping/ShoppingPage';
import InternationalVisitorsPage from '@/pages/international/InternationalVisitorsPage';
import CheckoutPage from '@/pages/checkout/CheckoutPage';
import OrdersPage from '@/pages/orders/OrdersPage';
import DiningPage from '@/pages/services/dining/DiningPage';
import StayPage from '@/pages/services/stay/StayPage';
import TransportPage from '@/pages/services/transport/TransportPage';
import FacilitiesPage from '@/pages/services/facilities/FacilitiesPage';

import AboutAshramPage from '@/pages/explore/about/AboutAshramPage';
import MissionVisionPage from '@/pages/explore/mission/MissionVisionPage';
import ArticlesPage from '@/pages/explore/articles/ArticlesPage';
import VideosPage from '@/pages/explore/videos/VideosPage';
import TestimonialsPage from '@/pages/explore/testimonials/TestimonialsPage';

import { EventsListingPage } from '@/pages/events/EventsListingPage';
import EventDetailPage from '@/pages/events/EventDetailPage';
import UpcomingEventsPage from '@/pages/events/UpcomingEventsPage';
import OngoingEventsPage from '@/pages/events/OngoingEventsPage';
import PastEventsPage from '@/pages/events/PastEventsPage';
import { ChannelYoutubeWatchPage } from '@/pages/events/ChannelYoutubeWatchPage';

import { SevaCareersPage } from '@/pages/seva-careers/SevaCareersPage';
import ContactPage from '@/pages/connect/contact/ContactPage';
import SupportPage from '@/pages/connect/support/SupportPage';
import FAQsPage from '@/pages/connect/faqs/FAQsPage';

import NotFound from '@/pages/NotFound';
import Settings from '@/pages/Settings';
import Profile from '@/pages/Profile';
import PublicProfilePage from '@/pages/PublicProfilePage';
import AdminPage from '@/pages/admin/AdminPage';
import PageEditorPage from '@/pages/admin/PageEditorPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import VisualEditor from '@/pages/root/VisualEditor';
import RootLogin from '@/pages/root/RootLogin';
import RootSignup from '@/pages/root/RootSignup';
import RootDashboard from '@/pages/root/RootDashboard';
import { RootProtected } from '@/pages/root/RootProtected';
import CmsPage from '@/pages/CmsPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import VerifySignupPage from '@/pages/auth/VerifySignupPage';
import AuthCallbackPage from '@/pages/auth/AuthCallbackPage';

import { GenericPage, ProgramsPage, ServicesPage, ExplorePage, ConnectPage, OpportunitiesPage, EventsPage } from '@/pages/GenericPage';

const queryClient = new QueryClient();

/* =======================
   APP CONTENT
======================= */
const AppContent = () => {
  const location = useLocation();
  const { hasCompletedLanguageSetup, hasCompletedAppearanceOnboarding, language, appearance } =
    useUserStore();
  useApplyAppearanceToDocument(appearance);
  const initializeAuth = useAuthStore((state) => state.initialize);
  const initializeRootAuth = useRootAuthStore((state) => state.initialize);

  useSessionKeepAlive();

  React.useEffect(() => {
    updateGlobalLanguage(language);
  }, [language]);

  React.useEffect(() => {
    document.documentElement.lang = language?.split('-')[0] || 'en';
  }, [language]);

  React.useEffect(() => {
    initializeAuth().catch((error) => {
      console.warn('Failed to initialize auth:', error);
    });
    initializeRootAuth().catch((error) => {
      console.warn('Failed to initialize root auth:', error);
    });
  }, []);

  /* Recover if a dialog closed without restoring document scroll (Radix edge case). */
  React.useEffect(() => {
    if (!hasCompletedLanguageSetup || !hasCompletedAppearanceOnboarding) return;
    const id = window.requestAnimationFrame(() => {
      const anyOpen =
        document.querySelector('[data-state="open"][role="dialog"]') ||
        document.querySelector('[data-radix-dialog-overlay][data-state="open"]');
      if (!anyOpen) {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }
    });
    return () => window.cancelAnimationFrame(id);
  }, [hasCompletedLanguageSetup, hasCompletedAppearanceOnboarding, location.pathname]);

  return (
    <>
      <GlobalSEO />
      <MoodCheckModal />
      <LanguageSelectionModal />
      <AppearanceOnboardingModal />
      <RouteSync />
      <Routes>
          {/* AUTH */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
          <Route path="/auth/verify-signup" element={<VerifySignupPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

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
          <Route path="/programs/*" element={<GenericPage path="" />} />

          {/* SERVICES */}
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/shopping" element={<ShoppingPage />} />
          <Route path="/international" element={<InternationalVisitorsPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Route>
          <Route path="/services/dining" element={<DiningPage />} />
          <Route path="/services/stay" element={<StayPage />} />
          <Route path="/services/transport" element={<TransportPage />} />
          <Route path="/services/facilities" element={<FacilitiesPage />} />
          <Route path="/services/*" element={<GenericPage path="" />} />

          {/* EVENTS — static paths before /events/:slug or "upcoming"/"ongoing"/"past" are treated as slugs */}
          <Route path="/events" element={<EventsListingPage />} />
          <Route path="/events/youtube/:videoId" element={<ChannelYoutubeWatchPage />} />
          <Route path="/events/upcoming" element={<UpcomingEventsPage />} />
          <Route path="/events/ongoing" element={<OngoingEventsPage />} />
          <Route path="/events/past" element={<PastEventsPage />} />
          <Route path="/events/:slug" element={<EventDetailPage />} />
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

          {/* CMS Pages */}
          <Route path="/p/:slug" element={<CmsPage />} />

          {/* CONNECT */}
          <Route path="/connect" element={<ConnectPage />} />
          <Route path="/connect/contact" element={<ContactPage />} />
          <Route path="/connect/support" element={<SupportPage />} />
          <Route path="/connect/faqs" element={<FAQsPage />} />
          <Route path="/connect/faq" element={<FAQsPage />} />
          <Route path="/connect/*" element={<GenericPage path="" />} />

          {/* SETTINGS & PROFILE */}
          <Route path="/settings" element={<Settings />} />

          {/* Root operator (JWT + session cookie refresh) */}
          <Route path="/root/login" element={<RootLogin />} />
          <Route path="/root/signup" element={<RootSignup />} />
          <Route element={<RootProtected />}>
            <Route path="/root/dashboard" element={<RootDashboard />} />
            <Route path="/root/editor" element={<VisualEditor />} />
          </Route>
          <Route path="/admin/visual-editor" element={<Navigate to="/root/editor" replace />} />
          <Route path="/dashboard" element={<Navigate to="/profile" replace />} />
          {/* Profile handles unauthenticated state itself (shows login/register) */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/u/:userId" element={<PublicProfilePage />} />
          <Route element={<RoleRoute allow={['root', 'admin', 'super_admin', 'content_admin', 'service', 'hr', 'shop', 'finance']} />}>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/pages/:id" element={<PageEditorPage />} />
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
        <SeoOverrideProvider>
          <ScrollProgressBar />
          <Ga4AndWebVitals />
          <AppContent />
        </SeoOverrideProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
