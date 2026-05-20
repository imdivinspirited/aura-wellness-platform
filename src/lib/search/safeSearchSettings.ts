const KEY = 'aolic-search-safe-mode';

export function getSafeSearchEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function setSafeSearchEnabled(on: boolean): void {
  try {
    localStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    /* ignore */
  }
}

/** Mild client-side filter: drops items whose blob matches crude adult/violence keywords */
const BLOCK = /\b(porn|xxx|nsfw|explicit sex|violence gore)\b/i;

export function passesSafeSearchFilter(title: string, description: string): boolean {
  if (!getSafeSearchEnabled()) return true;
  const blob = `${title} ${description}`;
  return !BLOCK.test(blob);
}
