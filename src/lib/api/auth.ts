/**
 * Authentication API
 *
 * API functions for authentication.
 */

import { apiClient } from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
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
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);

  if (response.success && response.data.tokens) {
    localStorage.setItem('accessToken', response.data.tokens.accessToken);
    localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
    localStorage.setItem('userId', response.data.user.id);
  }

  return response;
}

/**
 * Login user
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

  if (response.success && response.data.tokens) {
    localStorage.setItem('accessToken', response.data.tokens.accessToken);
    localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
    localStorage.setItem('userId', response.data.user.id);

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
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await apiClient.post<{ success: boolean; data: { accessToken: string } }>(
    '/auth/refresh',
    { refreshToken }
  );

  if (response.success && response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data.accessToken;
  }

  throw new Error('Failed to refresh token');
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
export function logout(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
  // Keep anonymousId for guest cart persistence
}
