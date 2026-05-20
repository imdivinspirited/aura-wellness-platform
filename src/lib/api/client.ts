/**
 * API Client
 *
 * Centralized HTTP client for backend API communication.
 *
 * Default: same-origin `/api/v1` — Vite dev server proxies `/api` → backend (:4000), so sign-up works without CORS issues.
 * Override with `VITE_API_BASE_URL` when the API is on another host (e.g. production).
 */

import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/auth/accessToken';
import { getOrCreateDeviceId } from '@/lib/deviceId';

/**
 * Resolves the platform API base URL.
 * - Default `/api/v1` → same origin; Vite `server`/`preview` proxy `/api` → backend :4000 (no CORS).
 * - If `VITE_API_BASE_URL` is set to `http://host:port` with no path, `/api/v1` is appended (common misconfig fix).
 */
export function getApiBaseUrl(): string {
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (!raw) {
    return '/api/v1';
  }
  let base = raw.replace(/\/$/, '');
  try {
    const u = new URL(
      base,
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
    );
    const p = (u.pathname || '/').replace(/\/$/, '') || '/';
    if (p === '/') {
      u.pathname = '/api/v1';
      base = `${u.origin}${u.pathname}`.replace(/\/$/, '');
    } else {
      base = `${u.origin}${u.pathname}`.replace(/\/$/, '');
    }
  } catch {
    if (!base.startsWith('/')) {
      base = `/${base}`;
    }
  }
  return base;
}

/** Backend always serves root operator routes under `/api/v1/root` (signup, login, me, …). */
export const ROOT_OPERATOR_API_PREFIX = '/api/v1';

/**
 * Base URL for root operator routes (`/root/signup`, `/root/login`, …).
 * When `VITE_API_BASE_URL` is unset, uses same-origin `/api/v1` (Vite proxies `/api` → backend).
 * When set, uses that API **origin** + `/api/v1` so root routes never hit a wrong `/api/*` prefix.
 */
export function getRootOperatorApiBase(): string {
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (!raw) {
    return ROOT_OPERATOR_API_PREFIX;
  }
  try {
    const resolved = getApiBaseUrl();
    const u = new URL(
      resolved,
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
    );
    return `${u.origin}/api/v1`;
  } catch {
    return ROOT_OPERATOR_API_PREFIX;
  }
}

/** Message when `fetch()` fails (offline, refused connection, CORS, wrong URL). */
export function getFetchFailureMessage(err: unknown): string {
  const isNet =
    err instanceof TypeError ||
    (err instanceof Error &&
      (err.message === 'Failed to fetch' ||
        err.message === 'Load failed' ||
        err.message.includes('NetworkError')));
  if (isNet) {
    return (
      'Cannot reach the API. From the repo root run `npm run dev` (Vite proxies /api to :4000) or `npm run dev:stack`. ' +
      'If you use VITE_API_BASE_URL, set it to http://127.0.0.1:4000/api/v1 while the backend is running.'
    );
  }
  if (err instanceof Error) return err.message;
  return 'Network error';
}

const API_BASE_URL = getApiBaseUrl();

/** Parse JSON error bodies from the platform API (message may be a string or Zod field map). */
export function formatApiErrorBody(body: unknown, fallback: string): string {
  if (body == null || typeof body !== 'object') return fallback;
  const o = body as Record<string, unknown>;
  const err = o.error;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    const detail = typeof e.detail === 'string' ? e.detail.trim() : '';
    if (typeof e.message === 'string') {
      return detail ? `${e.message} — ${detail}` : e.message;
    }
    if (e.message && typeof e.message === 'object') {
      const msg = e.message as Record<string, string[] | string | undefined>;
      const parts: string[] = [];
      for (const [key, val] of Object.entries(msg)) {
        if (Array.isArray(val)) parts.push(...val.map((x) => `${key}: ${x}`));
        else if (val != null && val !== '') parts.push(`${key}: ${String(val)}`);
      }
      if (parts.length) return parts.join(' ');
    }
    if (typeof e.code === 'string' && e.code !== 'VALIDATION_ERROR') {
      if (typeof e.message === 'string') return e.message;
      return e.code;
    }
  }
  if (typeof o.message === 'string') return o.message;
  if (typeof o.detail === 'string') return o.detail;
  return fallback;
}

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

