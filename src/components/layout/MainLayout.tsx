import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useUserStore } from '@/stores/userStore';
import { ReactNode, useEffect, useState } from 'react';

import { Footer } from './Footer';
import { Header } from './Header';
import { RouteSync } from './RouteSync';
import { Sidebar } from './Sidebar';
import { SubNavBar } from './SubNav';
import { RootOverlay } from '@/components/root';

interface MainLayoutProps {
  children: ReactNode;
  isLoading?: boolean;
  hideFooter?: boolean;
}

export const MainLayout = ({
  children,
  isLoading = false,
  hideFooter = false,
}: MainLayoutProps) => {
  const { isCollapsed } = useSidebarStore();
  const { appearance } = useUserStore();
  const [isDesktop, setIsDesktop] = useState(false);

  // Detect desktop
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Apply theme + accessibility settings
  useEffect(() => {
    const root = document.documentElement;

    // Reset theme presets
    root.classList.remove('theme-classic-spiritual', 'theme-ocean-calm', 'theme-forest-serenity');

    root.classList.add(`theme-${appearance.themePreset}`);

    // Dark / light / system
    if (appearance.theme === 'dark') {
      root.classList.add('dark');
    } else if (appearance.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }

    // Font size
    const fontSizes: Record<string, string> = {
      S: '14px',
      M: '16px',
      L: '18px',
      XL: '20px',
    };
    root.style.fontSize = fontSizes[appearance.fontSize];

    // Reduce motion
    if (appearance.reduceMotion) {
      root.style.setProperty('--transition-base', '0ms');
      root.style.setProperty('--transition-smooth', '0ms');
      root.style.setProperty('--transition-spring', '0ms');
    }

    // High contrast
    root.classList.toggle('high-contrast', appearance.highContrast);
  }, [appearance]);

  return (
    <RootOverlay>
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
          <main className="flex-1 pb-20">{children}</main>

          {/* Footer */}
          {!hideFooter && <Footer />}

          {/* Bottom Sub Navigation - Floating with auto-hide */}
          <div
            className="fixed bottom-0 left-0 right-0 z-40 pb-safe"
            style={{
              marginLeft: isDesktop ? (isCollapsed ? 72 : 260) : 0,
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            <SubNavBar />
          </div>
        </div>
      </div>
    </RootOverlay>
  );
};
export default MainLayout;
