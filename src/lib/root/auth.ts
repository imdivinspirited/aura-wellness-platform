/**
 * Root Authentication System
 *
 * Root authentication requires a backend API endpoint.
 * Without a configured backend, all authentication attempts are denied.
 */

import type { RootSession, RootUserId } from './types';

const SESSION_STORAGE_KEY = 'root-session';

/**
 * Get current session
 */
export function getSession(): RootSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;

    const session: RootSession = JSON.parse(stored);

    if (Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }

    return session;
  } catch {
    clearSession();
    return null;
  }
}

/**
 * Clear session
 */
export function clearSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getSession() !== null;
}

/**
 * Authenticate root user
 *
 * Returns failure — root authentication requires a backend endpoint
 * that is not currently configured.
 */
export async function authenticateRootUser(
  _username: string,
  _password: string
): Promise<{ success: boolean; session?: RootSession; error?: string }> {
  return {
    success: false,
    error: 'Root authentication is not available. Contact the administrator.',
  };
}

/**
 * Logout root user
 */
export function logoutRootUser(): void {
  clearSession();
}

/**
 * Get current root user ID
 */
export function getCurrentRootUserId(): RootUserId | null {
  const session = getSession();
  return session?.userId || null;
}
