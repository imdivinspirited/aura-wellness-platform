import { apiClient } from './client';
import type { ResumeDocumentV1 } from '@/lib/resume/types';
import { getApiBaseUrl } from './client';
import { getAccessToken } from '@/lib/auth/accessToken';

export interface UserProfileDetails {
  avatarUrl?: string;
  /** ISO timestamp — use for cache-busting image URL after upload */
  avatarUpdatedAt?: string;
  whatsapp?: string;
  age?: number;
  gender?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  addressLine?: string;
  education?: string;
  skills?: string;
  availableFrom?: string;
  duration?: string;
  headline?: string;
  bio?: string;
  website?: string;
  instagram?: string;
  linkedin?: string;
  /** Last mood reported after a guided session (server). */
  wellnessMood?: string;
  wellnessMoodUpdatedAt?: string;
  wellnessLastImprovementPercent?: number;
  wellnessLastActivityTitle?: string;
}

export async function getMyProfile() {
  return apiClient.get('/users/profile/full', { requireAuth: true });
}

export type PublicProfileAchievement = {
  title: string;
  description?: string;
  createdAt?: string;
};

export type PublicProfilePayload = {
  user: { id: string; name: string };
  details: UserProfileDetails | null;
  achievements: PublicProfileAchievement[];
};

/** No auth — for `/u/:userId` share links. Omits phone, email, address, PIN on the server. */
export async function getPublicProfile(userId: string): Promise<{ success: boolean; data: PublicProfilePayload }> {
  const id = String(userId || '').trim();
  if (!id) throw new Error('Missing user id');
  const res = await fetch(`${getApiBaseUrl()}/users/public/${encodeURIComponent(id)}`);
  const json = (await res.json()) as { success?: boolean; data?: PublicProfilePayload; error?: { message?: string } };
  if (!res.ok || json.success === false) {
    throw new Error(json.error?.message || 'Profile not found');
  }
  if (!json.data) throw new Error('Invalid response');
  return { success: true, data: json.data };
}

export async function updateMyProfile(input: {
  name?: string;
  phone?: string;
  details?: UserProfileDetails;
  resume?: ResumeDocumentV1;
}) {
  return apiClient.put('/users/profile/full', input, { requireAuth: true });
}

export async function uploadMyAvatarRaw(file: File): Promise<{ avatarUrl: string }> {
  if (!file || !(file instanceof File)) throw new Error('Invalid file');
  const ct = (file.type || '').toLowerCase();
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(ct)) {
    throw new Error('Please upload a PNG, JPG, or WebP image.');
  }
  if (file.size > 3 * 1024 * 1024) {
    throw new Error('Image too large. Max 3MB.');
  }

  const base = getApiBaseUrl();
  const accessToken = getAccessToken();
  const res = await fetch(`${base}/users/profile/avatar/raw`, {
    method: 'PUT',
    body: file,
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      'Content-Type': ct,
    },
    credentials: 'include',
  });
  const json = (await res.json()) as any;
  if (!res.ok || !json?.success) {
    throw new Error(json?.error?.message || 'Failed to upload avatar.');
  }
  return { avatarUrl: json.data.avatarUrl as string };
}

export async function removeMyAvatar(): Promise<void> {
  const base = getApiBaseUrl();
  const accessToken = getAccessToken();
  const res = await fetch(`${base}/users/profile/avatar`, {
    method: 'DELETE',
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  const json = (await res.json()) as any;
  if (!res.ok || !json?.success) {
    throw new Error(json?.error?.message || 'Failed to remove avatar.');
  }
}

