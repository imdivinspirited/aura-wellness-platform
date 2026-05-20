/**
 * Keeps users signed in: httpOnly refresh cookie is the source of truth; we periodically
 * rotate the access token and refresh when the tab becomes visible again.
 * (No IP pinning — standard OAuth2-style refresh rotation; IP is already stored on tokens server-side for audit.)
 */
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { refreshToken } from '@/lib/api/auth';

const PROACTIVE_REFRESH_MS = 10 * 60 * 1000;

export function useSessionKeepAlive() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const booted = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    const run = async () => {
      try {
        await refreshToken();
      } catch {
        /* no valid refresh cookie */
      }
    };

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      void run();
    };

    document.addEventListener('visibilitychange', onVisible);

    const interval = window.setInterval(() => {
      if (useAuthStore.getState().isAuthenticated) void run();
    }, PROACTIVE_REFRESH_MS);

    if (!booted.current) {
      booted.current = true;
      if (isAuthenticated) void run();
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(interval);
    };
  }, [isLoading, isAuthenticated]);
}
