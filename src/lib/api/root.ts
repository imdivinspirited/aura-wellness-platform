import { apiClient } from '@/lib/api/client';

export interface RootOverrideDto {
  page: string;
  elementId: string;
  selector: string;
  type: string;
  value: string;
  version: number;
  updatedAt: string;
}

export async function getRootOverrides(page: string): Promise<RootOverrideDto[]> {
  const res = await apiClient.get<{ success: boolean; data: { overrides: RootOverrideDto[] } }>(
    `/root/overrides?page=${encodeURIComponent(page)}`
  );
  return res.data.overrides || [];
}

export async function publishRootOverrides(
  updates: Array<{ page: string; elementId: string; selector: string; type?: string; value: string }>
): Promise<RootOverrideDto[]> {
  const res = await apiClient.post<{ success: boolean; data: { overrides: RootOverrideDto[] } }>(
    '/root/overrides/publish',
    { updates },
    { requireAuth: true }
  );
  return res.data.overrides || [];
}

