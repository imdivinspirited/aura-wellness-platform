/**
 * Shared language sync — no imports from userStore or i18n (avoids circular deps).
 */

let currentLanguage = 'en';
const languageListeners = new Set<() => void>();

export function subscribeToLanguageChange(listener: () => void): () => void {
  languageListeners.add(listener);
  return () => {
    languageListeners.delete(listener);
  };
}

function notifyLanguageChange() {
  languageListeners.forEach((listener) => listener());
}

export function updateGlobalLanguage(lang: string) {
  if (currentLanguage !== lang) {
    currentLanguage = lang;
    notifyLanguageChange();
  }
}

export function getSyncedLanguage(): string {
  return currentLanguage;
}

export function setSyncedLanguageInitial(lang: string) {
  currentLanguage = lang || 'en';
}
