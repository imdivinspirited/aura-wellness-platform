/**
 * Admin Authentication System
 *
 * Uses a backend edge function for secure password verification.
 * No credentials are stored in frontend code.
 */

import { supabase } from '@/integrations/supabase/client';

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
 * Verify admin password via backend edge function.
 * No credentials are checked client-side.
 */
export async function verifyAdminPassword(password: string): Promise<string | null> {
  const identifier = 'client';

  // Client-side rate limit (UX only — server enforces real limit)
  if (isRateLimited(identifier)) {
    throw new Error('Too many failed attempts. Please try again later.');
  }

  try {
    const { data, error } = await supabase.functions.invoke('admin-verify', {
      body: { password },
    });

    if (error) {
      recordFailedAttempt(identifier);
      return null;
    }

    if (data?.adminId) {
      clearRateLimit(identifier);
      return data.adminId;
    }

    recordFailedAttempt(identifier);
    return null;
  } catch {
    recordFailedAttempt(identifier);
    return null;
  }
}

/**
 * Log admin action for audit trail
 */
export function logAdminAction(
  _adminId: string,
  _action: string,
  _eventId?: string,
  _details?: Record<string, unknown>
): void {
  // Audit logging is intentionally silent on the client.
  // In production, this should send to a backend audit endpoint.
}
