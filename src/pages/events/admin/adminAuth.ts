/**
 * Admin Authentication System
 *
 * SECURITY NOTES:
 * - In production, this should be handled by a secure backend API
 * - Passwords should NEVER be stored in frontend code
 * - All admin operations should go through authenticated API endpoints
 * - This is a frontend-only implementation for demonstration
 *
 * For production:
 * - Use JWT tokens
 * - Implement rate limiting
 * - Add CSRF protection
 * - Log all admin actions
 * - Use environment variables for secrets
 */

/**
 * Admin credentials (HASHED)
 *
 * ⚠️ SECURITY WARNING:
 * In production, these should be stored in a secure backend database.
 * The hashes shown here are examples - real hashes would be generated
 * using bcrypt or argon2 with proper salt rounds.
 *
 * Example hash generation (Node.js):
 * const bcrypt = require('bcrypt');
 * const hash = await bcrypt.hash('admin_password', 10);
 */
export const ADMIN_CREDENTIALS = [
  {
    id: 'admin1',
    hash: '$2b$10$example_hash_here_1', // Replace with real bcrypt hash
    name: 'Admin 1',
  },
  {
    id: 'admin2',
    hash: '$2b$10$example_hash_here_2',
    name: 'Admin 2',
  },
  {
    id: 'admin3',
    hash: '$2b$10$example_hash_here_3',
    name: 'Admin 3',
  },
  {
    id: 'admin4',
    hash: '$2b$10$example_hash_here_4',
    name: 'Admin 4',
  },
  {
    id: 'admin5',
    hash: '$2b$10$example_hash_here_5',
    name: 'Admin 5',
  },
  {
    id: 'admin6',
    hash: '$2b$10$example_hash_here_6',
    name: 'Admin 6',
  },
  {
    id: 'admin7',
    hash: '$2b$10$example_hash_here_7',
    name: 'Admin 7',
  },
  {
    id: 'admin8',
    hash: '$2b$10$example_hash_here_8',
    name: 'Admin 8',
  },
  {
    id: 'admin9',
    hash: '$2b$10$example_hash_here_9',
    name: 'Admin 9',
  },
  {
    id: 'admin10',
    hash: '$2b$10$example_hash_here_10',
    name: 'Admin 10',
  },
];

/**
 * Rate limiting storage (in-memory for demo)
 * In production, use Redis or database
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limit configuration
 */
const RATE_LIMIT = {
  maxAttempts: 5, // Max login attempts
  windowMs: 15 * 60 * 1000, // 15 minutes
  lockoutMs: 30 * 60 * 1000, // 30 minutes lockout after max attempts
};

/**
 * Check if IP is rate limited
 * @param identifier - IP address or user identifier
 * @returns True if rate limited
 */
export function isRateLimited(identifier: string): boolean {
  const record = rateLimitStore.get(identifier);
  if (!record) return false;

  const now = Date.now();

  // Check if lockout period has passed
  if (now > record.resetTime) {
    rateLimitStore.delete(identifier);
    return false;
  }

  // Check if max attempts reached
  return record.count >= RATE_LIMIT.maxAttempts;
}

/**
 * Record a failed login attempt
 * @param identifier - IP address or user identifier
 */
export function recordFailedAttempt(identifier: string): void {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    // New record or expired, start fresh
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
  } else {
    // Increment count
    record.count += 1;

    // If max attempts reached, extend lockout
    if (record.count >= RATE_LIMIT.maxAttempts) {
      record.resetTime = now + RATE_LIMIT.lockoutMs;
    }
  }
}

/**
 * Clear rate limit for identifier (on successful login)
 * @param identifier - IP address or user identifier
 */
export function clearRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Verify admin password
 *
 * ⚠️ PRODUCTION NOTE:
 * This should be done on the backend server, not in frontend code.
 * Frontend should only send password to secure API endpoint.
 *
 * @param password - Plain text password
 * @returns Admin ID if valid, null otherwise
 */
export async function verifyAdminPassword(password: string): Promise<string | null> {
  // ⚠️ SECURITY WARNING: This is a frontend-only demo
  // In production, this MUST be done on the backend

  // For demo purposes, we'll use a simple check
  // In production, use: await bcrypt.compare(password, admin.hash)

  // Get client identifier (IP address in production)
  const identifier = 'client'; // In production: getClientIP()

  // Check rate limiting
  if (isRateLimited(identifier)) {
    throw new Error('Too many failed attempts. Please try again later.');
  }

  // In production, send password to backend API:
  // const response = await fetch('/api/admin/verify', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ password }),
  // });
  // return response.json();

  // Demo implementation (NOT SECURE - for development only)
  // Check against a demo password (in production, use hashed comparison)
  const DEMO_PASSWORD = 'admin123'; // ⚠️ Remove in production

  if (password === DEMO_PASSWORD) {
    clearRateLimit(identifier);
    return ADMIN_CREDENTIALS[0].id; // Return first admin ID
  }

  // Record failed attempt
  recordFailedAttempt(identifier);
  return null;
}

/**
 * Log admin action for audit trail
 *
 * In production, this should send to a secure logging service
 *
 * @param adminId - Admin ID
 * @param action - Action performed
 * @param eventId - Event ID (if applicable)
 * @param details - Additional details
 */
export function logAdminAction(
  adminId: string,
  action: string,
  eventId?: string,
  details?: Record<string, unknown>
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    adminId,
    action,
    eventId,
    details,
    ipAddress: 'client-ip', // In production: getClientIP()
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
  };

  // In production, send to logging API:
  // await fetch('/api/admin/logs', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(logEntry),
  // });

  // For demo, log to console
  console.log('[Admin Action]', logEntry);
}

/**
 * Get client identifier (for rate limiting)
 * In production, extract from request headers/IP
 */
export function getClientIdentifier(): string {
  // In production: return request.ip or extract from headers
  return 'client-' + Math.random().toString(36).substring(7);
}
