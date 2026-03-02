/**
 * API Client
 *
 * Centralized HTTP client for backend API communication.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

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
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    if (!this.refreshInFlight) {
      this.refreshInFlight = (async () => {
        const url = `${this.baseURL}/auth/refresh`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userId');
          return null;
        }

        const json = (await res.json()) as { success?: boolean; data?: { accessToken?: string } };
        const nextToken = json?.data?.accessToken;
        if (nextToken) {
          localStorage.setItem('accessToken', nextToken);
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

    // Get access token
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Get anonymous ID
    const anonymousId = localStorage.getItem('anonymousId');
    if (anonymousId) {
      headers['X-Anonymous-Id'] = anonymousId;
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
        const error = await response.json().catch(() => ({
          error: { message: response.statusText },
        }));
        throw new Error(error.error?.message || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
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
