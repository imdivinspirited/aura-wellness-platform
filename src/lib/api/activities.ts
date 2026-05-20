import { apiClient } from './client';

export type ActivityKind = 'program' | 'event' | 'service' | 'seva' | 'achievement' | 'note';

export interface ActivityItem {
  _id: string;
  userId: string;
  kind: ActivityKind;
  title: string;
  org?: string;
  department?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  hours?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function listMyActivities(params?: { kind?: ActivityKind }) {
  const qs = params?.kind ? `?kind=${encodeURIComponent(params.kind)}` : '';
  return apiClient.get<{ success: boolean; data: { items: ActivityItem[] } }>(`/users/activities${qs}`, {
    requireAuth: true,
  });
}

export async function createMyActivity(input: Omit<ActivityItem, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) {
  return apiClient.post<{ success: boolean; data: { item: ActivityItem } }>('/users/activities', input, {
    requireAuth: true,
  });
}

export async function deleteMyActivity(id: string) {
  return apiClient.delete<{ success: boolean }>(`/users/activities/${encodeURIComponent(id)}`, { requireAuth: true });
}

export async function updateMyActivity(
  id: string,
  patch: Partial<Omit<ActivityItem, '_id' | 'userId' | 'createdAt' | 'updatedAt'>>
) {
  return apiClient.put<{ success: boolean; data: { item: ActivityItem } }>(
    `/users/activities/${encodeURIComponent(id)}`,
    patch,
    { requireAuth: true }
  );
}

