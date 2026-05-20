import { useEffect, useMemo, useRef } from 'react';
import { LANGUAGES, useUserStore } from '@/stores/userStore';
import {
  buildIncludedLanguages,
  isFullPageTranslateEnabled,
  loadAndInitGoogleTranslate,
  waitAndApplyLanguage,
} from '@/lib/fullPageTranslate';

const MOUNT_ID = 'google_translate_element';

/**
 * When `VITE_ENABLE_FULL_PAGE_TRANSLATE=true`, loads Google’s website translator and keeps it in sync
 * with `useUserStore` language. Hides the default floating UI via CSS in `index.css`.
 */
export function GoogleTranslateBridge() {
  const language = useUserStore((s) => s.language);
  const initOk = useRef(false);
  const included = useMemo(
    () => buildIncludedLanguages(LANGUAGES.map((l) => l.code)),
    []
  );

  useEffect(() => {
    if (!isFullPageTranslateEnabled()) return;

    let cancelled = false;

    const run = async () => {
      if (!initOk.current) {
        try {
          await loadAndInitGoogleTranslate(MOUNT_ID, included);
          if (cancelled) return;
          initOk.current = true;
        } catch {
          return;
        }
      }
      if (cancelled) return;
      await waitAndApplyLanguage(language);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [language, included]);

  if (!isFullPageTranslateEnabled()) {
    return null;
  }

  return (
    <div
      id={MOUNT_ID}
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-0 w-0 overflow-hidden opacity-0"
      aria-hidden
    />
  );
}
