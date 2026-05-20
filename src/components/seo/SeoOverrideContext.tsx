import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type PageSeoMeta = {
  title: string;
  description?: string;
};

type Ctx = {
  pageMeta: PageSeoMeta | null;
  setPageMeta: (m: PageSeoMeta | null) => void;
};

const SeoOverrideContext = createContext<Ctx | null>(null);

export function SeoOverrideProvider({ children }: { children: ReactNode }) {
  const [pageMeta, setPageMeta] = useState<PageSeoMeta | null>(null);
  const value = useMemo(() => ({ pageMeta, setPageMeta }), [pageMeta]);
  return <SeoOverrideContext.Provider value={value}>{children}</SeoOverrideContext.Provider>;
}

/**
 * Per-route unique title + optional description (wins over GlobalSEO route map until unmount).
 */
export function useSeoPageMeta(meta: PageSeoMeta | null | undefined) {
  const ctx = useContext(SeoOverrideContext);
  const setPageMeta = ctx?.setPageMeta;
  const title = meta?.title;
  const description = meta?.description;

  useEffect(() => {
    if (!setPageMeta) return;
    if (!title?.trim()) {
      setPageMeta(null);
      return;
    }
    setPageMeta({ title: title.trim(), description: description?.trim() });
    return () => setPageMeta(null);
  }, [title, description, setPageMeta]);
}

export function useSeoOverrideReader() {
  return useContext(SeoOverrideContext);
}
