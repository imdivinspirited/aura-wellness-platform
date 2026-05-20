/**
 * Full-page machine translation (Google Website Translator).
 *
 * Why this exists alongside `t()` / locale JSON:
 * - Hand-maintained keys scale poorly for every label on every route.
 * - This layer translates the **rendered DOM** to the user’s selected language in one pass.
 * - Your existing `t('hi')` strings still apply first; Google then aligns the rest.
 *
 * Enable with: VITE_ENABLE_FULL_PAGE_TRANSLATE=true
 *
 * Trade-offs: machine translation quality, Google UI quirks, third-party script. For production-grade
 * control use Tolgee/Lokalise + MT in CI, or keep expanding `nav`/`home` bundles for critical copy.
 */

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
  }
}

type GoogleTranslateElementCtor = new (
  options: {
    pageLanguage: string;
    includedLanguages: string;
    layout?: number;
    autoDisplay?: boolean;
  },
  elementId: string
) => unknown;

type GoogleTranslateModule = {
  TranslateElement: GoogleTranslateElementCtor & {
    InlineLayout: { SIMPLE: number };
  };
};

function getGoogleTranslate(): GoogleTranslateModule | undefined {
  return (window as unknown as { google?: { translate?: GoogleTranslateModule } }).google?.translate;
}

let scriptLoaded = false;
let initDone = false;

/** Map app codes to Google’s dropdown values (mostly identical). */
export function toGoogleLangCode(code: string): string {
  const c = (code || 'en').toLowerCase();
  if (c === 'zh') return 'zh-CN';
  return c;
}

/** Languages offered in the widget (comma-separated, no spaces). */
export function buildIncludedLanguages(codes: string[]): string {
  const set = new Set<string>();
  for (const c of codes) {
    set.add(toGoogleLangCode(c));
  }
  set.add('en');
  return [...set].join(',');
}

function markScriptPresent(): void {
  scriptLoaded = true;
}

export function prepareGoogleTranslateInit(mountId: string, includedLanguages: string): void {
  window.googleTranslateElementInit = () => {
    try {
      const tr = getGoogleTranslate();
      const TE = tr?.TranslateElement;
      if (!TE?.InlineLayout) return;
      const layout = TE.InlineLayout.SIMPLE;
      // eslint-disable-next-line new-cap -- Google TranslateElement API
      new TE(
        {
          pageLanguage: 'en',
          includedLanguages,
          layout,
          autoDisplay: false,
        },
        mountId
      );
      initDone = true;
    } catch {
      /* ignore */
    }
  };
}

export function loadGoogleTranslateScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (scriptLoaded) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="translate.google.com"]');
    if (existing) {
      markScriptPresent();
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.async = true;
    s.onerror = () => reject(new Error('Google Translate script failed to load'));
    s.onload = () => {
      markScriptPresent();
      resolve();
    };
    document.head.appendChild(s);
  });
}

/**
 * Register init callback, load script, then run init if the library is already present (cached script).
 */
export async function loadAndInitGoogleTranslate(
  mountId: string,
  includedLanguages: string
): Promise<void> {
  if (typeof window === 'undefined') return;
  prepareGoogleTranslateInit(mountId, includedLanguages);
  await loadGoogleTranslateScript();
  const TE = getGoogleTranslate()?.TranslateElement;
  if (TE && !initDone) {
    window.googleTranslateElementInit?.();
  }
}

/**
 * Apply target language via the widget’s combo (no full page reload).
 * Returns true if applied or not needed (en).
 */
export function applyGoogleTranslateLanguage(targetCode: string): boolean {
  if (typeof document === 'undefined') return false;
  const googleLang = toGoogleLangCode(targetCode);

  const select = document.querySelector(
    '.goog-te-combo'
  ) as HTMLSelectElement | null;

  if (!select) return false;

  if (googleLang === 'en') {
    const empty = Array.from(select.options).find(
      (o) => o.value === '' || o.value === 'en' || /^\|en/.test(o.value)
    );
    if (empty) {
      select.value = empty.value;
    } else {
      select.selectedIndex = 0;
    }
    select.dispatchEvent(new Event('change'));
    return true;
  }

  const match = Array.from(select.options).find((o) => {
    const v = o.value.toLowerCase();
    return (
      v === googleLang ||
      v.startsWith(`${googleLang}|`) ||
      v.includes(`/${googleLang}`) ||
      o.text.toLowerCase().includes(googleLang)
    );
  });

  if (match) {
    select.value = match.value;
    select.dispatchEvent(new Event('change'));
    return true;
  }

  return false;
}

/** Poll until combo exists (widget renders async). */
export function waitAndApplyLanguage(
  targetCode: string,
  maxAttempts = 80,
  intervalMs = 75
): Promise<boolean> {
  return new Promise((resolve) => {
    let n = 0;
    const tick = () => {
      if (applyGoogleTranslateLanguage(targetCode)) {
        resolve(true);
        return;
      }
      n += 1;
      if (n >= maxAttempts) {
        resolve(false);
        return;
      }
      window.setTimeout(tick, intervalMs);
    };
    tick();
  });
}

export function isFullPageTranslateEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_FULL_PAGE_TRANSLATE === 'true';
}
