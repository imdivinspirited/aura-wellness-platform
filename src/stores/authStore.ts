/**
 * Auth Store (Zustand)
 *
 * Manages authentication state.
 */

import type { LoginCredentials, RegisterData } from '@/lib/api/auth';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/auth/accessToken';
import {
  logout as apiLogout,
  getCurrentUser,
  getOrCreateAnonymous,
  login,
  refreshToken as apiRefreshToken,
  completeOAuthCookieLogin,
  register,
  confirmPassword as apiConfirmPassword,
  deactivateAccount as apiDeactivateAccount,
  deleteAccount as apiDeleteAccount,
  type OAuthProvider,
  oauthStartUrl,
} from '@/lib/api/auth';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  roles?: string[];
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
  register: (data: RegisterData, opts?: { storeSession?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  ensureAnonymous: () => Promise<string>;
  oauthStart: (provider: OAuthProvider) => void;
  /** Legacy: tokens passed in URL (avoid in new flows). */
  applyOAuthTokens: (tokens: { accessToken: string; refreshToken: string }) => Promise<void>;
  /** OAuth completed with httpOnly cookie only (`?oauth=success`). */
  completeOAuthFromCookie: () => Promise<void>;
  confirmPassword: (password: string) => Promise<void>;
  deactivateAccount: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  /** Clear client session without calling the logout API (e.g. after 401 on protected data). */
  clearSessionLocal: () => void;
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

        /** Allow slow networks / cold DB so refresh cookie can restore the session. */
        const INIT_DEADLINE_MS = 30_000;

        const finishAnonymous = async () => {
          const anonymousId = await get().ensureAnonymous();
          set({
            isAuthenticated: false,
            user: null,
            anonymousId,
            isLoading: false,
          });
        };

        const trySession = async (): Promise<void> => {
          try {
            const legacy = typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (legacy && !getAccessToken()) {
              // Migrate legacy key into the new accessToken storage (keeps users logged in after refresh).
              setAccessToken(legacy);
            }
          } catch {
            /* ignore */
          }

          if (!getAccessToken()) {
            try {
              await apiRefreshToken();
            } catch {
              /* no refresh cookie */
            }
          }

          if (getAccessToken()) {
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
                clearAccessToken();
                try {
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('refreshToken');
                  localStorage.removeItem('userId');
                } catch {
                  /* ignore */
                }
              }
            }
          }
          await finishAnonymous();
        };

        try {
          await Promise.race([
            trySession(),
            new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error('AUTH_INIT_TIMEOUT')), INIT_DEADLINE_MS);
            }),
          ]);
        } catch (error) {
          const timedOut = error instanceof Error && error.message === 'AUTH_INIT_TIMEOUT';
          if (timedOut) {
            console.warn('Auth initialization timed out — continuing with local anonymous id.');
            try {
              let aid = localStorage.getItem('anonymousId');
              if (!aid) {
                aid = `anon_local_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
                localStorage.setItem('anonymousId', aid);
              }
              set({
                isAuthenticated: false,
                user: null,
                anonymousId: aid,
                isLoading: false,
              });
            } catch {
              set({
                isAuthenticated: false,
                user: null,
                anonymousId: null,
                isLoading: false,
              });
            }
            return;
          }

          console.error('Auth initialization failed:', error);
          try {
            await finishAnonymous();
          } catch (fallbackError) {
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

      register: async (data, opts) => {
        const response = (await register(data, opts)) as ApiResponse;
        const storeSession = opts?.storeSession !== false;

        if (response?.success && response?.data?.user) {
          if (storeSession) {
            set({
              isAuthenticated: true,
              user: response.data.user,
              anonymousId: null,
            });
          }
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

      oauthStart: (provider) => {
        window.location.href = oauthStartUrl(provider);
      },

      applyOAuthTokens: async (tokens) => {
        setAccessToken(tokens.accessToken);
        try {
          // Keep refresh token as a fallback when cookies aren't sent (e.g. localhost vs 127.0.0.1).
          localStorage.setItem('aol_refresh_token_v1', tokens.refreshToken);
        } catch {
          /* ignore */
        }
        try {
          const response = (await getCurrentUser()) as ApiResponse;
          if (response?.success && response?.data?.user) {
            set({
              isAuthenticated: true,
              user: response.data.user,
              anonymousId: null,
            });
          }
        } catch (e) {
          console.warn('Failed to fetch user after OAuth callback:', e);
        }
      },

      completeOAuthFromCookie: async () => {
        const response = (await completeOAuthCookieLogin()) as ApiResponse;
        if (response?.success && response?.data?.user) {
          set({
            isAuthenticated: true,
            user: response.data.user,
            anonymousId: null,
          });
        } else {
          throw new Error('OAuth session incomplete');
        }
      },

      confirmPassword: async (password) => {
        const resp = await apiConfirmPassword(password);
        if (!(resp as any)?.success) {
          throw new Error('Password confirmation failed');
        }
      },

      deactivateAccount: async () => {
        const resp = await apiDeactivateAccount();
        if (!(resp as any)?.success) throw new Error('Failed to deactivate account');
        await get().logout();
      },

      deleteAccount: async () => {
        const resp = await apiDeleteAccount();
        if (!(resp as any)?.success) throw new Error('Failed to delete account');
        await get().logout();
      },

      clearSessionLocal: () => {
        clearAccessToken();
        try {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userId');
        } catch {
          /* ignore */
        }
        set({
          isAuthenticated: false,
          user: null,
        });
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
      name: 'aolic-bangalore-auth',
      /**
       * Do not persist `isAuthenticated` / `user`: async rehydration can run after `initialize()`
       * and overwrite a validated logged-out session with stale "logged in" state (no JWT),
       * which breaks protected API calls and shows "Please log in" on Profile after reload.
       */
      partialize: state => ({
        anonymousId: state.anonymousId,
      }),
      /** Ignore legacy persisted auth fields until `initialize()` repopulates from tokens. */
      merge: (persistedState, currentState) => {
        if (persistedState == null || typeof persistedState !== 'object') {
          return currentState;
        }
        const p = persistedState as { anonymousId?: string | null };
        return {
          ...currentState,
          ...(typeof p.anonymousId !== 'undefined' ? { anonymousId: p.anonymousId } : {}),
        };
      },
    }
  )
);
