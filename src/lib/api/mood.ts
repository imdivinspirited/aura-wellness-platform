/**
 * Mood check-ins — MongoDB via platform API.
 */
import { apiClient } from './client';

export type MoodValue =
  // UI mood check modal values
  | 'happy'
  | 'calm'
  | 'neutral'
  | 'depressed'
  | 'great'
  | 'good'
  | 'okay'
  | 'stressed'
  | 'anxious'
  | 'sad'
  | 'angry'
  | 'tired';

export async function submitMoodEntry(mood: MoodValue, anonymousId: string): Promise<void> {
  await apiClient.post('/mood/entries', { mood, anonymous_id: anonymousId });
}

export async function postMood(input: { mood: MoodValue; note?: string }): Promise<unknown> {
  return apiClient.post('/mood/entries', { mood: input.mood, note: input.note }, { requireAuth: true });
}

export async function getMoodSummary(opts: { days: number }): Promise<unknown> {
  const days = Math.max(1, Math.min(365, opts.days));
  return apiClient.get(`/mood/summary?days=${days}`, { requireAuth: true });
}

export type MoodActivityFeedbackPayload = {
  before_mood: string;
  after_mood?: string | null;
  improvement_percent: number;
  activity_type?: string;
  activity_title?: string;
  youtube_video_id?: string;
};

function readAnonymousIdFromStorage(): string | undefined {
  try {
    return localStorage.getItem('anonymousId') || localStorage.getItem('anonymous_id') || undefined;
  } catch {
    return undefined;
  }
}

/** Log session outcome; optional new mood updates profile when signed in (server). */
export async function postMoodActivityFeedback(payload: MoodActivityFeedbackPayload): Promise<{ id?: string }> {
  const anonymous_id = readAnonymousIdFromStorage();
  const json = (await apiClient.post(
    '/mood/activity-feedback',
    { ...payload, anonymous_id },
    { requireAuth: false }
  )) as { success?: boolean; data?: { id?: string } };
  return { id: json?.data?.id };
}

export type MoodActivityFeedbackRow = {
  id: string;
  before_mood: string;
  after_mood: string | null;
  improvement_percent: number;
  activity_title?: string | null;
  activity_type?: string | null;
  youtube_video_id?: string | null;
  recorded_at: string;
};

export async function getMoodActivityFeedbackRecent(limit = 8): Promise<MoodActivityFeedbackRow[]> {
  const l = Math.max(1, Math.min(50, limit));
  const json = (await apiClient.get(`/mood/activity-feedback/recent?limit=${l}`, {
    requireAuth: true,
  })) as { success?: boolean; data?: MoodActivityFeedbackRow[] };
  return Array.isArray(json?.data) ? json.data : [];
}
