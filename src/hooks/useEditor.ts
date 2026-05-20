import { useCallback, useEffect, useRef, useState } from 'react';
import { editorGetPage, editorSavePage } from '@/lib/api/editorApi';
import { normalizeBlocksClient, type CanvasBlock } from '@/lib/editor/blocks';

const AUTOSAVE_MS = 30_000;

type PageState = Record<string, unknown> & {
  blocks?: CanvasBlock[];
  components?: CanvasBlock[];
};

export function useEditor(slug: string) {
  const [page, setPage] = useState<PageState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const blocks: CanvasBlock[] = normalizeBlocksClient(page?.blocks ?? page?.components ?? []);

  const syncBlocksToPage = useCallback((next: CanvasBlock[], base: PageState | null): PageState => {
    const p = base || {};
    return {
      ...p,
      blocks: next,
      components: next,
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await editorGetPage(slug);
      const rawPage = r.data.page as PageState | undefined;
      const list = normalizeBlocksClient(r.data.blocks ?? rawPage?.blocks ?? rawPage?.components ?? []);
      setPage(
        syncBlocksToPage(list, {
          ...rawPage,
          slug: r.data.slug ?? rawPage?.slug ?? slug,
        })
      );
      dirty.current = false;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
      setPage(
        syncBlocksToPage([], {
          slug,
          pageUrl: '/',
          title: '',
          version: 0,
        })
      );
    } finally {
      setLoading(false);
    }
  }, [slug, syncBlocksToPage]);

  const save = useCallback(async () => {
    if (!page) return;
    setSaving(true);
    setError(null);
    try {
      const payload = normalizeBlocksClient(page.blocks ?? page.components ?? []);
      await editorSavePage(slug, {
        blocks: payload,
        pageUrl: (page.pageUrl as string) || '/',
        title: (page.title as string) || undefined,
        description: 'Saved',
      });
      dirty.current = false;
      setLastSaved(new Date());
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
      throw e;
    } finally {
      setSaving(false);
    }
  }, [page, slug, load]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    timer.current = setInterval(() => {
      if (dirty.current) void saveRef.current().catch(() => {});
    }, AUTOSAVE_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const updatePage = useCallback((patch: Partial<PageState>) => {
    setPage((p) => {
      dirty.current = true;
      const base = { ...(p || {}) };
      if (patch.blocks) {
        const nb = normalizeBlocksClient(patch.blocks);
        return syncBlocksToPage(nb, base);
      }
      return { ...base, ...patch };
    });
  }, [syncBlocksToPage]);

  const setBlocks = useCallback(
    (next: CanvasBlock[] | ((prev: CanvasBlock[]) => CanvasBlock[])) => {
      setPage((p) => {
        dirty.current = true;
        const prev = normalizeBlocksClient(p?.blocks ?? p?.components ?? []);
        const resolved = typeof next === 'function' ? (next as (b: CanvasBlock[]) => CanvasBlock[])(prev) : next;
        return syncBlocksToPage(normalizeBlocksClient(resolved), p);
      });
    },
    [syncBlocksToPage]
  );

  const updateBlockContent = useCallback(
    (id: string, content: Record<string, unknown>) => {
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, content: { ...b.content, ...content } } : b))
      );
    },
    [setBlocks]
  );

  const removeBlock = useCallback(
    (id: string) => {
      setBlocks((prev) => prev.filter((b) => b.id !== id));
    },
    [setBlocks]
  );

  return {
    page,
    blocks,
    loading,
    error,
    saving,
    lastSaved,
    reload: load,
    save,
    updatePage,
    setBlocks,
    updateBlockContent,
    removeBlock,
    markDirty: () => {
      dirty.current = true;
    },
  };
}
