import { useEffect, useState } from 'react';
import type { ThemeType } from '@/stores/userStore';

function resolveTheme(theme: ThemeType): 'light' | 'dark' {
  if (theme === 'dark') return 'dark';
  if (theme === 'light') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Resolved light/dark for UI that cannot rely only on the `dark` class (e.g. full-bleed modals). */
export function useResolvedThemeMode(theme: ThemeType): 'light' | 'dark' {
  const [mode, setMode] = useState<'light' | 'dark'>(() => resolveTheme(theme));

  useEffect(() => {
    setMode(resolveTheme(theme));
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => setMode(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [theme]);

  return mode;
}
