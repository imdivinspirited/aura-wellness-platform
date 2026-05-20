import { useRootAuthStore } from '@/stores/rootAuthStore';

/** Root session: access token in Zustand; refresh in httpOnly cookie (session-scoped). */
export function useRootAuth() {
  const accessToken = useRootAuthStore((s) => s.accessToken);
  const user = useRootAuthStore((s) => s.user);
  const isReady = useRootAuthStore((s) => s.isReady);
  const login = useRootAuthStore((s) => s.login);
  const logout = useRootAuthStore((s) => s.logout);
  const refreshSession = useRootAuthStore((s) => s.refreshSession);
  const initialize = useRootAuthStore((s) => s.initialize);

  return {
    isRootAuthenticated: !!accessToken && !!user,
    accessToken,
    user,
    isReady,
    login,
    logout,
    refreshSession,
    initialize,
  };
}
