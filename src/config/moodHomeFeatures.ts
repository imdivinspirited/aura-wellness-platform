/**
 * Mood home — feature flags & section registry (extend without rewriting the page).
 * Toggle via Vite env: VITE_MOOD_HOME_LABS=true (default on in dev).
 */
export const MOOD_HOME_SECTIONS = [
  'spotlight',
  'evidenceBreath',
  'labs',
  'safety',
] as const;

export type MoodHomeSectionId = (typeof MOOD_HOME_SECTIONS)[number];

function envBool(v: string | undefined, defaultTrue: boolean): boolean {
  if (v === undefined || v === '') return defaultTrue;
  return v === '1' || v.toLowerCase() === 'true';
}

export function isMoodHomeSectionEnabled(id: MoodHomeSectionId): boolean {
  if (import.meta.env.PROD && id === 'labs') {
    return envBool(import.meta.env.VITE_MOOD_HOME_LABS, true);
  }
  return true;
}