class ApiClient {
  private baseURL: string;
  private refreshInFlight: Promise<string | null> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshInFlight) {
      this.refreshInFlight = (async () => {
        const url = `${this.baseURL}/auth/refresh`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({}),
        });

        if (!res.ok) {
          clearAccessToken();
          try {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userId');
          } catch {
            /* ignore */
          }
          return null;
        }

        const json = (await res.json()) as { success?: boolean; data?: { accessToken?: string } };
        const nextToken = json?.data?.accessToken;
        if (nextToken) {
          setAccessToken(nextToken);
          return nextToken;
        }
        return null;
      })().finally(() => {
        this.refreshInFlight = null;
      });
    }

    return this.refreshInFlight;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const accessToken = getAccessToken();
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Get anonymous ID
    const anonymousId = localStorage.getItem('anonymousId') || localStorage.getItem('anonymous_id');
    if (anonymousId) {
      headers['X-Anonymous-Id'] = anonymousId;
    }

    const deviceId = getOrCreateDeviceId();
    if (deviceId) {
      headers['X-Device-Id'] = deviceId;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { requireAuth = false, ...fetchOptions } = options;
    const url = `${this.baseURL}${endpoint}`;

    try {
      const doFetch = async () => {
        const headers = await this.getAuthHeaders();
        return fetch(url, {
          ...fetchOptions,
          headers: {
            ...headers,
            ...(fetchOptions.headers || {}),
          },
          credentials: 'include',
        });
      };

      let response = await doFetch();

      // If unauthorized, attempt refresh once, then retry the original request.
      if (response.status === 401) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          response = await doFetch();
        }
      }

      if (requireAuth && response.status === 401) {
        throw new Error('Please log in to continue.');
      }

      if (!response.ok) {
        const text = await response.text();
        let parsed: unknown = null;
        try {
          parsed = text ? JSON.parse(text) : null;
        } catch {
          parsed = null;
        }
        const looksHtml = /^\s*</.test(text || '');
        /** First chars of body when JSON parse fails or payload is large (do not gate on total length). */
        const plainSnippet = text && !looksHtml ? text.trim().slice(0, 800) : '';

        const gatewayHelp =
          'Start the API on port 4000: `cd backend && npm run dev`, or from the repo root `npm run dev`. Open http://127.0.0.1:4000/healthz — you want `"mongoReady": true`.';

        // Prefer JSON error bodies from the API (503 DB down, validation, etc.) over generic gateway text.
        if (parsed) {
          let apiMsg = formatApiErrorBody(parsed, '').trim();
          if (!apiMsg && typeof parsed === 'object' && parsed !== null) {
            const raw = JSON.stringify(parsed);
            if (raw.length >= 2 && raw.length <= 4000) apiMsg = raw;
          }
          if (apiMsg) throw new Error(apiMsg);
        }
        if (plainSnippet) throw new Error(plainSnippet);

        if (response.status === 502 || response.status === 503 || response.status === 504) {
          throw new Error(`Cannot reach the API (bad gateway / unavailable). ${gatewayHelp}`);
        }
        if (looksHtml) {
          throw new Error(
            `The server returned HTML instead of JSON — usually nothing is listening on :4000. ${gatewayHelp}`
          );
        }

        const method = String(fetchOptions.method || 'GET');
        const absoluteUrl =
          typeof window !== 'undefined'
            ? new URL(url, window.location.origin).href
            : url;
        const bodyPreview = text?.trim() ? text.trim().slice(0, 500) : '';
        const t = text || '';
        throw new Error(
          response.status >= 500
            ? `HTTP ${response.status} ${method} ${absoluteUrl}${
                bodyPreview
                  ? ` — ${bodyPreview}${t.length > 500 ? '…' : ''}`
                  : '. No response body (API may have crashed or the proxy dropped the body). Run \`npm run dev\` from the repo root; check http://127.0.0.1:4000/healthz for "mongoReady": true.'
              }`
            : response.statusText || 'Request failed'
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        const isNetwork =
          error instanceof TypeError ||
          (typeof error.message === 'string' &&
            (error.message === 'Failed to fetch' ||
              error.message === 'Load failed' ||
              error.message.includes('NetworkError')));
        if (isNetwork) {
          throw new Error(getFetchFailureMessage(error));
        }
        throw error;
      }
      throw new Error(getFetchFailureMessage(error));
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
