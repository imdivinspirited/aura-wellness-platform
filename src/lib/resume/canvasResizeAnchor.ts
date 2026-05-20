/** Which handle last set the scale anchor (opposite side stays fixed in the canvas). */
export type CanvasResizeAnchor = 'n' | 's' | 'e' | 'w' | 'se';

/** CSS transform-origin for scale() so one edge stays fixed. */
export const ANCHOR_TO_TRANSFORM_ORIGIN: Record<CanvasResizeAnchor, string> = {
  /** Top handle: bottom edge fixed */
  n: 'center bottom',
  /** Bottom handle: top edge fixed */
  s: 'center top',
  /** Right handle: left edge fixed */
  e: 'left center',
  /** Left handle: right edge fixed */
  w: 'right center',
  /** Corner: top-left fixed */
  se: 'left top',
};

export function transformOriginForAnchor(anchor: CanvasResizeAnchor | undefined | null): string {
  if (!anchor) return 'center top';
  return ANCHOR_TO_TRANSFORM_ORIGIN[anchor];
}
