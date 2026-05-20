import { create } from 'zustand';
import { getRootOperatorApiBase, getFetchFailureMessage } from '@/lib/api/client';
export type RootUserPublic = {
  id?: string;
  name: string;
  email: string;
  role: string;
};

type State = {
  accessToken: string | null;
  user: RootUserPublic | null;
  isReady: boolean;
  initialize: () => Promise<void>;
  setAccessToken: (t: string | null) => void;
  login: (input: { email: string; password: string; secretKey: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
};

export const useRootAuthStore = create<State>((set, get) => ({
  accessToken: null,
  user: null,
  isReady: false,

  setAccessToken: (t) => set({ accessToken: t }),

  refreshSession: async () => {
    const base = getRootOperatorApiBase();
    try {
      const r = await fetch(`${base}/root/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!r.ok) {
        set({ accessToken: null, user: null });
        return false;
      }
      const j = (await r.json()) as { success?: boolean; data?: { accessToken?: string } };
      const at = j?.data?.accessToken;
      if (!at) {
        set({ accessToken: null, user: null });
        return false;
      }
      set({ accessToken: at });
      const me = await fetch(`${base}/root/me`, {
        headers: { Authorization: `Bearer ${at}`, 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const mj = (await me.json()) as { data?: { user?: RootUserPublic } };
      if (me.ok && mj?.data?.user) {
        set({ user: mj.data.user, accessToken: at });
        return true;
      }
      set({ accessToken: null, user: null });
      return false;
    } catch {
      set({ accessToken: null, user: null });
      return false;
    }
  },

  initialize: async () => {
    set({ isReady: false });

    await get().refreshSession();
    set({ isReady: true });
  },

  login: async ({ email, password, secretKey }) => {
    const base = getRootOperatorApiBase();
    let r: Response;
    try {
      r = await fetch(`${base}/root/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, secretKey }),
      });
    } catch (e) {
      throw new Error(getFetchFailureMessage(e));
    }
    const j = (await r.json().catch(() => ({}))) as {
      success?: boolean;
      data?: { accessToken?: string; user?: RootUserPublic };
      error?: { message?: string; code?: string };
      message?: string;
    };
    if (!r.ok || !j.success || !j.data?.accessToken) {
      if (
        r.status === 404 &&
        (j.error?.code === 'NOT_FOUND' || String(j.error?.message || j.message || '').includes('No route'))
      ) {
        throw new Error(
          'Root API route not found. Port 4000 may be running an old server — stop it, run `npm run dev` in `backend` (or `npm run dev:stack` from the repo root), then try again.'
        );
      }
      throw new Error(j.error?.message || 'Login failed');
    }
    set({ accessToken: j.data.accessToken, user: j.data.user || null });
  },

  logout: async () => {
    const at = get().accessToken;
    const base = getRootOperatorApiBase();
    try {
      await fetch(`${base}/root/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(at ? { Authorization: `Bearer ${at}` } : {}),
        },
        body: JSON.stringify({}),
      });
    } catch {
      /* ignore */
    }
    set({ accessToken: null, user: null });
  },
}));
