/**
 * Cart Service (Singleton)
 *
 * Central service for managing cart operations.
 * Uses Observer pattern for reactive updates.
 * Integrates with backend API when available.
 */

import type { Cart, CartItem, CartService as ICartService } from './types';
import { getUserIdentifier, getCartFromDB, saveCartToDB } from './storage';
import * as cartApi from '@/lib/api/cart';
import { useAuthStore } from '@/stores/authStore';

class CartServiceImpl implements ICartService {
  private subscribers: Set<(cart: Cart | null) => void> = new Set();
  private cartCache: Cart | null = null;
  private cartId: string;

  constructor() {
    this.cartId = `cart_${getUserIdentifier()}_${Date.now()}`;
    this.loadCart();
  }

  private async loadCart(): Promise<void> {
    try {
      const cart = await getCartFromDB();
      if (cart) {
        this.cartId = cart.cartId;
        this.cartCache = cart;
      } else {
        // Create new cart
        const userId = getUserIdentifier();
        this.cartCache = {
          cartId: this.cartId,
          userIdentifier: userId,
          items: [],
          updatedAt: new Date().toISOString(),
        };
        await this.saveCart();
      }
      this.notifySubscribers();
    } catch (error) {
      console.warn('Failed to load cart', error);
      this.cartCache = null;
      this.notifySubscribers();
    }
  }

  private async saveCart(): Promise<void> {
    if (!this.cartCache) return;

    this.cartCache.updatedAt = new Date().toISOString();
    await saveCartToDB(this.cartCache);
    this.notifySubscribers();
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.cartCache);
      } catch (error) {
        console.warn('Cart subscriber error', error);
      }
    });
  }

  async getCart(): Promise<Cart | null> {
    // Try backend API first
    const authState = useAuthStore.getState();
    if (authState.isAuthenticated || authState.anonymousId) {
      try {
        const response = await cartApi.getCart();
        if (response.success && response.data.cart) {
          // Convert backend cart to local format
          this.cartCache = {
            cartId: response.data.cart._id,
            userIdentifier: authState.user?.id || authState.anonymousId || '',
            items: response.data.cart.items.map(item => ({
              ...item,
              addedAt: item.addedAt || new Date().toISOString(),
            })),
            updatedAt: response.data.cart.updatedAt,
          };
          this.notifySubscribers();
          return this.cartCache;
        }
      } catch (error) {
        console.warn('Backend cart API failed, using local storage:', error);
        // Fall through to local storage
      }
    }

    // Fallback to local storage
    if (!this.cartCache) {
      await this.loadCart();
    }
    return this.cartCache;
  }

  async addItem(
    item: Omit<CartItem, 'addedAt' | 'quantity'> & { quantity?: number }
  ): Promise<void> {
    if (!this.cartCache) {
      await this.loadCart();
    }

    if (!this.cartCache) {
      throw new Error('Cart not initialized');
    }

    const existingIndex = this.cartCache.items.findIndex(
      i => i.itemId === item.itemId && i.itemType === item.itemType
    );

    if (existingIndex >= 0) {
      // Update quantity if item exists
      const existingItem = this.cartCache.items[existingIndex];
      this.cartCache.items[existingIndex] = {
        ...existingItem,
        quantity: existingItem.quantity + (item.quantity || 1),
      };
    } else {
      // Add new item
      const newItem: CartItem = {
        ...item,
        quantity: item.quantity || 1,
        addedAt: new Date().toISOString(),
      };
      this.cartCache.items.push(newItem);
    }

    await this.saveCart();
  }

  async removeItem(itemId: string): Promise<void> {
    if (!this.cartCache) {
      await this.loadCart();
    }

    if (!this.cartCache) return;

    this.cartCache.items = this.cartCache.items.filter(
      item => item.itemId !== itemId
    );
    await this.saveCart();
  }

  async updateQuantity(itemId: string, quantity: number): Promise<void> {
    if (quantity <= 0) {
      await this.removeItem(itemId);
      return;
    }

    if (!this.cartCache) {
      await this.loadCart();
    }

    if (!this.cartCache) return;

    const item = this.cartCache.items.find(i => i.itemId === itemId);
    if (item) {
      item.quantity = quantity;
      await this.saveCart();
    }
  }

  async clearCart(): Promise<void> {
    if (!this.cartCache) {
      await this.loadCart();
    }

    if (!this.cartCache) return;

    this.cartCache.items = [];
    await this.saveCart();
  }

  async getItemCount(): Promise<number> {
    if (!this.cartCache) {
      await this.loadCart();
    }

    if (!this.cartCache) return 0;

    return this.cartCache.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  subscribe(callback: (cart: Cart | null) => void): () => void {
    this.subscribers.add(callback);

    // Immediately call with current cart
    if (this.cartCache) {
      try {
        callback(this.cartCache);
      } catch (error) {
        console.warn('Cart subscriber error', error);
      }
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }
}

// Singleton instance
let cartServiceInstance: CartServiceImpl | null = null;

export function getCartService(): CartServiceImpl {
  if (!cartServiceInstance) {
    cartServiceInstance = new CartServiceImpl();
  }
  return cartServiceInstance;
}
