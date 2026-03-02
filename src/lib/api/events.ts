import { apiClient } from '@/lib/api/client';

export interface DonationConfig {
  googlePay?: string;
  phonePe?: string;
  upiId?: string;
  qrImagePath?: string;
  phoneNumber?: string;
}

export async function getEventDonationConfig(slug: string): Promise<DonationConfig | null> {
  const res = await apiClient.get<{ success: boolean; data: { config: DonationConfig | null } }>(
    `/events/${encodeURIComponent(slug)}/donation`
  );
  return res?.data?.config ?? null;
}

export async function updateEventDonationConfig(slug: string, config: DonationConfig): Promise<DonationConfig> {
  const res = await apiClient.put<{ success: boolean; data: { config: DonationConfig } }>(
    `/events/${encodeURIComponent(slug)}/donation`,
    config,
    { requireAuth: true }
  );
  return res.data.config;
}

