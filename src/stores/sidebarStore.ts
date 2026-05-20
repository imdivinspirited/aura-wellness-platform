import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isCollapsed: boolean;
  expandedItems: string[];
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleExpanded: (itemId: string) => void;
  isExpanded: (itemId: string) => boolean;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      isCollapsed: false,
      expandedItems: ['programs'],
      
      toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
      
      toggleExpanded: (itemId) =>
        set((state) => ({
          expandedItems: state.expandedItems.includes(itemId)
            ? state.expandedItems.filter((id) => id !== itemId)
            : [...state.expandedItems, itemId],
        })),
      
      isExpanded: (itemId) => get().expandedItems.includes(itemId),
    }),
    {
      name: 'sidebar-state',
    }
  )
);
