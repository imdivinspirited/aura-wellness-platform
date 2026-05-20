import { getAccessToken } from '@/lib/auth/accessToken';
import { getApiBaseUrl } from './client';

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {};
  const accessToken = getAccessToken();
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  const anonymousId = localStorage.getItem('anonymousId');
  if (anonymousId) headers['X-Anonymous-Id'] = anonymousId;
  return headers;
}

const API_BASE_URL = getApiBaseUrl();

export async function downloadMyResumePdf(): Promise<Blob> {
  const res = await fetch(`${API_BASE_URL}/users/resume.pdf`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!res.ok) {
    let message = 'Failed to download resume PDF';
    try {
      const json = (await res.json()) as any;
      message = json?.error?.message || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return await res.blob();
}
