/**
 * Cart Store (Zustand)
 *
 * Reactive store for cart state management.
 */

import { create } from 'zustand';
import type { Cart, CartItem } from '@/lib/cart/types';
import { getCartService } from '@/lib/cart/cartService';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  itemCount: number;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  addItem: (item: Omit<CartItem, 'addedAt' | 'quantity'> & { quantity?: number }) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => {
  const service = getCartService();

  // Subscribe to cart changes
  service.subscribe((cart) => {
    set({
      cart,
      itemCount: cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0,
    });
  });

  return {
    cart: null,
    isLoading: true,
    itemCount: 0,

    initialize: async () => {
      set({ isLoading: true });
      try {
        const cart = await service.getCart();
        set({
          cart,
          itemCount: cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0,
          isLoading: false,
        });
      } catch (error) {
        console.warn('Failed to initialize cart', error);
        set({ isLoading: false });
      }
    },

    refresh: async () => {
      const cart = await service.getCart();
      set({
        cart,
        itemCount: cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0,
      });
    },

    addItem: async (item) => {
      await service.addItem(item);
      await get().refresh();
    },

    removeItem: async (itemId) => {
      await service.removeItem(itemId);
      await get().refresh();
    },

    updateQuantity: async (itemId, quantity) => {
      await service.updateQuantity(itemId, quantity);
      await get().refresh();
    },

    clearCart: async () => {
      await service.clearCart();
      await get().refresh();
    },
  };
});
