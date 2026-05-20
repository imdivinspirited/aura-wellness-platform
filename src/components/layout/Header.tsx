import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { useSidebarStore } from '@/stores/sidebarStore';
import { motion } from 'framer-motion';
import { PanelLeft, PanelRight } from 'lucide-react';
import { OperatorIcon } from '@/components/chatbot/OperatorIcon';
import { LuxuryCountBadge } from '@/components/ui/LuxuryCountBadge';
import { headerToolbarIconButtonClass } from '@/components/ui/headerToolbarIcon';
import { memo, useEffect, useState } from 'react';
import { CartIcon } from '@/components/cart/CartIcon';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { HeaderProfileTrigger } from '@/components/layout/HeaderProfileTrigger';
import { HeaderSearchTrigger } from '@/components/layout/HeaderSearchTrigger';
import { SearchModal } from '@/components/search/SearchModal';
import { useLogoHomeNavigation } from '@/hooks/useLogoHomeNavigation';
import { useChatbotStore } from '@/stores/chatbotStore';
import { useRootAuthStore } from '@/stores/rootAuthStore';
import { useRootStore } from '@/stores/rootStore';
import { getSession } from '@/lib/root/auth';
import { AolicLogo } from '@/components/branding/AolicLogo';

interface HeaderProps {
  isLoading?: boolean;
}

export const Header = memo(function Header({ isLoading = false }: HeaderProps) {
  const { toggleCollapsed, isCollapsed } = useSidebarStore();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { t } = useTranslation();
  const { setOpen: setChatOpen, unreadCount: chatUnreadCount } = useChatbotStore();
  const rootEditActive = useRootStore((s) => s.isActive);
  const rootJwtActive = useRootAuthStore((s) => !!s.accessToken);
  const [localLegacyRootSession, setLocalLegacyRootSession] = useState(false);
  const { goHomeViaLogo, logoAriaLabel } = useLogoHomeNavigation();

  useEffect(() => {
    const sync = () => {
      try {
        setLocalLegacyRootSession(!!getSession());
      } catch {
        setLocalLegacyRootSession(false);
      }
    };
    sync();
    window.addEventListener('aol-root-session-changed', sync);
    return () => window.removeEventListener('aol-root-session-changed', sync);
  }, []);

  // Keyboard shortcut: Cmd+K or Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full" aria-label="Site header">
      {/* Main Header Bar */}
      <div className="header-app-bar">
        <div className="flex h-12 sm:h-14 items-center gap-1.5 sm:gap-2 min-w-0 pl-1 pr-2 sm:pl-1.5 sm:pr-3 md:pr-4">
          {/* Mobile: logo → home / toggle home view when on `/` with mood */}
          <button
            type="button"
            onClick={goHomeViaLogo}
            className="lg:hidden shrink-0 rounded-md py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label={logoAriaLabel}
          >
            <AolicLogo alt="" className="h-8 w-auto object-contain" style={{ minWidth: 32 }} />
          </button>

          {/* Desktop: inset from edge so it doesn’t hug the corner */}
          <div className="hidden shrink-0 items-center lg:flex lg:pl-2 lg:pr-1">
            <button
              type="button"
              onClick={toggleCollapsed}
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center p-0',
                'border-0 bg-transparent shadow-none text-muted-foreground',
                'transition-colors hover:text-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
              aria-label={t('nav.aria.toggleSidebar')}
              title={t('nav.aria.toggleSidebar')}
            >
              {isCollapsed ? (
                <PanelRight className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} aria-hidden />
              ) : (
                <PanelLeft className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} aria-hidden />
              )}
            </button>
          </div>

          <div className="relative mx-auto flex min-w-0 flex-1 justify-center">
            <HeaderSearchTrigger
              className="mx-auto w-full"
              onOpen={() => {
                setSearchModalOpen(true);
              }}
            />
          </div>

          {/* Enhanced Search Modal */}
          {searchModalOpen && (
            <SearchModal open={searchModalOpen} onOpenChange={setSearchModalOpen} />
          )}

          {/* Right Actions - Cart, Notifications, Chat */}
          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1.5">
            {(localLegacyRootSession || rootJwtActive || rootEditActive) && (
              <Badge
                className="hidden sm:inline-flex text-[10px] uppercase tracking-wide bg-emerald-700/90 text-white border-0"
                aria-label="Root access active"
              >
                Root Access Active
              </Badge>
            )}
            {/* Cart Icon */}
            <CartIcon />

            {/* Notifications */}
            <NotificationBell />

            {/* Site concierge */}
            <Button
              variant="ghost"
              size="icon"
              className={headerToolbarIconButtonClass}
              onClick={() => setChatOpen(true)}
              aria-label="Open concierge chat"
            >
              <OperatorIcon size="toolbar" />
              {chatUnreadCount > 0 && <LuxuryCountBadge count={chatUnreadCount} />}
            </Button>

            <HeaderProfileTrigger />
          </div>
        </div>

        {/* Loading Bar */}
        {isLoading && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted overflow-hidden">
            <motion.div className="h-full w-1/3 bg-gradient-to-r from-primary via-secondary to-primary loading-bar" />
          </div>
        )}
      </div>
    </header>
  );
});
