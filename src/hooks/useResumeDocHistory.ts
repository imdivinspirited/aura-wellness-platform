import { useCallback, useState, type SetStateAction } from 'react';
import type { ResumeDocumentV1 } from '@/lib/resume/types';
import { cloneResume } from '@/lib/resume/primitives/document';

const MAX_STACK = 80;

/**
 * Undo/redo for resume document edits (Cmd/Ctrl+Z, Shift+Cmd+Z).
 */
export function useResumeDocHistory(initial: ResumeDocumentV1) {
  const [past, setPast] = useState<ResumeDocumentV1[]>([]);
  const [present, setPresent] = useState<ResumeDocumentV1>(initial);
  const [future, setFuture] = useState<ResumeDocumentV1[]>([]);

  const setDoc = useCallback((update: SetStateAction<ResumeDocumentV1>) => {
    setPresent((prev) => {
      const next = typeof update === 'function' ? (update as (p: ResumeDocumentV1) => ResumeDocumentV1)(prev) : update;
      if (next === prev) return prev;
      setPast((p) => [...p.slice(-(MAX_STACK - 1)), cloneResume(prev)]);
      setFuture([]);
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const prevSnapshot = p[p.length - 1]!;
      setPresent((cur) => {
        setFuture((f) => [cloneResume(cur), ...f].slice(0, MAX_STACK));
        return cloneResume(prevSnapshot);
      });
      return p.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const nextSnapshot = f[0]!;
      setPresent((cur) => {
        setPast((p) => [...p.slice(-(MAX_STACK - 1)), cloneResume(cur)]);
        return cloneResume(nextSnapshot);
      });
      return f.slice(1);
    });
  }, []);

  /** Replace document and clear history (initial load / reset). */
  const resetHistory = useCallback((next: ResumeDocumentV1) => {
    setPresent(next);
    setPast([]);
    setFuture([]);
  }, []);

  return {
    doc: present,
    setDoc,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    resetHistory,
  };
}
