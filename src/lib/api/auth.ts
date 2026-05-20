/**
 * Authentication API
 *
 * API functions for authentication.
 */

import { setAccessToken, clearAccessToken } from '@/lib/auth/accessToken';
import { apiClient, getApiBaseUrl } from './client';

export interface LoginCredentials {
  /**
   * Email or phone number.
   */
  identifier: string;
  password: string;
  /** Longer refresh session (httpOnly cookie TTL); server may cap (e.g. 90–365 days). */
  rememberMe?: boolean;
  /** TOTP code (when 2FA enabled). */
  twoFactorCode?: string;
  /** Recovery code (when 2FA enabled). */
  recoveryCode?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface RegisterRequestResponse {
  success: boolean;
  message?: string;
  /** True when the SMTP server accepted the verification message for this request. */
  verificationEmailSent?: boolean;
  /** ISO time when the signup magic link expires (use for countdown UI). */
  linkExpiresAt?: string;
  /** Poll GET /auth/register/watch/:watchId until status is verified (e.g. user confirmed on another device). */
  watchId?: string;
}

export type SignupWatchStatus = 'pending' | 'verified' | 'expired' | 'not_found' | 'invalid';

export async function getSignupWatchStatus(watchId: string): Promise<{ success?: boolean; status: SignupWatchStatus }> {
  return apiClient.get<{ success?: boolean; status: SignupWatchStatus }>(
    `/auth/register/watch/${encodeURIComponent(watchId)}`
  );
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      roles?: string[];
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

export interface AnonymousResponse {
  success: boolean;
  data: {
    anonymousId: string;
  };
}

/**
 * Register a new user
 * @param storeSession When false, tokens are not written — use when redirecting to login after sign-up.
 */
export async function register(
  data: RegisterData,
  opts?: { storeSession?: boolean }
): Promise<AuthResponse> {
  // Registration now sends an email verification link; account is created only after confirmation.
  // `storeSession` is ignored for this flow.
  return (await apiClient.post<RegisterRequestResponse>('/auth/register', data)) as any;
}

export async function confirmSignupVerification(opts: {
  email: string;
  token: string;
}): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register/confirm', opts);
  if (response.success && response.data.tokens) {
    setAccessToken(response.data.tokens.accessToken);
  }
  return response;
}

/**
 * Login user
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

  if (response.success && response.data.tokens) {
    setAccessToken(response.data.tokens.accessToken);

    // Merge anonymous cart if exists
    const anonymousId = localStorage.getItem('anonymousId');
    if (anonymousId) {
      try {
        await apiClient.post('/carts/merge', { anonymousId });
        localStorage.removeItem('anonymousId');
      } catch (error) {
        console.warn('Failed to merge cart:', error);
      }
    }
  }

  return response;
}

export async function changePassword(input: { currentPassword: string; newPassword: string }) {
  return apiClient.post<{ success: boolean }>('/auth/change-password', input, { requireAuth: true });
}

export async function listSessions() {
  return apiClient.get<{
    success: boolean;
    data: { items: Array<{ id: string; createdAt: string; expiresAt: string; ip?: string | null; userAgent?: string | null; sessionKind?: string; isCurrent?: boolean }> };
  }>('/auth/sessions', { requireAuth: true });
}

export async function revokeSession(id: string) {
  return apiClient.post<{ success: boolean }>('/auth/sessions/revoke', { id }, { requireAuth: true });
}

export async function revokeOtherSessions() {
  return apiClient.post<{ success: boolean }>('/auth/sessions/revoke-others', {}, { requireAuth: true });
}

export async function get2faStatus() {
  return apiClient.get<{ success: boolean; data: { enabled: boolean } }>('/auth/2fa/status', { requireAuth: true });
}

export async function start2faSetup() {
  return apiClient.post<{ success: boolean; data: { secret: string; otpauthUrl: string; expiresAt: string } }>(
    '/auth/2fa/setup',
    {},
    { requireAuth: true }
  );
}

export async function enable2fa(code: string) {
  return apiClient.post<{ success: boolean; data: { recoveryCodes: string[] } }>(
    '/auth/2fa/enable',
    { code },
    { requireAuth: true }
  );
}

export async function disable2fa(input: { password: string; code: string }) {
  return apiClient.post<{ success: boolean }>('/auth/2fa/disable', input, { requireAuth: true });
}

/**
 * Create or get anonymous user
 */
export async function getOrCreateAnonymous(): Promise<string> {
  let anonymousId = localStorage.getItem('anonymousId');

  if (anonymousId) {
    return anonymousId;
  }

  try {
    const response = await apiClient.post<AnonymousResponse>('/auth/anonymous', {});
    if (response.success && response.data.anonymousId) {
      anonymousId = response.data.anonymousId;
      localStorage.setItem('anonymousId', anonymousId);
      return anonymousId;
    }
  } catch (error) {
    console.warn('Failed to create anonymous user:', error);
    // Fallback: generate local anonymous ID
    anonymousId = `anon_local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('anonymousId', anonymousId);
    return anonymousId;
  }

  throw new Error('Failed to create anonymous user');
}

/**
 * Refresh access token
 */
export async function refreshToken(): Promise<string> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({}),
  });
  const response = (await res.json()) as {
    success?: boolean;
    data?: { accessToken?: string };
  };
  if (!res.ok || !response.success || !response.data?.accessToken) {
    clearAccessToken();
    throw new Error('Failed to refresh token');
  }
  setAccessToken(response.data.accessToken);
  return response.data.accessToken;
}

/**
 * After OAuth redirect (`?oauth=success`), the refresh token is httpOnly — exchange it for an access token and load user.
 * Does not put refresh tokens in the URL.
 */
export async function completeOAuthCookieLogin(): Promise<AuthResponse> {
  await refreshToken();
  const anonymousId =
    typeof localStorage !== 'undefined' ? localStorage.getItem('anonymousId') : null;
  if (anonymousId) {
    try {
      await apiClient.post('/carts/merge', { anonymousId }, { requireAuth: true });
      localStorage.removeItem('anonymousId');
    } catch {
      /* ignore */
    }
  }
  return (await getCurrentUser()) as AuthResponse;
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  return apiClient.get('/auth/me');
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout', {});
  } catch {
    // best-effort
  }
  clearAccessToken();
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
  } catch {
    /* ignore */
  }
  // Keep anonymousId for guest cart persistence
}

export async function forgotPassword(email: string): Promise<{ success: boolean }> {
  return apiClient.post('/auth/forgot-password', { email });
}

export async function resetPassword(opts: {
  email: string;
  token: string;
  newPassword: string;
}): Promise<{ success: boolean }> {
  return apiClient.post('/auth/reset-password', opts);
}

export async function requestVerifyEmail(email: string): Promise<{ success: boolean; message?: string }> {
  return apiClient.post('/auth/verify-email/request', { email });
}

export async function confirmVerifyEmail(opts: { email: string; token: string }): Promise<{ success: boolean }> {
  return apiClient.post('/auth/verify-email/confirm', opts);
}

export async function confirmPassword(password: string): Promise<{ success: boolean }> {
  return apiClient.post('/auth/confirm-password', { password }, { requireAuth: true });
}

export async function deactivateAccount(): Promise<{ success: boolean }> {
  return apiClient.post('/users/me/deactivate', {}, { requireAuth: true });
}

export async function deleteAccount(): Promise<{ success: boolean }> {
  return apiClient.delete('/users/me', { requireAuth: true });
}

export type OAuthProvider = 'google' | 'facebook' | 'github' | 'apple';

export function oauthStartUrl(provider: OAuthProvider): string {
  const base = getApiBaseUrl();
  return `${base}/oauth/${provider}/start`;
}
