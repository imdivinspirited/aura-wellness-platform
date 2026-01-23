import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { useSidebarStore } from '@/stores/sidebarStore';
import { motion } from 'framer-motion';
import { Bell, LogOut, Menu, MessageSquare, Search, Settings, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MobileSidebar } from './Sidebar';
import { SearchModal } from '@/components/search';
import { CartIcon } from '@/components/cart/CartIcon';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface HeaderProps {
  isLoading?: boolean;
}

export const Header = ({ isLoading = false }: HeaderProps) => {
  const { toggleCollapsed } = useSidebarStore();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { t } = useTranslation();

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
    <header className="sticky top-0 z-30 w-full">
      {/* Main Header Bar */}
      <div className="glass border-b border-border/50">
        <div className="flex h-16 items-center gap-4 px-4 md:px-6">
          {/* Mobile Menu */}
          <MobileSidebar />

          {/* Desktop Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className="hidden lg:flex text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search - Centered */}
          <div
            className={cn(
              'relative flex-1 max-w-xl mx-auto transition-all duration-300',
              searchFocused && 'max-w-2xl'
            )}
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('search.placeholder')}
              className={cn(
                'pl-10 pr-4 bg-muted/50 border-transparent',
                'focus:bg-background focus:border-primary/20 focus:ring-2 focus:ring-primary/10',
                'transition-all duration-300 cursor-pointer'
              )}
              onFocus={() => {
                setSearchFocused(true);
                setSearchModalOpen(true);
              }}
              onBlur={() => setSearchFocused(false)}
              readOnly
              aria-label="Open search"
            />
          </div>

          {/* Enhanced Search Modal */}
          <SearchModal open={searchModalOpen} onOpenChange={setSearchModalOpen} />

          {/* Right Actions - Cart, Notifications, Chat */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Cart Icon */}
            <CartIcon />

            {/* Notifications */}
            <NotificationBell />

            {/* Messages */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <MessageSquare className="h-5 w-5" />
              <Badge className="absolute -right-1 -top-1 h-5 min-w-5 px-1.5 bg-secondary text-secondary-foreground text-[10px] font-bold">
                3
              </Badge>
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="" alt="Profile" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-medium">
                      G
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Guest User</p>
                    <p className="text-xs text-muted-foreground">Welcome to the Ashram</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
};
