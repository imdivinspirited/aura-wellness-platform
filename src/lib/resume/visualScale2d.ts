import type { VisualScale2D } from '@/lib/resume/types';

/** Canvas-only zoom range (wider than PDF typography so layout can breathe). */
const SCALE_MIN = 0.5;
const SCALE_MAX = 2;

export function clampScale1d(n: number): number {
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, n));
}

/** Legacy single number → both axes; partial objects filled with 1. */
export function normalizeVisualScale(
  v: number | VisualScale2D | null | undefined
): VisualScale2D {
  if (v == null) return { x: 1, y: 1 };
  if (typeof v === 'number') {
    const c = clampScale1d(v);
    return { x: c, y: c };
  }
  return {
    x: clampScale1d(v.x ?? 1),
    y: clampScale1d(v.y ?? 1),
  };
}
