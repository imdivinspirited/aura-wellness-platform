import { create } from 'zustand';

interface ChatbotState {
  isOpen: boolean;
  unreadCount: number;
  setOpen: (open: boolean) => void;
  incrementUnread: () => void;
  clearUnread: () => void;
}

export const useChatbotStore = create<ChatbotState>((set) => ({
  isOpen: false,
  unreadCount: 0,
  setOpen: (open) =>
    set((s) => ({
      isOpen: open,
      unreadCount: open ? 0 : s.unreadCount,
    })),
  incrementUnread: () =>
    set((s) => (s.isOpen ? s : { unreadCount: s.unreadCount + 1 })),
  clearUnread: () => set({ unreadCount: 0 }),
}));
