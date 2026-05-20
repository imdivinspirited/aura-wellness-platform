/**
 * Admin Authentication System
 *
 * Verifies password against the platform API (MongoDB-backed).
 * Set EVENTS_ADMIN_PASSWORD on the server and the same value is checked here.
 */

import { getApiBaseUrl } from '@/lib/api/client';

/**
 * Rate limiting storage (client-side UX only — real enforcement is server-side)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
  lockoutMs: 30 * 60 * 1000,
};

function isRateLimited(identifier: string): boolean {
  const record = rateLimitStore.get(identifier);
  if (!record) return false;
  if (Date.now() > record.resetTime) {
    rateLimitStore.delete(identifier);
    return false;
  }
  return record.count >= RATE_LIMIT.maxAttempts;
}

function recordFailedAttempt(identifier: string): void {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
  } else {
    record.count += 1;
    if (record.count >= RATE_LIMIT.maxAttempts) {
      record.resetTime = now + RATE_LIMIT.lockoutMs;
    }
  }
}

function clearRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Verify admin password via platform API (`POST /auth/events-admin-verify`).
 */
export async function verifyAdminPassword(password: string): Promise<string | null> {
  const identifier = 'client';

  if (isRateLimited(identifier)) {
    throw new Error('Too many failed attempts. Please try again later.');
  }

  try {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/auth/events-admin-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password }),
    });
    const data = (await res.json()) as { success?: boolean; data?: { adminId?: string } };

    if (!res.ok) {
      recordFailedAttempt(identifier);
      return null;
    }

    if (data?.data?.adminId) {
      clearRateLimit(identifier);
      return data.data.adminId;
    }

    recordFailedAttempt(identifier);
    return null;
  } catch {
    recordFailedAttempt(identifier);
    return null;
  }
}

const AUDIT_KEY = 'aol_events_admin_audit';

/**
 * Client-side audit trail for events admin actions (complements server logs when API exists).
 */
export function logAdminAction(
  adminId: string,
  action: string,
  resourceId: string,
  details: Record<string, unknown>
): void {
  try {
    const entry = { adminId, action, resourceId, details, at: new Date().toISOString() };
    if (import.meta.env.DEV) {
      console.info('[events-admin]', entry);
    }
    const prev = JSON.parse(sessionStorage.getItem(AUDIT_KEY) || '[]') as unknown[];
    prev.push(entry);
    sessionStorage.setItem(AUDIT_KEY, JSON.stringify(prev.slice(-50)));
  } catch {
    /* ignore */
  }
}
