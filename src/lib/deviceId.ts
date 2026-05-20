const STORAGE_KEY = 'aol_device_id_v1';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Stable per-browser profile id for anti-spam limits. Not personally identifiable.
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return '';
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing && UUID_V4.test(existing)) {
      return existing.toLowerCase();
    }
    if (typeof crypto === 'undefined' || typeof crypto.randomUUID !== 'function') {
      return '';
    }
    const id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
    return id.toLowerCase();
  } catch {
    return '';
  }
}
