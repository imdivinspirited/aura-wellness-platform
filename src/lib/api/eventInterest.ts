import { apiClient } from './client';

export interface EventInterestRegistration {
  id: string;
  eventSlug: string;
  name: string;
  email: string;
  phone: string;
  city: string | null;
  vibe: string | null;
  note: string | null;
  updatesOk: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export async function submitEventInterest(
  eventSlug: string,
  payload: {
    name: string;
    email: string;
    phone: string;
    city?: string;
    vibe?: string;
    note?: string;
    updatesOk?: boolean;
  }
) {
  return apiClient.post<{ success: boolean; data: { id: string; updated?: boolean } }>(
    `/events/${encodeURIComponent(eventSlug)}/interest`,
    payload
  );
}

/** Root platform user only — requires Bearer token with `role: root`. */
export async function rootListEventInterest(eventSlug?: string) {
  const qs = eventSlug?.trim() ? `?eventSlug=${encodeURIComponent(eventSlug.trim())}` : '';
  return apiClient.get<{ success: boolean; data: { registrations: EventInterestRegistration[] } }>(
    `/events/interest/registrations${qs}`,
    { requireAuth: true }
  );
}
