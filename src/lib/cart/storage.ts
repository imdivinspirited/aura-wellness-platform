/**
 * Cart Storage Service
 *
 * Handles persistent storage using IndexedDB (primary) and LocalStorage (fallback).
 * Provides user identification without backend authentication.
 */

const DB_NAME = 'auraWellnessCart';
const DB_VERSION = 1;
const STORE_NAME = 'carts';
const USER_ID_KEY = 'aura_cart_user_id';

/**
 * Generate or retrieve user identifier
 */
export function getUserIdentifier(): string {
  // Try to get existing ID from localStorage
  let userId = localStorage.getItem(USER_ID_KEY);

  if (!userId) {
    // Generate new ID based on device fingerprint
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
    ].join('|');

    // Create a simple hash
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    userId = `user_${Math.abs(hash)}_${Date.now()}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }

  return userId;
}

/**
 * Initialize IndexedDB
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'cartId' });
        store.createIndex('userIdentifier', 'userIdentifier', { unique: false });
      }
    };
  });
}

/**
 * Get cart from IndexedDB
 */
export async function getCartFromDB(): Promise<any | null> {
  try {
    const db = await openDB();
    const userId = getUserIdentifier();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('userIdentifier');
      const request = index.get(userId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('IndexedDB not available, falling back to localStorage', error);
    return getCartFromLocalStorage();
  }
}

/**
 * Save cart to IndexedDB
 */
export async function saveCartToDB(cart: any): Promise<void> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(cart);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('IndexedDB not available, falling back to localStorage', error);
    saveCartToLocalStorage(cart);
  }
}

/**
 * Fallback: Get cart from LocalStorage
 */
function getCartFromLocalStorage(): any | null {
  try {
    const userId = getUserIdentifier();
    const cartKey = `cart_${userId}`;
    const cartData = localStorage.getItem(cartKey);
    return cartData ? JSON.parse(cartData) : null;
  } catch (error) {
    console.warn('Failed to get cart from localStorage', error);
    return null;
  }
}

/**
 * Fallback: Save cart to LocalStorage
 */
function saveCartToLocalStorage(cart: any): void {
  try {
    const userId = getUserIdentifier();
    const cartKey = `cart_${userId}`;
    localStorage.setItem(cartKey, JSON.stringify(cart));
  } catch (error) {
    console.warn('Failed to save cart to localStorage', error);
  }
}
