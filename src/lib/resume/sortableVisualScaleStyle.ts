import type { CSSProperties } from 'react';
import type { Transform } from '@dnd-kit/utilities';
import { CSS } from '@dnd-kit/utilities';

/**
 * dnd-kit sortable item: **translate only** (no CSS scale).
 * Visual “resize” is applied via font-size multipliers so text reflows instead of bitmap-shrinking.
 */
export function sortableDragOnlyStyle(
  transform: Transform | null,
  transition: string | undefined,
  extra?: Pick<CSSProperties, 'zIndex'>
): CSSProperties {
  const t = transform ? CSS.Transform.toString(transform) : '';
  return {
    ...extra,
    transform: t || undefined,
    transition,
  };
}
