import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useChatbotStore } from '@/stores/chatbotStore';
import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Footer } from './Footer';
import { touchRootSessionActivity } from '@/lib/root/auth';

import { ChatbotDrawer } from '@/components/chatbot/ChatbotDrawer';
import { Header } from './Header';
import { RouteSync } from './RouteSync';
import { Sidebar } from './Sidebar';
import { BottomMenuBar } from './BottomMenuBar';
import { SubNavBar } from './SubNav';
import { RootOverlay } from '@/components/root';
import { GoogleTranslateBridge } from '@/components/i18n/GoogleTranslateBridge';

interface MainLayoutProps {
  children: ReactNode;
  isLoading?: boolean;
  hideFooter?: boolean;
  /** Optional extra classes for the <main> element (e.g. override padding). */
  contentClassName?: string;
}

/** Desktop: no second bottom strip on these sections — same as home; each area uses in-page nav / sidebar. */
const DESKTOP_SUBNAV_HIDDEN_PREFIXES = [
  '/programs',
  '/events',
  '/services',
  '/explore',
  '/international',
  '/connect',
  '/seva-careers',
] as const;

function isDesktopSubNavHiddenPath(pathname: string): boolean {
  return DESKTOP_SUBNAV_HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export const MainLayout = ({
  children,
  isLoading = false,
  hideFooter = false,
  contentClassName,
}: MainLayoutProps) => {
  const { pathname } = useLocation();
  const { isCollapsed } = useSidebarStore();
  const chatOpen = useChatbotStore((s) => s.isOpen);
  const setChatOpen = useChatbotStore((s) => s.setOpen);
  const unreadCount = useChatbotStore((s) => s.unreadCount);
  const [isDesktop, setIsDesktop] = useState(false);

  const showDesktopSubNav = isDesktop && !isDesktopSubNavHiddenPath(pathname);

  // Detect desktop
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    let t = 0;
    const bump = () => {
      try {
        const now = Date.now();
        if (now - t < 25000) return;
        t = now;
        touchRootSessionActivity();
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('keydown', bump);
    window.addEventListener('click', bump);
    return () => {
      window.removeEventListener('keydown', bump);
      window.removeEventListener('click', bump);
    };
  }, []);

  return (
    <RootOverlay>
      <GoogleTranslateBridge />
      {chatOpen && (
        <ChatbotDrawer onClose={() => setChatOpen(false)} />
      )}
      <div className="min-h-screen bg-background">
        {/* Sync route changes (INSIDE Router context) */}
        <RouteSync />

        {/* Sidebar – Desktop */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div
          className={cn('flex min-h-screen flex-col transition-all duration-300 ease-out')}
          style={{
            marginLeft: isDesktop ? (isCollapsed ? 72 : 260) : 0,
          }}
        >
          {/* Header */}
          <Header isLoading={isLoading} />

          {/* Page Content */}
          <main
            id="main-content"
            className={cn("min-w-0 overflow-x-hidden pb-20 lg:pb-6 xl:pb-8", contentClassName)}
            aria-label="Main content"
          >
            {children}
          </main>

          {/* Footer */}
          {!hideFooter && <Footer />}

          {/* Bottom Menu Bar — mobile dock (home / profile via header) */}
          <div
            className="fixed bottom-0 left-0 right-0 z-[1000] lg:hidden"
            style={{
              marginLeft: 0,
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            <BottomMenuBar />
          </div>
          {/* Desktop: Sub-nav (context tabs) - shown only on lg+ when sidebar is present */}
          {showDesktopSubNav && (
            <div
              className="fixed bottom-0 z-40 pb-safe"
              style={{
                left: isCollapsed ? 72 : 260,
                right: 0,
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              }}
            >
              <SubNavBar />
            </div>
          )}
        </div>
      </div>
    </RootOverlay>
  );
};
export default MainLayout;
