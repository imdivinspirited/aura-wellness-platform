const KEY = 'aolic-saved-searches';
const MAX = 12;

export function getSavedSearchQueries(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function addSavedSearchQuery(q: string): void {
  const t = q.trim();
  if (t.length < 2) return;
  try {
    const prev = getSavedSearchQueries().filter((x) => x.toLowerCase() !== t.toLowerCase());
    prev.unshift(t);
    localStorage.setItem(KEY, JSON.stringify(prev.slice(0, MAX)));
  } catch {
    /* ignore */
  }
}

export function removeSavedSearchQuery(q: string): void {
  try {
    const prev = getSavedSearchQueries().filter((x) => x !== q);
    localStorage.setItem(KEY, JSON.stringify(prev));
  } catch {
    /* ignore */
  }
}
