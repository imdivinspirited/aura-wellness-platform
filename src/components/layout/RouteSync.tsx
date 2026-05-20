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

    // Determine main nav item based on path
    const pathParts = location.pathname.split('/').filter(Boolean);
    const mainNavId = pathParts[0]; // e.g., 'programs', 'services', etc.

    // Set active main nav if it exists
    const mainNavItem = navigationItems.find(item => item.id === mainNavId);
    if (mainNavItem) {
      setActiveMainNav(mainNavItem.id);

      // For programs with query params, determine sub-nav from category
      if (mainNavId === 'programs') {
        const searchParams = new URLSearchParams(location.search);
        const category = searchParams.get('category');
        
        if (category) {
          // Map category to sub-nav id
          const categoryToSubNavMap: Record<string, string> = {
            beginning: 'beginning',
            advanced: 'advance',
            children: 'children-teens',
            teens: 'children-teens',
            more: 'more-programs',
            retreats: 'retreats',
          };
          const subNavId = categoryToSubNavMap[category];
          if (subNavId) {
            setActiveSubNav(subNavId);
            return;
          }
        }
        
        // Try to find sub-nav from path (e.g., /programs/advance/amp)
        if (pathParts.length > 1) {
          const subNavId = pathParts[1];
          const subNavItem = mainNavItem.children?.find(item => item.id === subNavId);
          if (subNavItem) {
            setActiveSubNav(subNavItem.id);
          }
        }
      } else {
        // For other sections, find sub-nav from path
        if (pathParts.length > 1 && mainNavItem.children) {
          const subNavId = pathParts[1];
          const subNavItem = mainNavItem.children.find(item => item.id === subNavId);
          if (subNavItem) {
            setActiveSubNav(subNavItem.id);
          }
        }
      }
    } else {
      clearAll();
    }
  }, [location.pathname, location.search, setActiveMainNav, setActiveSubNav, clearAll]);

  return null; // This component doesn't render anything
};

export default RouteSync;
