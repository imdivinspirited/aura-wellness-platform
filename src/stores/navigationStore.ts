import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavigationState {
  activeMainNav: string | null;
  activeSubNav: string | null;
  activeChildNav: string | null;

  setActiveMainNav: (id: string | null) => void;
  setActiveSubNav: (id: string | null) => void;
  setActiveChildNav: (id: string | null) => void;
  clearSubNav: () => void;
  clearChildNav: () => void;
  clearAll: () => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      activeMainNav: null,
      activeSubNav: null,
      activeChildNav: null,

      setActiveMainNav: (id) => {
        // Always set the active nav - don't toggle off on same click
        // This ensures bottom bar stays visible after first click
        set({
          activeMainNav: id,
          activeSubNav: null,
          activeChildNav: null
        });
      },

      setActiveSubNav: (id) => set({
        activeSubNav: id,
        activeChildNav: null
      }),

      setActiveChildNav: (id) => set({ activeChildNav: id }),

      clearSubNav: () => set({ activeSubNav: null, activeChildNav: null }),
      clearChildNav: () => set({ activeChildNav: null }),
      clearAll: () => set({ activeMainNav: null, activeSubNav: null, activeChildNav: null }),
    }),
    {
      name: 'navigation-state',
    }
  )
);
