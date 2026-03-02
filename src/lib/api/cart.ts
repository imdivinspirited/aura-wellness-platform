/**
 * Cart API
 *
 * API functions for cart operations.
 */

import { apiClient } from './client';
import type { CartItem } from '@/lib/cart/types';

export interface CartResponse {
  success: boolean;
  data: {
    cart: {
      _id: string;
      userId?: string;
      anonymousId?: string;
      items: CartItem[];
      createdAt: string;
      updatedAt: string;
    };
  };
}

/**
 * Get user's cart
 */
export async function getCart(): Promise<CartResponse> {
  return apiClient.get<CartResponse>('/carts');
}

/**
 * Add item to cart
 */
export async function addToCart(item: Omit<CartItem, 'addedAt' | 'quantity'> & { quantity?: number }): Promise<CartResponse> {
  return apiClient.post<CartResponse>('/carts/items', {
    ...item,
    quantity: item.quantity || 1,
  });
}

/**
 * Remove item from cart
 */
export async function removeFromCart(itemId: string): Promise<CartResponse> {
  return apiClient.delete<CartResponse>(`/carts/items/${itemId}`);
}

/**
 * Update item quantity
 */
export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<CartResponse> {
  return apiClient.put<CartResponse>(`/carts/items/${itemId}`, { quantity });
}

/**
 * Clear cart
 */
export async function clearCart(): Promise<CartResponse> {
  return apiClient.delete<CartResponse>('/carts');
}

/**
 * Merge anonymous cart with user cart
 */
export async function mergeCart(anonymousId: string): Promise<CartResponse> {
  return apiClient.post<CartResponse>('/carts/merge', { anonymousId });
}
