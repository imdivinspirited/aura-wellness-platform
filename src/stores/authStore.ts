/**
 * Auth Store (Zustand)
 *
 * Manages authentication state.
 */

import type { LoginCredentials, RegisterData } from '@/lib/api/auth';
import {
  logout as apiLogout,
  getCurrentUser,
  getOrCreateAnonymous,
  login,
  refreshToken as apiRefreshToken,
  register,
} from '@/lib/api/auth';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    user?: User;
    accessToken?: string;
    refreshToken?: string;
  };
  error?: string;
  message?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  anonymousId: string | null;
  isLoading: boolean;
  initialize: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  ensureAnonymous: () => Promise<string>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      anonymousId: null,
      isLoading: true,

      initialize: async () => {
        set({ isLoading: true });
        try {
          // Check for existing token
          const accessToken = localStorage.getItem('accessToken');
          if (accessToken) {
            try {
              const response = (await getCurrentUser()) as ApiResponse;
              if (response?.success && response?.data?.user) {
                set({
                  isAuthenticated: true,
                  user: response.data.user,
                  isLoading: false,
                });
                return;
              }
            } catch (error) {
              // Token might be expired. Attempt refresh once before falling back to anonymous.
              console.warn('Failed to get current user (will attempt refresh):', error);
              try {
                await apiRefreshToken();
                const retry = (await getCurrentUser()) as ApiResponse;
                if (retry?.success && retry?.data?.user) {
                  set({
                    isAuthenticated: true,
                    user: retry.data.user,
                    isLoading: false,
                  });
                  return;
                }
              } catch (refreshError) {
                console.warn('Failed to refresh session:', refreshError);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userId');
              }
            }
          }

          // Ensure anonymous ID
          const anonymousId = await get().ensureAnonymous();
          set({
            isAuthenticated: false,
            user: null,
            anonymousId,
            isLoading: false,
          });
        } catch (error) {
          console.error('Auth initialization failed:', error);
          // Ensure we have an anonymous ID even on complete failure
          try {
            const anonymousId = await get().ensureAnonymous();
            set({
              isAuthenticated: false,
              user: null,
              anonymousId,
              isLoading: false,
            });
          } catch (fallbackError) {
            // Final fallback - set loading to false even if everything fails
            console.error('Failed to ensure anonymous ID:', fallbackError);
            set({
              isAuthenticated: false,
              user: null,
              anonymousId: null,
              isLoading: false,
            });
          }
        }
      },

      login: async credentials => {
        const response = (await login(credentials)) as ApiResponse;

        if (response?.success && response?.data?.user) {
          set({
            isAuthenticated: true,
            user: response.data.user,
            anonymousId: null,
          });
        } else {
          const errorMessage = response?.message || response?.error || 'Login failed';
          throw new Error(errorMessage);
        }
      },

      register: async data => {
        const response = (await register(data)) as ApiResponse;

        if (response?.success && response?.data?.user) {
          set({
            isAuthenticated: true,
            user: response.data.user,
            anonymousId: null,
          });
        } else {
          const errorMessage = response?.message || response?.error || 'Registration failed';
          throw new Error(errorMessage);
        }
      },

      logout: async () => {
        try {
          await apiLogout();
        } catch (error) {
          console.error('Logout API call failed:', error);
        }

        // Clear auth state but keep anonymous ID for guest cart
        const currentAnonymousId = get().anonymousId;
        set({
          isAuthenticated: false,
          user: null,
        });

        // Ensure we have an anonymous ID after logout
        if (!currentAnonymousId) {
          await get().ensureAnonymous();
        }
      },

      ensureAnonymous: async () => {
        const current = get().anonymousId;
        if (current) {
          return current;
        }

        try {
          const anonymousId = await getOrCreateAnonymous();
          set({ anonymousId });
          return anonymousId;
        } catch (error) {
          console.warn('Failed to create anonymous user:', error);

          // Check if we have a stored fallback ID
          const storedId = localStorage.getItem('anonymousId');
          if (storedId) {
            set({ anonymousId: storedId });
            return storedId;
          }

          // Create new fallback local ID
          const fallbackId = `anon_local_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
          set({ anonymousId: fallbackId });
          localStorage.setItem('anonymousId', fallbackId);
          return fallbackId;
        }
      },
    }),
    {
      name: 'aura-auth',
      partialize: state => ({
        anonymousId: state.anonymousId,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
