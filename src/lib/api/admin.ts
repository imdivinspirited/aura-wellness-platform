import { apiClient } from './client';

export interface AdminProgramInput {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  category: 'beginning' | 'advance' | 'children_teens' | 'more' | 'retreats';
}

export interface AdminEventInput {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  schedule: { startAt: string; timezone?: string };
}

export interface AdminServiceInput {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  category: 'dining' | 'stay' | 'transport' | 'facilities' | 'shopping' | 'support' | 'other';
}

export async function adminGetPrograms() {
  return apiClient.get('/admin/programs', { requireAuth: true });
}
export async function adminCreateProgram(input: AdminProgramInput) {
  return apiClient.post('/admin/programs', input, { requireAuth: true });
}
export async function adminUpdateProgram(id: string, input: Partial<AdminProgramInput>) {
  return apiClient.put(`/admin/programs/${encodeURIComponent(id)}`, input, { requireAuth: true });
}
export async function adminDeleteProgram(id: string) {
  return apiClient.delete(`/admin/programs/${encodeURIComponent(id)}`, { requireAuth: true });
}

export async function adminGetEvents() {
  return apiClient.get('/admin/events', { requireAuth: true });
}
export async function adminCreateEvent(input: AdminEventInput) {
  return apiClient.post('/admin/events', input, { requireAuth: true });
}
export async function adminUpdateEvent(id: string, input: Partial<AdminEventInput>) {
  return apiClient.put(`/admin/events/${encodeURIComponent(id)}`, input, { requireAuth: true });
}
export async function adminDeleteEvent(id: string) {
  return apiClient.delete(`/admin/events/${encodeURIComponent(id)}`, { requireAuth: true });
}

export async function adminGetServices() {
  return apiClient.get('/admin/services', { requireAuth: true });
}
export async function adminCreateService(input: AdminServiceInput) {
  return apiClient.post('/admin/services', input, { requireAuth: true });
}
export async function adminUpdateService(id: string, input: Partial<AdminServiceInput>) {
  return apiClient.put(`/admin/services/${encodeURIComponent(id)}`, input, { requireAuth: true });
}
export async function adminDeleteService(id: string) {
  return apiClient.delete(`/admin/services/${encodeURIComponent(id)}`, { requireAuth: true });
}

export interface AdminPageInput {
  slug: string;
  title: string;
  description?: string;
  status?: 'draft' | 'published';
  language?: string;
  sections?: Array<{ sectionId: string; type: string; order: number; props: Record<string, unknown> }>;
}

export async function adminGetPages() {
  return apiClient.get('/admin/pages', { requireAuth: true });
}
export async function adminGetPage(id: string) {
  return apiClient.get(`/admin/pages/${encodeURIComponent(id)}`, { requireAuth: true });
}
export async function adminCreatePage(input: AdminPageInput) {
  return apiClient.post('/admin/pages', input, { requireAuth: true });
}
export async function adminUpdatePage(id: string, input: Partial<AdminPageInput>) {
  return apiClient.put(`/admin/pages/${encodeURIComponent(id)}`, input, { requireAuth: true });
}
export async function adminDeletePage(id: string) {
  return apiClient.delete(`/admin/pages/${encodeURIComponent(id)}`, { requireAuth: true });
}

export async function adminGetMedia() {
  return apiClient.get('/admin/media', { requireAuth: true });
}
export async function adminPresignMedia(input: { kind: 'image' | 'document'; contentType: string; fileName: string; sizeBytes: number }) {
  return apiClient.post('/admin/media/presign', input, { requireAuth: true });
}
export async function adminFinalizeMedia(input: { assetId: string; cdnUrl?: string; alt?: string; title?: string }) {
  return apiClient.post('/admin/media/finalize', input, { requireAuth: true });
}

export async function adminSeedDemoData() {
  return apiClient.post('/admin/seed/demo', {}, { requireAuth: true });
}

export async function adminReindexSearch() {
  return apiClient.post('/admin/search/reindex', {}, { requireAuth: true });
}

export type MoodStatEntry = { mood: string; recorded_at: string };

export async function adminGetMoodStats(): Promise<MoodStatEntry[]> {
  const res = await apiClient.get<{ success: boolean; data: { entries: MoodStatEntry[] } }>(
    '/admin/mood-stats',
    { requireAuth: true }
  );
  return res.data?.entries ?? [];
}

