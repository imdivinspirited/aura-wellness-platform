/**
 * Root Authentication System
 *
 * Supports (1) local dev accounts stored with SHA-256 hashes only, and
 * (2) optional backend integration when available.
 */

import type { RootSession, RootUserId } from './types';

const SESSION_STORAGE_KEY = 'root-session';
const ACCOUNTS_STORAGE_KEY = 'aol-root-accounts-v1';
const DEFAULT_SESSION_MS = 30 * 60 * 1000;

type StoredRootAccount = {
  username: string;
  displayName: string;
  passwordHash: string;
  createdAt: number;
};

function dispatchSessionEvent() {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('aol-root-session-changed'));
    }
  } catch {
    /* ignore */
  }
}

async function sha256Hex(input: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('crypto unavailable');
  }
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function readAccounts(): StoredRootAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredRootAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: StoredRootAccount[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    /* ignore */
  }
}

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
 * Extend session expiry on user activity (default 30 minutes from last touch).
 */
export function touchRootSessionActivity(): void {
  try {
    const session = getSession();
    if (!session) return;
    const envMs = typeof import.meta !== 'undefined' ? (import.meta as { env?: { VITE_ROOT_SESSION_MS?: string } }).env?.VITE_ROOT_SESSION_MS : undefined;
    const duration = envMs ? Number(envMs) : DEFAULT_SESSION_MS;
    const next: RootSession = {
      ...session,
      expiresAt: Date.now() + (Number.isFinite(duration) && duration > 0 ? duration : DEFAULT_SESSION_MS),
    };
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
    }
    dispatchSessionEvent();
  } catch {
    /* ignore */
  }
}

/**
 * Clear session
 */
export function clearSession(): void {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    dispatchSessionEvent();
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getSession() !== null;
}

/**
 * Register a local root account (password stored as SHA-256 only).
 * Note: Browser-only registration is suitable for demos; production should use a backend.
 */
export async function registerLocalRootAccount(input: {
  fullName: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const email = input.email.trim().toLowerCase();
    const name = input.fullName.trim();
    if (!email || !name || !input.password) {
      return { success: false, error: 'Please complete all fields.' };
    }
    const accounts = readAccounts();
    if (accounts.some((a) => a.username === email)) {
      return { success: false, error: 'Could not create account.' };
    }
    const passwordHash = await sha256Hex(`${email}\0${input.password}`);
    const next: StoredRootAccount[] = [
      ...accounts,
      { username: email, displayName: name, passwordHash, createdAt: Date.now() },
    ];
    writeAccounts(next);
    return { success: true };
  } catch {
    return { success: false, error: 'Could not create account.' };
  }
}

/**
 * Authenticate root user (local accounts first; optional env demo credentials).
 */
export async function authenticateRootUser(
  username: string,
  password: string
): Promise<{ success: boolean; session?: RootSession; error?: string }> {
  try {
    const u = username.trim().toLowerCase();
    const accounts = readAccounts();
    const hash = await sha256Hex(`${u}\0${password}`);
    const match = accounts.find((a) => a.username === u && a.passwordHash === hash);

    const env = typeof import.meta !== 'undefined' ? (import.meta as { env?: Record<string, string | undefined> }).env : undefined;
    const envUser = env ? String(env.VITE_ROOT_USERNAME || '').trim().toLowerCase() : '';
    const envPass = env ? String(env.VITE_ROOT_PASSWORD || '') : '';

    let sessionUser: { id: RootUserId; name: string } | null = null;

    if (match) {
      sessionUser = { id: `root_${match.username}` as RootUserId, name: match.displayName };
    } else if (envUser && envPass && u === envUser && password === envPass) {
      sessionUser = { id: `root_${envUser}` as RootUserId, name: 'Root (env)' };
    }

    if (!sessionUser) {
      return { success: false, error: 'Invalid credentials' };
    }

    const envMs2 = typeof import.meta !== 'undefined' ? (import.meta as { env?: { VITE_ROOT_SESSION_MS?: string } }).env?.VITE_ROOT_SESSION_MS : undefined;
    const duration2 = envMs2 ? Number(envMs2) : DEFAULT_SESSION_MS;
    const ttl = Number.isFinite(duration2) && duration2 > 0 ? duration2 : DEFAULT_SESSION_MS;

    const session: RootSession = {
      userId: sessionUser.id,
      username: u,
      token: `local_${Math.random().toString(36).slice(2)}_${Date.now()}`,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now(),
    };

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
    dispatchSessionEvent();
    return { success: true, session };
  } catch {
    return { success: false, error: 'Invalid credentials' };
  }
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
