import { apiClient } from './client';

export async function getInternationalOverview(params?: { lang?: string }) {
  const qs = params?.lang ? `?lang=${encodeURIComponent(params.lang)}` : '';
  return apiClient.get(`/international/overview${qs}`);
}

