import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigationStore } from '@/stores/navigationStore';
import { navigationItems, findNavItemByPath } from '@/config/navigation';

/**
 * Syncs navigation state with current route
 * This ensures that when a user navigates directly to a URL or uses browser back/forward,
 * the navigation state (activeMainNav, activeSubNav, etc.) is updated accordingly.
 */
export const RouteSync = () => {
  const location = useLocation();
  const { setActiveMainNav, setActiveSubNav, clearAll } = useNavigationStore();

  useEffect(() => {
    // If on home page, clear navigation state
    if (location.pathname === '/') {
      clearAll();
      return;
    }

    // Find the nav item for current path
    const currentItem = findNavItemByPath(navigationItems, location.pathname);
    if (!currentItem) {
      clearAll();
      return;
    }

    // Determine main nav item based on path
    const pathParts = location.pathname.split('/').filter(Boolean);
    const mainNavId = pathParts[0]; // e.g., 'programs', 'services', etc.

    // Set active main nav if it exists
    const mainNavItem = navigationItems.find(item => item.id === mainNavId);
    if (mainNavItem) {
      setActiveMainNav(mainNavItem.id);

      // Try to find sub-nav if path has more than one part
      if (pathParts.length > 1 && mainNavItem.children) {
        const subNavId = pathParts[1]; // e.g., 'beginners' in '/programs/beginners'
        const subNavItem = mainNavItem.children.find(item => item.id === subNavId);
        if (subNavItem) {
          setActiveSubNav(subNavItem.id);
        }
      }
    }
  }, [location.pathname, setActiveMainNav, setActiveSubNav, clearAll]);

  return null; // This component doesn't render anything
};
