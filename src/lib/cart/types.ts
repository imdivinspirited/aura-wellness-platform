/**
 * Cart System - Type Definitions
 *
 * Universal cart types for all cartable items across the website.
 */

export type CartItemType =
  | 'program'
  | 'service'
  | 'pass'
  | 'course'
  | 'facility'
  | 'booking'
  | 'application'
  | 'retreat';

export interface CartItem {
  itemId: string;
  itemType: CartItemType;
  title: string;
  subtitle?: string;
  thumbnail?: string;
  price?: number;
  quantity: number;
  metadata?: {
    dates?: string;
    location?: string;
    slot?: string;
    duration?: string;
    format?: string;
    ageGroup?: string;
    [key: string]: unknown;
  };
  addedAt: string; // ISO timestamp
  registrationUrl?: string;
}

export interface Cart {
  cartId: string;
  userIdentifier: string;
  items: CartItem[];
  updatedAt: string; // ISO timestamp
}

export interface CartService {
  getCart(): Promise<Cart | null>;
  addItem(item: Omit<CartItem, 'addedAt' | 'quantity'> & { quantity?: number }): Promise<void>;
  removeItem(itemId: string): Promise<void>;
  updateQuantity(itemId: string, quantity: number): Promise<void>;
  clearCart(): Promise<void>;
  getItemCount(): Promise<number>;
  subscribe(callback: (cart: Cart | null) => void): () => void;
}
