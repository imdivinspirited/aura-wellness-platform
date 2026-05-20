import { useEffect } from 'react';
import type { AppearanceSettings } from '@/stores/userStore';

/**
 * Applies theme, preset, typography, and a11y flags to `document.documentElement`.
 * Lives at app root so it runs on every route (including auth) — not only inside MainLayout.
 */
export function useApplyAppearanceToDocument(appearance: AppearanceSettings) {
  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove('theme-classic-spiritual', 'theme-ocean-calm', 'theme-forest-serenity');
    root.classList.add(`theme-${appearance.themePreset}`);

    const applyColorMode = () => {
      if (appearance.theme === 'dark') {
        root.classList.add('dark');
      } else if (appearance.theme === 'light') {
        root.classList.remove('dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', prefersDark);
      }
    };

    applyColorMode();

    const fontSizes: Record<string, string> = {
      S: '14px',
      M: '16px',
      L: '18px',
      XL: '20px',
    };
    root.style.fontSize = fontSizes[appearance.fontSize];

    if (appearance.reduceMotion) {
      root.style.setProperty('--transition-base', '0ms');
      root.style.setProperty('--transition-smooth', '0ms');
      root.style.setProperty('--transition-spring', '0ms');
    }

    root.classList.toggle('high-contrast', appearance.highContrast);
    root.classList.toggle('calm-mode', appearance.calmMode);
  }, [appearance]);

  useEffect(() => {
    if (appearance.theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => {
      document.documentElement.classList.toggle('dark', mq.matches);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [appearance.theme]);
}
